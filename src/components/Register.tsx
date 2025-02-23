import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Shield, Loader, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole, Department } from '../types';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    role: UserRole.CITIZEN,
    department: Department.CITIZEN,
    station: '',
    stationType: 'POLICE'
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useStore();
  const navigate = useNavigate();

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      errors: {
        minLength: !minLength ? 'En az 8 karakter uzunluğunda olmalı' : '',
        hasUpperCase: !hasUpperCase ? 'En az 1 büyük harf içermeli' : '',
        hasLowerCase: !hasLowerCase ? 'En az 1 küçük harf içermeli' : '',
        hasNumber: !hasNumber ? 'En az 1 sayı içermeli' : '',
        hasSpecialChar: !hasSpecialChar ? 'En az 1 özel karakter içermeli (!@#$%^&*(),.?":{}|<>)' : ''
      }
    };
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('0')) {
      value = value.slice(1);
    }
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phone: value }));
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 0) return '0';
    if (phone.length <= 3) return `0${phone}`;
    if (phone.length <= 6) return `0${phone.slice(0, 3)} ${phone.slice(3)}`;
    if (phone.length <= 8) return `0${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    return `0${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(Object.values(passwordValidation.errors).filter(e => e).join('\n'));
      return;
    }

    if (formData.username.length !== 11 || !/^\d+$/.test(formData.username)) {
      setError('TC Kimlik No 11 haneli bir sayı olmalıdır');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Geçerli bir telefon numarası giriniz (10 haneli)');
      return;
    }

    if (formData.role !== UserRole.CITIZEN && !formData.station) {
      setError('Lütfen görev yeri bilgisini giriniz');
      return;
    }

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
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
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Geri Dön
            </button>
            <Shield className="h-16 w-16 text-white" />
          </div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-8"
          >
            Kayıt Ol
          </motion.h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-500/20 text-red-100 rounded-md text-sm backdrop-blur-sm whitespace-pre-line"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                TC Kimlik No
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setFormData({ ...formData, username: value });
                  }
                }}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                maxLength={11}
                required
                placeholder="11 haneli TC Kimlik No"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ad Soyad
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                required
                placeholder="Ad Soyad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Görev
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  const department = role === UserRole.CITIZEN 
                    ? Department.CITIZEN 
                    : role.includes('POLICE') 
                      ? Department.POLICE 
                      : Department.GENDARMERIE;
                  setFormData({ 
                    ...formData, 
                    role, 
                    department,
                    stationType: role.includes('POLICE') ? 'POLICE' : 'GENDARMERIE'
                  });
                }}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                required
              >
                <option value={UserRole.CITIZEN}>Vatandaş</option>
                <option value={UserRole.POLICE_CHIEF}>Başkomiser</option>
                <option value={UserRole.POLICE_OFFICER}>Polis Memuru</option>
                <option value={UserRole.GENDARMERIE_COMMANDER}>Jandarma Komutanı</option>
                <option value={UserRole.GENDARMERIE}>Jandarma</option>
              </select>
            </div>

            {formData.role !== UserRole.CITIZEN && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Görev Yeri Türü
                  </label>
                  <select
                    value={formData.stationType}
                    onChange={(e) => setFormData({ ...formData, stationType: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                    required
                  >
                    <option value="POLICE">Polis Merkezi</option>
                    <option value="GENDARMERIE">Jandarma Karakolu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Görev Yeri Adı
                  </label>
                  <input
                    type="text"
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                    placeholder={formData.stationType === 'POLICE' ? 'Polis Merkezi Adı' : 'Jandarma Karakolu Adı'}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                E-posta
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                required
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formatPhoneNumber(formData.phone)}
                onChange={handlePhoneChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                required
                placeholder="05XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Şifre
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                required
              />
              <p className="mt-1 text-xs text-white/60">
                En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                  Kaydediliyor...
                </>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-white/60">
            Zaten hesabınız var mı?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-white hover:underline"
            >
              Giriş Yap
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}