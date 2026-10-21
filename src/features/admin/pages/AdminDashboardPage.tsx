import React from 'react';

// Route: /admin (Admin Dashboard Page placeholder)
export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-xl font-bold text-[var(--color-primary)] mb-2">Dashboard Admin</h1>
      <p className="text-gray-600">Dashboard ringkasan pendaftaran santri baru sedang disiapkan.</p>
    </div>
  );
};

export default AdminDashboardPage;
