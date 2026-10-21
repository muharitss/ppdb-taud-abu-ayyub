import React from 'react';
import { Outlet } from 'react-router-dom';

// Layout: /admin/* (Admin Layout placeholder)
export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-bold text-[var(--color-primary)]">Admin Panel PPDB</h2>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
