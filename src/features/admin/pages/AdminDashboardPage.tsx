import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import {
  Users,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  FileCheck2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { SummaryCard } from '../components/SummaryCard';
import { RecentActivityTable } from '../components/RecentActivityTable';
import {
  getDashboardStats,
  getRecentAuditEvents,
  type DashboardStats,
  type AuditEventItem,
} from '../services/adminDashboard';

interface AdminContextType {
  user: User;
  profile: AdminProfile | null;
}

export const AdminDashboardPage: React.FC = () => {
  const context = useOutletContext<AdminContextType>();
  const adminName = context?.profile?.full_name || 'Administrator';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [statsData, eventsData] = await Promise.all([
        getDashboardStats(),
        getRecentAuditEvents(10),
      ]);
      setStats(statsData);
      setEvents(eventsData);
      setLastUpdated(new Date());
    } catch {
      // Fallback gracefully on background fetch error
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
    // Auto-refresh every 30 seconds
    const timer = setInterval(() => {
      loadData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  return (
    <div className="space-y-8">
      {/* Top Banner / Greeting */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Selamat Datang, {adminName} 👋
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Panel ringkasan dan status operasional PPDB TAUD SaQu Abu Ayyub TP 2026/2027.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden md:inline">
            Diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(false)}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Perbarui
          </Button>
        </div>
      </div>

      {/* Action Banner for Pending Payments */}
      {stats && stats.paymentSubmitted > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-amber-900">
                {stats.paymentSubmitted} Bukti Pembayaran Menunggu Verifikasi
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                Segera periksa bukti transfer untuk memvalidasi pendaftaran santri baru.
              </p>
            </div>
          </div>
          <Link to="/admin/pembayaran">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 w-full sm:w-auto">
              Buka Antrean Verifikasi
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Pendaftar"
          value={stats ? stats.total : null}
          description="Seluruh data pendaftaran yang tercatat"
          icon={Users}
          iconColor="text-blue-500"
          to="/admin/pendaftar"
        />

        <SummaryCard
          title="Antrean Pembayaran"
          value={stats ? stats.paymentSubmitted : null}
          description="Bukti transfer menunggu verifikasi"
          icon={CreditCard}
          iconColor="text-amber-500"
          className={stats && stats.paymentSubmitted > 0 ? "border-amber-200 bg-amber-50/20" : undefined}
          to="/admin/pembayaran"
        />

        <SummaryCard
          title="Menunggu Formulir Lengkap"
          value={stats ? stats.awaitingForm : null}
          description="Pendaftar sedang melengkapi data diri & berkas"
          icon={FileText}
          iconColor="text-indigo-500"
          to="/admin/pendaftar?status=awaiting_form"
        />

        <SummaryCard
          title="Formulir Lengkap Masuk"
          value={stats ? stats.submitted : null}
          description="Formulir & berkas siap ditinjau"
          icon={FileCheck2}
          iconColor="text-purple-500"
          to="/admin/pendaftar?status=submitted"
        />

        <SummaryCard
          title="Pendaftar Diterima"
          value={stats ? stats.accepted : null}
          description="Santri yang telah dinyatakan diterima"
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          to="/admin/pendaftar?status=accepted"
        />

        <SummaryCard
          title="Pendaftar Ditolak"
          value={stats ? stats.rejected : null}
          description="Pendaftaran yang ditolak / tidak memenuhi syarat"
          icon={XCircle}
          iconColor="text-red-500"
          to="/admin/pendaftar?status=rejected"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Aktivitas Sistem Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              10 rekaman jejak audit sistem terkini.
            </p>
          </div>
          <Link to="/admin/audit">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-slate-600">
              Lihat Semua Log Audit
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <RecentActivityTable events={events} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
