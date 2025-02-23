import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LogOut, UserCheck, Car, Power, Lock, ParkingCircle, ChevronRight, ChevronDown, Users } from 'lucide-react';
import PlateDatabase from './PlateDatabase';

export default function Dashboard() {
  const [licensePlate, setLicensePlate] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<number | null>(null);
  const [policeStation, setPoliceStation] = useState('');
  const [showPoliceStationModal, setShowPoliceStationModal] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const {
    currentUser,
    complaints,
    pendingUsers,
    users,
    logout,
    addComplaint,
    resolveComplaint,
    getPlateInfo,
    socket,
    updateVehicleStatus
  } = useStore();

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

  useEffect(() => {
    socket.on('deviceData', (data) => {
      console.log('Cihaz verisi alındı:', data);
    });

    socket.on('complaintNotification', (data) => {
      setNotificationMessage(data.message);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    });

    return () => {
      socket.off('deviceData');
      socket.off('complaintNotification');
    };
  }, [socket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!licensePlate.trim()) {
      setNotificationMessage('Lütfen bir plaka giriniz');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    const plateInfo = getPlateInfo(licensePlate.toUpperCase());
    if (!plateInfo) {
      setNotificationMessage('Plaka bulunamadı');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    addComplaint({
      title: `${licensePlate.toUpperCase()} plakalı araç bildirimi`,
      licensePlate: licensePlate.toUpperCase(),
      gpsLocation: "Konum bilgisi alınıyor...",
      cameraStatus: "Kamera durumu kontrol ediliyor...",
      vehicleStatus: "Araç durumu kontrol ediliyor...",
      isResolved: false,
      engineRunning: false,
      autoParking: false
    });

    setLicensePlate('');
    setNotificationMessage('İhbar başarıyla kaydedildi');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleResolve = (complaintId: number) => {
    setSelectedComplaint(complaintId);
    setShowPoliceStationModal(true);
  };

  const confirmResolve = () => {
    if (selectedComplaint !== null && policeStation) {
      resolveComplaint(selectedComplaint, policeStation);
      setShowPoliceStationModal(false);
      setPoliceStation('');
      setSelectedComplaint(null);
    }
  };

  const handleEngineControl = (complaintId: number, engineRunning: boolean) => {
    updateVehicleStatus(complaintId, engineRunning, false);
    socket.emit('deviceCommand', { command: engineRunning ? 'START' : 'STOP' });
  };

  const handleParkControl = (complaintId: number) => {
    updateVehicleStatus(complaintId, false, true);
    socket.emit('deviceCommand', { command: 'PARK' });
  };

  const handleLockControl = (complaintId: number) => {
    socket.emit('deviceCommand', { command: 'LOCK' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="animated-bg"></div>
      
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">İhbar Takip Sistemi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
              >
                <Users className="h-5 w-5 mr-2" />
                Kullanıcılar
              </button>
              <PlateDatabase />
              {useStore.getState().canApproveUsers(currentUser!) && (
                <button
                  onClick={() => window.location.href = '/pending-approvals'}
                  className="flex items-center text-white/80 hover:text-white transition-colors duration-200 relative"
                >
                  <UserCheck className="h-5 w-5 mr-2" />
                  Onay Bekleyenler
                  {pendingUsers.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingUsers.length}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Panel - İhbar Formu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10"
          >
            <h2 className="text-xl font-semibold mb-6 text-white">Yeni İhbar</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Araç Plakası
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  placeholder="34 ABC 123"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600/40 hover:bg-indigo-600/60 text-white py-2 px-4 rounded-md transition-colors duration-200 border border-indigo-500/50"
              >
                İhbar Oluştur
              </button>
            </form>
          </motion.div>

          {/* Sağ Panel - İhbar Listesi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10"
          >
            <h2 className="text-xl font-semibold mb-6 text-white">İhbar Listesi</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {complaints.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-white/60 py-8"
                  >
                    Henüz ihbar bulunmamaktadır.
                  </motion.div>
                ) : (
                  complaints.map((complaint) => (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`bg-white/5 rounded-lg p-4 border ${
                        complaint.isResolved
                          ? 'border-green-500/20'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Car className="h-5 w-5 text-white/60 mr-2" />
                          <h3 className="font-medium text-white">
                            {complaint.licensePlate}
                          </h3>
                          {complaint.isResolved && (
                            <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Çözüldü
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-white/60">
                          {new Date(complaint.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="mb-4 text-sm text-white/80">
                        <div className="flex items-center justify-between mb-1">
                          <span>GPS Konumu:</span>
                          <span>{complaint.gpsLocation}</span>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span>Kamera Durumu:</span>
                          <span>{complaint.cameraStatus}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Araç Durumu:</span>
                          <span>{complaint.vehicleStatus}</span>
                        </div>
                      </div>

                      {!complaint.isResolved && (
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            {!complaint.engineRunning && (
                              <button
                                onClick={() => handleLockControl(complaint.id)}
                                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-md hover:bg-yellow-500/30 transition-colors duration-200 flex items-center"
                              >
                                <Lock className="h-4 w-4 mr-1" />
                                Kilitle
                              </button>
                            )}
                            {complaint.engineRunning && (
                              <button
                                onClick={() => handleParkControl(complaint.id)}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 transition-colors duration-200 flex items-center"
                              >
                                <ParkingCircle className="h-4 w-4 mr-1" />
                                Otonom Park
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => handleResolve(complaint.id)}
                            className="px-4 py-1 bg-indigo-600/20 text-indigo-400 rounded-md hover:bg-indigo-600/30 transition-colors duration-200"
                          >
                            Çözüldü
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Kullanıcı Listesi Modal */}
      <AnimatePresence>
        {showUserList && (
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
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Sistem Kullanıcıları</h3>
                <button
                  onClick={() => setShowUserList(false)}
                  className="text-white/60 hover:text-white transition-colors duration-200"
                >
                  <ChevronDown className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-white/60">İsim</p>
                        <p className="font-medium text-white">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Görev</p>
                        <p className="font-medium text-white">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Departman</p>
                        <p className="font-medium text-white">{user.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">TC Kimlik No</p>
                        <p className="font-medium text-white">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">E-posta</p>
                        <p className="font-medium text-white">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Telefon</p>
                        <p className="font-medium text-white">{user.phone}</p>
                      </div>
                      {user.station && (
                        <div className="col-span-2 md:col-span-3">
                          <p className="text-sm text-white/60">Görev Yeri</p>
                          <p className="font-medium text-white">
                            {user.stationType === 'POLICE' ? 'Polis Merkezi: ' : 'Jandarma Karakolu: '}
                            {user.station}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bildirim */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white shadow-lg"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
              <h3 className="text-lg font-semibold text-white mb-4">
                Polis Merkezi Bilgisi
              </h3>
              <input
                type="text"
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                placeholder="Polis Merkezi Adı"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPoliceStationModal(false);
                    setPoliceStation('');
                    setSelectedComplaint(null);
                  }}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={confirmResolve}
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