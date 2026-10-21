import React from 'react';

// Route: /status (Registration Status Page placeholder)
export const StatusPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Cek Status Pendaftaran</h1>
        <p className="text-gray-600">Halaman pengecekan status pendaftaran santri sedang disiapkan.</p>
      </div>
    </div>
  );
};

export default StatusPage;
