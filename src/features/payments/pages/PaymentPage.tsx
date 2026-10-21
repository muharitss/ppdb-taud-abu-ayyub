import React from 'react';
import { useParams } from 'react-router-dom';

// Route: /bayar/:registrationNumber (Payment Page placeholder)
export const PaymentPage: React.FC = () => {
  const { registrationNumber } = useParams<{ registrationNumber: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Konfirmasi Pembayaran</h1>
        <p className="text-gray-600 mb-4">Nomor Pendaftaran: <span className="font-mono font-semibold">{registrationNumber}</span></p>
        <p className="text-gray-500 text-sm">Halaman konfirmasi pembayaran sedang disiapkan.</p>
      </div>
    </div>
  );
};

export default PaymentPage;
