import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { DatabaseIcon, Plus, Search, Car, ChevronRight, ArrowLeft, Building2, Lock, ParkingCircle } from 'lucide-react';

export default function Database() {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showPoliceStationModal, setShowPoliceStationModal] = useState(false);
  const [policeStation, setPoliceStation] = useState('');
  const [selectedPlate, setSelectedPlate] = useState('');
  const [newEntry, setNewEntry] = useState({
    plate: '',
    owner: '',
    vehicle: '',
    color: '',
    phone: '',
    email: '',
    tcNo: ''
  });
  const [searchParams, setSearchParams] = useState({
    name: '',
    phone: '',
    tcNo: '',
    plate: '',
    email: ''
  });

  const { addPlateInfo, plateData, socket } = useStore();
  const [searchResults, setSearchResults] = useState<typeof plateData>([]);

  useEffect(() => {
    if (showSearchForm) {
      setSearchResults(plateData);
    }
  }, [showSearchForm, plateData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(newEntry).every(val => val)) {
      addPlateInfo(newEntry);
      setShowPoliceStationModal(true);
      setSelectedPlate(newEntry.plate);
      setNewEntry({
        plate: '',
        owner: '',
        vehicle: '',
        color: '',
        phone: '',
        email: '',
        tcNo: ''
      });
      setShowAddForm(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = plateData.filter(entry => {
      return (
        (!searchParams.name || entry.owner.toLowerCase().includes(searchParams.name.toLowerCase())) &&
        (!searchParams.phone || entry.phone.includes(searchParams.phone)) &&
        (!searchParams.tcNo || entry.tcNo.includes(searchParams.tcNo)) &&
        (!searchParams.plate || entry.plate.toLowerCase().includes(searchParams.plate.toLowerCase())) &&
        (!searchParams.email || entry.email.toLowerCase().includes(searchParams.email.toLowerCase()))
      );
    });
    setSearchResults(results);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isNewEntry: boolean = false) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (isNewEntry) {
        setNewEntry({ ...newEntry, phone: value });
      } else {
        setSearchParams({ ...searchParams, phone: value });
      }
    }
  };

  const handleVehicleControl = (plate: string, action: 'engine' | 'parking') => {
    socket.emit('vehicleControl', {
      plate,
      action,
      command: action === 'engine' ? 'STOP_ENGINE' : 'AUTO_PARK'
    });
  };

  const sortedPlateData = [...plateData].sort((a, b) => a.plate.localeCompare(b.plate));
  const displayData = showSearchForm ? searchResults : sortedPlateData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="animated-bg"></div>
      
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <DatabaseIcon className="h-8 w-8 text-white mr-3" />
            <motion.h1 
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Plaka Veritabanı
            </motion.h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 rounded-md text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            İhbar Sayfasına Dön
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6 shadow-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setShowSearchForm(false);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                    showAddForm
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Plus className="h-5 w-5 mx-auto" />
                  Bilgi Ekle
                </button>
                <button
                  onClick={() => {
                    setShowSearchForm(true);
                    setShowAddForm(false);
                    setSearchResults(plateData);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                    showSearchForm
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Search className="h-5 w-5 mx-auto" />
                  Bilgi Sorgula
                </button>
              </div>

              <AnimatePresence>
                {(showAddForm || showSearchForm) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      {showAddForm ? 'Yeni Kayıt Ekle' : 'Kayıt Ara'}
                    </h3>
                    <form onSubmit={showAddForm ? handleSubmit : handleSearch} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          Plaka
                        </label>
                        <input
                          type="text"
                          value={showAddForm ? newEntry.plate : searchParams.plate}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            showAddForm
                              ? setNewEntry({ ...newEntry, plate: value })
                              : setSearchParams({ ...searchParams, plate: value });
                          }}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50"
                          placeholder="34 ABC 123"
                        />
                      </div>

                      {showAddForm && (
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            TC Kimlik No
                          </label>
                          <input
                            type="text"
                            value={newEntry.tcNo}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 11) {
                                setNewEntry({ ...newEntry, tcNo: value });
                              }
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50"
                            placeholder="12345678901"
                            maxLength={11}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          Ad Soyad
                        </label>
                        <input
                          type="text"
                          value={showAddForm ? newEntry.owner : searchParams.name}
                          onChange={(e) => {
                            showAddForm
                              ? setNewEntry({ ...newEntry, owner: e.target.value })
                              : setSearchParams({ ...searchParams, name: e.target.value });
                          }}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50"
                          placeholder="Ad Soyad"
                        />
                      </div>

                      {showAddForm && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              Araç
                            </label>
                            <input
                              type="text"
                              value={newEntry.vehicle}
                              onChange={(e) => setNewEntry({ ...newEntry, vehicle: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50"
                              placeholder="Marka Model"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              Renk
                            </label>
                            <input
                              type="text"
                              value={newEntry.color}
                              onChange={(e) => setNewEntry({ ...newEntry, color: e.target.value })}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50"
                              placeholder="Araç Rengi"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={formatPhoneNumber(showAddForm ? newEntry.phone : searchParams.phone)}
                          onChange={(e) => handlePhoneChange(e, showAddForm)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50"
                          placeholder="0555 555 55 55"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          E-posta
                        </label>
                        <input
                          type="email"
                          value={showAddForm ? newEntry.email : searchParams.email}
                          onChange={(e) => {
                            showAddForm
                              ? setNewEntry({ ...newEntry, email: e.target.value })
                              : setSearchParams({ ...searchParams, email: e.target.value });
                          }}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50"
                          placeholder="ornek@email.com"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                      >
                        {showAddForm ? 'Kaydet' : 'Ara'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="col-span-9">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-white">
                {showSearchForm ? 'Arama Sonuçları' : 'Tüm Kayıtlar'}
              </h2>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {displayData.map((entry) => (
                    <motion.div
                      key={entry.plate}
                      className="border border-white/20 rounded-lg p-4 flex items-center justify-between hover:bg-white/5 transition-all duration-300 group backdrop-blur-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-indigo-400 mr-2 group-hover:text-indigo-300 transition-colors duration-300" />
                        <span className="text-white">{entry.plate}</span>
                        <span className="ml-2 px-2 py-1 bg-white/10 rounded text-sm text-white/80 group-hover:bg-white/20 transition-colors duration-300">
                          {entry.owner}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleVehicleControl(entry.plate, 'engine')}
                          className="text-yellow-500/80 hover:text-yellow-500 transition-colors duration-200"
                          title="Motoru Durdur"
                        >
                          <Lock className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleVehicleControl(entry.plate, 'parking')}
                          className="text-green-500/80 hover:text-green-500 transition-colors duration-200"
                          title="Otomatik Park"
                        >
                          <ParkingCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSelectedEntry(
                            selectedEntry === entry.plate ? null : entry.plate
                          )}
                          className="text-white/60 hover:text-white transition-colors duration-200"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {selectedEntry && (
                  <motion.div 
                    className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h3 className="font-semibold mb-4 text-white">Detaylı Bilgiler</h3>
                    {(() => {
                      const entry = plateData.find(p => p.plate === selectedEntry);
                      if (!entry) return null;
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-white/60">Plaka</p>
                            <p className="font-medium text-white">{entry.plate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">TC Kimlik No</p>
                            <p className="font-medium text-white">{entry.tcNo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Araç Sahibi</p>
                            <p className="font-medium text-white">{entry.owner}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Araç</p>
                            <p className="font-medium text-white">{entry.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Renk</p>
                            <p className="font-medium text-white">{entry.color}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">Telefon</p>
                            <p className="font-medium text-white">{formatPhoneNumber(entry.phone)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/60">E-posta</p>
                            <p className="font-medium text-white">{entry.email}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}