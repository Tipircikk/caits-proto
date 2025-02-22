import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Shield, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (username.length !== 11 || !/^\d+$/.test(username)) {
      setError('TC Kimlik No 11 haneli bir sayı olmalıdır');
      return;
    }

    try {
      await resetPassword(username, email);
      setSuccess(true);
    } catch (err) {
      setError('Şifre sıfırlama işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="animated-bg"></div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-8 rounded-lg shadow-2xl w-full max-w-md text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex justify-center mb-8"
          >
            <Shield className="h-16 w-16 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-8"
          >
            Şifremi Unuttum
          </motion.h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-500/20 text-red-100 rounded-md text-sm backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-green-400 mb-4">
                Şifre sıfırlama talimatları e-posta adresinize gönderildi.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:underline"
              >
                Giriş sayfasına dön
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                  maxLength={11}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white/10 backdrop-blur-sm text-white py-2 px-4 rounded-md hover:bg-white/20 transition-colors flex items-center justify-center border border-white/20"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    İşleniyor...
                  </>
                ) : (
                  'Şifremi Sıfırla'
                )}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-white/60">
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:underline"
            >
              Giriş sayfasına dön
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}