import React from 'react';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { UserCheck, UserX, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PendingApprovals() {
  const { pendingUsers, approveUser, rejectUser } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">Onay Bekleyen Hesaplar</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Ana Sayfaya Dön
          </button>
        </div>

        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-6 text-center text-white/60">
              Onay bekleyen hesap bulunmamaktadır.
            </div>
          ) : (
            pendingUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-6 border border-white/10"
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-white/60">İsim</p>
                    <p className="font-medium text-white">{user.name}</p>
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
                  <div>
                    <p className="text-sm text-white/60">Görev</p>
                    <p className="font-medium text-white">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Görev Yeri</p>
                    <p className="font-medium text-white">
                      {user.stationType === 'POLICE' ? 'Polis Merkezi: ' : 'Jandarma Karakolu: '}
                      {user.station}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => rejectUser(user.id)}
                    className="flex items-center px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-md transition-colors duration-200"
                  >
                    <UserX className="h-5 w-5 mr-2" />
                    Reddet
                  </button>
                  <button
                    onClick={() => approveUser(user.id)}
                    className="flex items-center px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-500 rounded-md transition-colors duration-200"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    Onayla
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}