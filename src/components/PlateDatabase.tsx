import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from 'lucide-react';

export default function PlateDatabase() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/database')}
      className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
    >
      <Database className="h-5 w-5 mr-2" />
      Plaka Veritabanı
    </button>
  );
}