import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AlertCircle, ChevronRight, CheckCircle, LogOut, Car, Shield, Lock, ParkingCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlateDatabase from './PlateDatabase';

export default function Dashboard() {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<number | null>(null);
  const [licensePlate, setLicensePlate] = useState('');
  const [showPoliceStationModal, setShowPoliceStationModal] = useState(false);
  const [policeStation, setPoliceStation] = useState('');
  const [stationType, setStationType] = useState<'POLICE' | 'GENDARMERIE'>('POLICE');
  const [resolvingComplaintId, setResolvingComplaintId] = useState<number | null>(null);
  const { complaints, addComplaint, resolveComplaint, logout, getPlateInfo, pendingUsers, currentUser } = useStore();
  
  const activeComplaints = complaints.filter(c => !c.isResolved);
  const resolvedComplaints = complaints.filter(c => c.isResolved);

  useEffect(() => {
    const unreadCount = pendingUsers.length;
    if (unreadCount > 0 && currentUser?.role === 'ADMIN') {
      document.title = `(${unreadCount}) İhbar Takip Sistemi`;
    } else {
      document.title = 'İhbar Takip Sistemi';
    }
  }, [pendingUsers.length, currentUser]);

  const handleAddComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licensePlate) {
      alert('Lütfen plaka giriniz');
      return;
    }
    
    const plateInfo = getPlateInfo(licensePlate);
    if (!plateInfo) {
      alert('Bu plaka veritabanında kayıtlı değil!');
      return;
    }
    
    addComplaint({
      title: `İhbar${complaints.length + 1}`,
      licensePlate,
      gpsLocation: "41.0082° N, 28.9784° E",
      cameraStatus: "Aktif",
      vehicleStatus: "Çalışıyor",
      isResolved: false
    });
    setShowComplaintForm(false);
    setLicensePlate('');
  };

  const handleResolveClick = (complaintId: number) => {
    setResolvingComplaintId(complaintId);
    setShowPoliceStationModal(true);
    setSelectedComplaint(null);
  };

  const handleResolveConfirm = () => {
    if (resolvingComplaintId && policeStation) {
      const complaint = complaints.find(c => c.id === resolvingComplaintId);
      if (complaint) {
        resolveComplaint(resolvingComplaintId, `${stationType === 'POLICE' ? 'Polis Merkezi: ' : 'Jandarma Karakolu: '}${policeStation}`);
      }
      setShowPoliceStationModal(false);
      setPoliceStation('');
      setResolvingComplaintId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white mr-3" />
            <motion.h1 
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              İhbar Takip Sistemi
            </motion.h1>
          </div>
          <div className="flex items-center space-x-4">
            <PlateDatabase />
            <button
              onClick={() => window.location.href = '/pending-approvals'}
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200 relative"
            >
              Kayıt Onayı
              {pendingUsers.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingUsers.length}
                </span>
              )}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => logout()}
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Çıkış Yap
            </motion.button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sol Sidebar */}
          <div className="col-span-3">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setShowComplaintForm(true)}
                className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600/80 hover:bg-blue-600 transition-colors duration-200"
              >
                İhbar Ekle
              </button>

              <AnimatePresence>
                {showComplaintForm && (
                  <motion.form 
                    onSubmit={handleAddComplaint} 
                    className="mt-4 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-1">
                        Plaka
                      </label>
                      <input
                        type="text"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                        placeholder="34 ABC 123"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-green-600/80 hover:bg-green-600 transition-colors duration-200"
                    >
                      Onayla
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Ana İçerik */}
          <div className="col-span-9">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Etkin İhbarlar</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {activeComplaints.map((complaint) => (
                    <motion.div
                      key={complaint.id}
                      className="border border-white/20 rounded-lg p-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-white">{complaint.title}</span>
                        <span className="ml-2 px-2 py-1 bg-white/10 rounded text-sm text-white/80">
                          {complaint.licensePlate}
                        </span>
                        {complaint.engineRunning && (
                          <Lock className="h-5 w-5 text-yellow-500 ml-2" title="Araç Hareket Halinde" />
                        )}
                        {complaint.autoParking && (
                          <ParkingCircle className="h-5 w-5 text-green-500 ml-2" title="Otomatik Park Modunda" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setSelectedComplaint(
                            selectedComplaint === complaint.id ? null : complaint.id
                          )}
                          className="text-white/60 hover:text-white transition-colors duration-200"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleResolveClick(complaint.id)}
                          className="text-green-500/80 hover:text-green-500 transition-colors duration-200"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {selectedComplaint && activeComplaints.find(c => c.id === selectedComplaint) && (
                  <motion.div 
                    className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-semibold mb-4 text-white">İhbar Detayları</h3>
                    <div className="space-y-4">
                      {(() => {
                        const complaint = activeComplaints.find(c => c.id === selectedComplaint)!;
                        const plateInfo = getPlateInfo(complaint.licensePlate);
                        return (
                          <>
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                              <h4 className="font-medium text-white mb-2 flex items-center">
                                <Car className="h-5 w-5 mr-2 text-blue-400" />
                                Araç Bilgileri
                              </h4>
                              {plateInfo ? (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-white/60">Plaka</p>
                                    <p className="font-medium text-white">{plateInfo.plate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-white/60">Sahibi</p>
                                    <p className="font-medium text-white">{plateInfo.owner}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-white/60">Araç</p>
                                    <p className="font-medium text-white">{plateInfo.vehicle}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-white/60">Renk</p>
                                    <p className="font-medium text-white">{plateInfo.color}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-white/60">Plaka bilgisi bulunamadı</p>
                              )}
                            </div>
                            <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                              <h4 className="font-medium text-white mb-2">Sistem Durumu</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-white/60">GPS</p>
                                  <p className="font-medium text-white">{complaint.gpsLocation}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-white/60">Kamera</p>
                                  <p className="font-medium text-white">{complaint.cameraStatus}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-white/60">Araç Durumu</p>
                                  <p className="font-medium text-white">{complaint.vehicleStatus}</p>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                className="mt-8 pt-6 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex justify-between text-sm text-white/60">
                  <p>Toplam İhbar Sayısı: {complaints.length}</p>
                  <p>Çözülen İhbar Sayısı: {resolvedComplaints.length}</p>
                </div>
              </motion.div>
            </motion.div>
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
                <h3 className="text-lg font-semibold mb-4 text-white">Polis Merkezi Bilgisi</h3>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setStationType('POLICE')}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                      stationType === 'POLICE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    Polis
                  </button>
                  <button
                    onClick={() => setStationType('GENDARMERIE')}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                      stationType === 'GENDARMERIE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    Jandarma
                  </button>
                </div>
                <input
                  type="text"
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  placeholder={stationType === 'POLICE' ? 'Polis Merkezi Adı' : 'Jandarma Karakolu Adı'}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 mb-4"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowPoliceStationModal(false);
                      setPoliceStation('');
                      setResolvingComplaintId(null);
                    }}
                    className="px-4 py-2 text-white/60 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleResolveConfirm}
                    className="px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-md transition-colors duration-200"
                  >
                    Onayla
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-8 text-center text-sm text-white/40">
          © 2024 Kromatik Zihinler. Tüm hakları saklıdır.
        </footer>
      </div>
    </div>
  );
}