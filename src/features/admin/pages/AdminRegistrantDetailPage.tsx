import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from '@/hooks/useAdminAuth';
import {
  getRegistrantFullDetail,
  updateRegistrantStatus,
  type RegistrantFullData,
} from '../services/adminDetail';
import { DocumentViewer } from '../components/DocumentViewer';
import { AuditLogSection } from '../components/AuditLogSection';
import { PaymentReviewCard } from '../components/PaymentReviewCard';
import type { RegistrantDetail, PaymentSummary } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  User as UserIcon,
  Heart,
  FileCheck2,
  CreditCard,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminContextType {
  user: User;
  profile: AdminProfile | null;
}

const REG_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draf', className: 'bg-slate-100 text-slate-700' },
  awaiting_payment: { label: 'Menunggu Pembayaran', className: 'bg-amber-100 text-amber-800' },
  awaiting_form: { label: 'Menunggu Pengisian Formulir', className: 'bg-blue-100 text-blue-800' },
  submitted: { label: 'Formulir Masuk', className: 'bg-purple-100 text-purple-800' },
  under_review: { label: 'Sedang Ditinjau', className: 'bg-indigo-100 text-indigo-800' },
  accepted: { label: 'Diterima', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Ditolak', className: 'bg-rose-100 text-rose-800' },
};

export const AdminRegistrantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useOutletContext<AdminContextType>();
  const adminId = context?.user?.id;

  const [data, setData] = useState<RegistrantFullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Dialog State
  const [targetStatus, setTargetStatus] = useState<'under_review' | 'accepted' | 'rejected' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRegistrantFullDetail(id);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat detail pendaftar');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusSubmit = async () => {
    if (!data || !targetStatus) return;

    if (targetStatus === 'rejected' && !reviewNotes.trim()) {
      toast.error('Catatan penolakan wajib diisi!');
      return;
    }

    setSubmittingStatus(true);
    try {
      await updateRegistrantStatus({
        registrationId: data.registration.id,
        registrationNumber: data.registration.registration_number,
        newStatus: targetStatus,
        reviewNotes: reviewNotes.trim(),
        adminId,
      });

      toast.success(
        targetStatus === 'accepted'
          ? `Pendaftar ${data.registration.registration_number} resmi DITERIMA!`
          : targetStatus === 'rejected'
          ? `Pendaftar ${data.registration.registration_number} telah DITOLAK.`
          : `Status pendaftar diubah menjadi Sedang Ditinjau.`
      );

      setTargetStatus(null);
      setReviewNotes('');
      fetchDetail();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status pendaftar');
    } finally {
      setSubmittingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm">Memuat berkas dokumen dan detail pendaftar...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin/pendaftar">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pendaftar
          </Button>
        </Link>
        <div className="p-8 bg-white border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Gagal Menampilkan Pendaftar</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {error || 'Data pendaftar dengan ID yang diminta tidak ditemukan.'}
          </p>
          <Button onClick={fetchDetail} variant="outline" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  const { registration, formData } = data;
  const statusInfo = REG_STATUS_LABELS[registration.status] || {
    label: registration.status,
    className: 'bg-slate-100 text-slate-700',
  };

  const child = (formData?.child || {}) as Record<string, string>;
  const father = (formData?.father || {}) as Record<string, string>;
  const mother = (formData?.mother || {}) as Record<string, string>;
  const health = (formData?.health || {}) as Record<string, string>;

  return (
    <div className="space-y-8 pb-12">
      {/* Back button & Header */}
      <div className="space-y-4">
        <Link to="/admin/pendaftar">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Pendaftar
          </Button>
        </Link>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">
                {registration.registration_number}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
              <span className="text-xs text-slate-500">
                TP {registration.ppdb_period}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              {registration.child_name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Orang Tua / Wali: <span className="font-medium text-slate-700">{registration.parent_name}</span> &bull; Kontak:{' '}
              <a
                href={`https://wa.me/${registration.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <Phone className="w-3 h-3" />
                {registration.whatsapp_number}
              </a>
            </p>
          </div>

          {/* Action Decision Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {registration.status !== 'under_review' && registration.status !== 'accepted' && registration.status !== 'rejected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetStatus('under_review')}
                className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                <Clock className="w-3.5 h-3.5" />
                Tandai Sedang Ditinjau
              </Button>
            )}

            {registration.status !== 'accepted' && (
              <Button
                size="sm"
                onClick={() => setTargetStatus('accepted')}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terima Pendaftar
              </Button>
            )}

            {registration.status !== 'rejected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetStatus('rejected')}
                className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Tolak Pendaftar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Review Notes Alert if rejected or has notes */}
      {registration.review_notes && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-sm">
          <p className="font-semibold text-xs text-amber-800">Catatan Review Admin:</p>
          <p className="mt-1">{registration.review_notes}</p>
        </div>
      )}

      {/* Payment Section (If submitted and pending verification, show review card) */}
      {registration.payment_status === 'payment_submitted' && (
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-500" />
            Verifikasi Pembayaran Diperlukan
          </h2>
          <PaymentReviewCard
            registrant={{
              id: registration.id,
              registration_number: registration.registration_number,
              child_name: registration.child_name,
              parent_name: registration.parent_name,
              whatsapp_number: registration.whatsapp_number,
              status: registration.status,
              payment_status: registration.payment_status as RegistrantDetail['payment_status'],
              review_notes: registration.review_notes,
              created_at: registration.created_at,
              ppdb_period: registration.ppdb_period,
              payments: (data.payments || []) as unknown as PaymentSummary[],
            }}
            onStatusUpdated={fetchDetail}
          />
        </div>
      )}

      {/* Section 1: Uploaded Documents */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          Berkas Dokumen Persyaratan
        </h2>
        <DocumentViewer documents={data.documents} />
      </div>

      {/* Section 2: Full Form Data */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-blue-600" />
          Data Formulir Pendaftaran Lengkap
        </h2>

        {!formData ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-400 text-xs">
            Formulir pendaftaran lengkap belum diisi atau disimpan oleh pendaftar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Child Data */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Data Calon Santri
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-semibold text-slate-800">{child.fullName || registration.child_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Nama Panggilan</span>
                  <span className="text-slate-800">{child.nickname || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">NIK (16 Digit)</span>
                  <span className="font-mono text-slate-800">{child.nik || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Jenis Kelamin</span>
                  <span className="text-slate-800">{child.gender === 'male' ? 'Laki-laki' : child.gender === 'female' ? 'Perempuan' : '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Tempat, Tgl Lahir</span>
                  <span className="text-slate-800">
                    {child.birthPlace ? `${child.birthPlace}, ` : ''}{child.birthDate || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Anak ke- / Dari</span>
                  <span className="text-slate-800">
                    {child.childOrder ? `Ke-${child.childOrder}` : '-'} / {child.siblingCount ? `${child.siblingCount} bersaudara` : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Health Data */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Kesehatan & Kebutuhan Khusus
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Golongan Darah</span>
                  <span className="font-semibold text-slate-800">{health.bloodType || 'Tidak Tahu / -'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Riwayat Penyakit</span>
                  <span className="text-slate-800">{health.illnessHistory || 'Tidak ada'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Riwayat Alergi</span>
                  <span className="text-slate-800">{health.allergies || 'Tidak ada'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Kebutuhan Khusus</span>
                  <span className="text-slate-800">{health.specialNeeds || 'Tidak ada'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Father Data */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Data Ayah Kandung
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-semibold text-slate-800">{father.fullName || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">NIK (16 Digit)</span>
                  <span className="font-mono text-slate-800">{father.nik || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Pendidikan Terakhir</span>
                  <span className="text-slate-800">{father.lastEducation || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Pekerjaan</span>
                  <span className="text-slate-800">{father.occupation || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Penghasilan Bulanan</span>
                  <span className="text-slate-800">{father.monthlyIncome || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Nomor HP/WA</span>
                  <span className="text-slate-800">{father.phone || '-'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Mother Data */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Data Ibu Kandung
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-semibold text-slate-800">{mother.fullName || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">NIK (16 Digit)</span>
                  <span className="font-mono text-slate-800">{mother.nik || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Pendidikan Terakhir</span>
                  <span className="text-slate-800">{mother.lastEducation || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Pekerjaan</span>
                  <span className="text-slate-800">{mother.occupation || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Penghasilan Bulanan</span>
                  <span className="text-slate-800">{mother.monthlyIncome || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Nomor HP/WA</span>
                  <span className="text-slate-800">{mother.phone || '-'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Section 3: Audit Trail */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          Riwayat Jejak Audit Pendaftar Ini
        </h2>
        <AuditLogSection events={data.auditEvents} />
      </div>

      {/* Status Decision Dialog */}
      <Dialog open={targetStatus !== null} onOpenChange={(open) => !open && setTargetStatus(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {targetStatus === 'accepted'
                ? 'Konfirmasi Penerimaan Santri'
                : targetStatus === 'rejected'
                ? 'Konfirmasi Penolakan Pendaftaran'
                : 'Ubah Status ke Sedang Ditinjau'}
            </DialogTitle>
            <DialogDescription>
              {targetStatus === 'accepted'
                ? `Apakah Anda yakin ingin MENERIMA pendaftar ${registration.registration_number} (${registration.child_name})?`
                : targetStatus === 'rejected'
                ? `Pendaftar ${registration.registration_number} akan DITOLAK. Silakan masukkan alasan penolakan.`
                : `Status pendaftar ${registration.registration_number} akan ditandai sedang dalam evaluasi.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-medium text-slate-700">
              {targetStatus === 'rejected' ? 'Alasan Penolakan (Wajib):' : 'Catatan Admin (Opsional):'}
            </label>
            <Textarea
              placeholder={
                targetStatus === 'rejected'
                  ? 'Contoh: Berkas kartu keluarga tidak terbaca / kuota santri telah terpenuhi.'
                  : 'Catatan tambahan untuk internal admin...'
              }
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTargetStatus(null)}
              disabled={submittingStatus}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleStatusSubmit}
              disabled={submittingStatus}
              className={
                targetStatus === 'accepted'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : targetStatus === 'rejected'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }
            >
              {submittingStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Memproses...
                </>
              ) : (
                'Simpan Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRegistrantDetailPage;
