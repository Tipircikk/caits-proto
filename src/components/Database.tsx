import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Database as DatabaseIcon, Plus, Search, Car, ChevronRight, ArrowLeft, Building2 } from 'lucide-react';

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

  const { addPlateInfo, plateData } = useStore();
  const [searchResults, setSearchResults] = useState<typeof plateData>([]);

  // Arama formu açıldığında tüm kayıtları göster
  useEffect(() => {
    if (showSearchForm) {
      setSearchResults(plateData);
    }
  }, [showSearchForm, plateData]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const sortedPlateData = [...plateData].sort((a, b) => a.plate.localeCompare(b.plate));
  const displayData = showSearchForm ? searchResults : sortedPlateData;

  const buttonClasses = "w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg";
  const activeButtonClasses = "bg-indigo-600/40 hover:bg-indigo-600/60 text-white border-indigo-500/50";
  const inactiveButtonClasses = "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white";

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
          {/* Sol Sidebar */}
          <div className="col-span-3">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6 shadow-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setShowSearchForm(false);
                  setSelectedEntry(null);
                }}
                className={`${buttonClasses} ${showAddForm ? activeButtonClasses : inactiveButtonClasses} mb-3`}
              >
                <Plus className="h-5 w-5 inline-block mr-2" />
                Bilgi Ekle
              </button>

              <button
                onClick={() => {
                  setShowSearchForm(true);
                  setShowAddForm(false);
                  setSelectedEntry(null);
                  setSearchResults(plateData); // Tüm kayıtları göster
                }}
                className={`${buttonClasses} ${showSearchForm ? activeButtonClasses : inactiveButtonClasses}`}
              >
                <Search className="h-5 w-5 inline-block mr-2" />
                Bilgi Sorgula
              </button>

              <AnimatePresence>
                {showAddForm && (
                  <motion.form 
                    onSubmit={handleSubmit} 
                    className="mt-4 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Plaka</label>
                        <input
                          type="text"
                          value={newEntry.plate}
                          onChange={(e) => setNewEntry({ ...newEntry, plate: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="34 ABC 123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">TC Kimlik No</label>
                        <input
                          type="text"
                          value={newEntry.tcNo}
                          onChange={(e) => setNewEntry({ ...newEntry, tcNo: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="12345678901"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Araç Sahibi</label>
                        <input
                          type="text"
                          value={newEntry.owner}
                          onChange={(e) => setNewEntry({ ...newEntry, owner: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Araç</label>
                        <input
                          type="text"
                          value={newEntry.vehicle}
                          onChange={(e) => setNewEntry({ ...newEntry, vehicle: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="Marka Model"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Renk</label>
                        <input
                          type="text"
                          value={newEntry.color}
                          onChange={(e) => setNewEntry({ ...newEntry, color: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="Araç Rengi"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Telefon</label>
                        <input
                          type="tel"
                          value={newEntry.phone}
                          onChange={(e) => setNewEntry({ ...newEntry, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="0532 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">E-posta</label>
                        <input
                          type="email"
                          value={newEntry.email}
                          onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={`${buttonClasses} bg-emerald-600/40 hover:bg-emerald-600/60 text-white border-emerald-500/50`}
                    >
                      Kaydet
                    </button>
                  </motion.form>
                )}

                {showSearchForm && (
                  <motion.form 
                    onSubmit={handleSearch} 
                    className="mt-4 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Ad Soyad</label>
                        <input
                          type="text"
                          value={searchParams.name}
                          onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">TC Kimlik No</label>
                        <input
                          type="text"
                          value={searchParams.tcNo}
                          onChange={(e) => setSearchParams({ ...searchParams, tcNo: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="12345678901"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Telefon</label>
                        <input
                          type="tel"
                          value={searchParams.phone}
                          onChange={(e) => setSearchParams({ ...searchParams, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="0532 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">Plaka</label>
                        <input
                          type="text"
                          value={searchParams.plate}
                          onChange={(e) => setSearchParams({ ...searchParams, plate: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="34 ABC 123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">E-posta</label>
                        <input
                          type="email"
                          value={searchParams.email}
                          onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className={`${buttonClasses} bg-emerald-600/40 hover:bg-emerald-600/60 text-white border-emerald-500/50`}
                    >
                      Ara
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Ana İçerik */}
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
                      <button
                        onClick={() => setSelectedEntry(
                          selectedEntry === entry.plate ? null : entry.plate
                        )}
                        className="text-white/60 hover:text-white transition-colors duration-300"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
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
                            <p className="font-medium text-white">{entry.phone}</p>
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

      {/* Polis Merkezi Modal */}
      <AnimatePresence>
        {showPoliceStationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center mb-4">
                <Building2 className="h-6 w-6 text-indigo-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Polis Merkezi Bilgisi</h3>
              </div>
              <p className="text-white/80 mb-4">
                {selectedPlate} plakalı araç için polis merkezi bilgisi giriniz.
              </p>
              <input
                type="text"
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                placeholder="Polis Merkezi Adı"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 mb-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPoliceStationModal(false);
                    setPoliceStation('');
                    setSelectedPlate('');
                  }}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    setShowPoliceStationModal(false);
                    setPoliceStation('');
                    setSelectedPlate('');
                  }}
                  className="px-4 py-2 bg-indigo-600/40 hover:bg-indigo-600/60 text-white rounded-md transition-colors duration-200 border border-indigo-500/50"
                >
                  Onayla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}