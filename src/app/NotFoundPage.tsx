import React from 'react';
import { Link } from 'react-router-dom';

// Route: * (Not Found Page placeholder)
export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">404</h1>
        <p className="text-gray-600 mb-6">Halaman yang Anda tuju tidak ditemukan.</p>
        <Link
          to="/"
          className="inline-block bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
