import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CreditCard, FileCheck2, Settings } from 'lucide-react';

interface AdminContextType {
  user: User;
  profile: AdminProfile | null;
}

export const AdminDashboardPage: React.FC = () => {
  const context = useOutletContext<AdminContextType>();
  const adminName = context?.profile?.full_name || 'Administrator';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-800">
          Selamat Datang, {adminName} 👋
        </h1>
        <p className="text-slate-600 mt-1">
          Panel kendali utama Penerimaan Peserta Didik Baru (PPDB) TAUD SaQu Abu Ayyub TP 2026/2027.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pendaftar</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">-</div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Menunggu modul antrean (Task 026)
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Verifikasi Pembayaran</CardTitle>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">-</div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Menunggu modul pembayaran (Task 018)
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Formulir Lengkap</CardTitle>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">-</div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Menunggu modul dokumen (Task 022)
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Konfigurasi PPDB</CardTitle>
            <Settings className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">Aktif</div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Periode TP 2026/2027
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
