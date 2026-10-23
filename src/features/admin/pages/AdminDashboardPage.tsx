import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, CreditCard, FileCheck2, Settings } from 'lucide-react';
import { AdminPaymentListPage } from './AdminPaymentListPage';
import { supabase } from '@/lib/supabase/client';

interface AdminContextType {
  user: User;
  profile: AdminProfile | null;
}

export const AdminDashboardPage: React.FC = () => {
  const context = useOutletContext<AdminContextType>();
  const adminName = context?.profile?.full_name || 'Administrator';

  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [totalRegistrants, setTotalRegistrants] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const [regRes, payRes] = await Promise.all([
          supabase.from('registrations').select('*', { count: 'exact', head: true }),
          supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('payment_status', 'payment_submitted'),
        ]);

        if (isMounted) {
          if (regRes.count !== null) setTotalRegistrants(regRes.count);
          if (payRes.count !== null) setPendingCount(payRes.count);
        }
      } catch {
        // Fallback gracefully on stats error
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Selamat Datang, {adminName} 👋
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Panel kendali utama Penerimaan Peserta Didik Baru (PPDB) TAUD SaQu Abu Ayyub TP 2026/2027.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pendaftar</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {totalRegistrants !== null ? totalRegistrants : '...'}
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Seluruh pendaftar masuk
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-amber-900">Antrean Pembayaran</CardTitle>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {pendingCount !== null ? pendingCount : '...'}
            </div>
            <CardDescription className="text-xs text-amber-700 mt-1 font-medium">
              Menunggu verifikasi admin
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

      {/* Main Workspace: Antrean Pembayaran */}
      <AdminPaymentListPage />
    </div>
  );
};

export default AdminDashboardPage;
