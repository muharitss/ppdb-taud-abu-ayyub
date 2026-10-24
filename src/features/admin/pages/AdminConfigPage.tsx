import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getPpdbConfigs,
  savePpdbConfigs,
  type PpdbConfigValues,
} from '../services/adminConfig';
import {
  Settings,
  CreditCard,
  Phone,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminContextType {
  user: User;
  profile: AdminProfile | null;
}

export const AdminConfigPage: React.FC = () => {
  const context = useOutletContext<AdminContextType>();
  const adminId = context?.user?.id;

  const [form, setForm] = useState<PpdbConfigValues>({
    registration_open: true,
    ppdb_period: '2027/2028',
    registration_fee: 300000,
    bank_name: 'Bank Syariah Indonesia (BSI)',
    bank_account_number: '7216959997',
    bank_account_holder: 'TAUD SaQu Abu Ayyub',
    admin_whatsapp_primary: '6281367074138',
    admin_whatsapp_secondary: '6281367074138',
    open_date: '2026-11-01',
    close_date: '2026-12-31',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPpdbConfigs();
      setForm(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat konfigurasi PPDB');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleChange = <K extends keyof PpdbConfigValues>(key: K, value: PpdbConfigValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await savePpdbConfigs(form, adminId);
      toast.success('Pengaturan operasional PPDB berhasil disimpan!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm">Memuat konfigurasi PPDB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--color-primary)]" />
            Pengaturan Operasional PPDB
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola periode pendaftaran, rekening bank resmi, dan kontak layanan admin.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchConfig} className="text-xs">
            Coba Lagi
          </Button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Registration Status & Period */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Status & Periode Pendaftaran
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Mengontrol status buka/tutup pendaftaran di portal publik dan tanggal gelombang aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Status Pendaftaran</label>
                <select
                  value={form.registration_open ? 'open' : 'closed'}
                  onChange={(e) => handleChange('registration_open', e.target.value === 'open')}
                  className="mt-1.5 h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 shadow-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="open">🟢 Dibuka (Menerima Pendaftar Baru)</option>
                  <option value="closed">🔴 Ditutup Sementara</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Jika ditutup, calon orang tua tidak dapat mengisi pendaftaran baru.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tahun Pelajaran (Periode)</label>
                <Input
                  className="mt-1.5 text-sm"
                  value={form.ppdb_period}
                  onChange={(e) => handleChange('ppdb_period', e.target.value)}
                  placeholder="Contoh: 2027/2028"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tanggal Mulai Pendaftaran</label>
                <Input
                  type="date"
                  className="mt-1.5 text-sm"
                  value={form.open_date}
                  onChange={(e) => handleChange('open_date', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tanggal Selesai Pendaftaran</label>
                <Input
                  type="date"
                  className="mt-1.5 text-sm"
                  value={form.close_date}
                  onChange={(e) => handleChange('close_date', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Bank Account Info */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Rekening Resmi Pembayaran & Biaya
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Instruksi transfer yang ditampilkan ke orang tua saat tahap pembayaran biaya pendaftaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nominal Biaya Pendaftaran (Rp)</label>
                <Input
                  type="number"
                  className="mt-1.5 text-sm"
                  value={form.registration_fee}
                  onChange={(e) => handleChange('registration_fee', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Nama Bank Resmi</label>
                <Input
                  className="mt-1.5 text-sm"
                  value={form.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Nomor Rekening Bank</label>
                <Input
                  className="mt-1.5 text-sm font-mono"
                  value={form.bank_account_number}
                  onChange={(e) => handleChange('bank_account_number', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Atas Nama Rekening</label>
                <Input
                  className="mt-1.5 text-sm"
                  value={form.bank_account_holder}
                  onChange={(e) => handleChange('bank_account_holder', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: WhatsApp Contacts */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Kontak WhatsApp Layanan Admin
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Nomor WhatsApp yang dituju tombol bantuan dan konfirmasi manual orang tua.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">WhatsApp Admin Utama (Primary)</label>
                <Input
                  className="mt-1.5 text-sm font-mono"
                  placeholder="Contoh: 6281367074138"
                  value={form.admin_whatsapp_primary}
                  onChange={(e) => handleChange('admin_whatsapp_primary', e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Format internasional dengan awalan 62 tanpa spasi atau tanda +.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">WhatsApp Admin Kedua (Cadangan)</label>
                <Input
                  className="mt-1.5 text-sm font-mono"
                  placeholder="Contoh: 6281367074138"
                  value={form.admin_whatsapp_secondary}
                  onChange={(e) => handleChange('admin_whatsapp_secondary', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom save bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Simpan & Perbarui Sistem
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminConfigPage;
