import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { AdminProfile } from '@/hooks/useAdminAuth';
import {
  getRegistrantFullDetail,
  updateRegistrantStatus,
  type RegistrantFullData,
} from '../services/adminDetail';
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
  Phone,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminContextType {
  user: User;
  profile: AdminProfile | null;
}

const REG_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draf', className: 'bg-slate-100 text-slate-700' },
  awaiting_payment: { label: 'Menunggu Pembayaran', className: 'bg-amber-100 text-amber-800' },
  awaiting_form: { label: 'Menunggu Formulir', className: 'bg-blue-100 text-blue-800' },
  submitted: { label: 'Formulir Masuk', className: 'bg-purple-100 text-purple-800' },
  under_review: { label: 'Sedang Ditinjau', className: 'bg-indigo-100 text-indigo-800' },
  accepted: { label: 'Diterima', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Ditolak', className: 'bg-rose-100 text-rose-800' },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100 text-xs sm:text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value || '-'}</span>
    </div>
  );
}

export const AdminRegistrantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useOutletContext<AdminContextType>();
  const adminId = context?.user?.id;

  const [data, setData] = useState<RegistrantFullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [targetStatus, setTargetStatus] = useState<'accepted' | 'rejected' | null>(null);
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
          : `Pendaftar ${data.registration.registration_number} telah DITOLAK.`
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
        <p className="text-sm">Memuat detail pendaftar...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>
        <div className="p-8 bg-white border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-slate-600">{error || 'Data pendaftar tidak ditemukan.'}</p>
        </div>
      </div>
    );
  }

  const { registration, formData, payments, documents } = data;
  const statusInfo = REG_STATUS_LABELS[registration.status] || {
    label: registration.status,
    className: 'bg-slate-100 text-slate-700',
  };

  const child = (formData?.child || {}) as Record<string, unknown>;
  const father = (formData?.father || {}) as Record<string, unknown>;
  const mother = (formData?.mother || {}) as Record<string, unknown>;
  const health = (formData?.health || {}) as Record<string, unknown>;

  const latestPayment = payments?.[0];
  const kkDoc = documents.find((d) => d.document_type === 'kartu_keluarga');
  const akteDoc = documents.find((d) => d.document_type === 'akte_kelahiran');

  const genderRaw = String(child.gender || '');
  const genderLabel =
    genderRaw === 'laki_laki' || genderRaw === 'male'
      ? 'Laki-laki'
      : genderRaw === 'perempuan' || genderRaw === 'female'
      ? 'Perempuan'
      : '-';

  const childBirthPlace = String(child.birth_place || child.birthPlace || '');
  const childBirthDate = String(child.birth_date || child.birthDate || '');
  const childTtl =
    childBirthPlace || childBirthDate
      ? `${childBirthPlace}${childBirthPlace && childBirthDate ? ', ' : ''}${childBirthDate}`
      : '-';

  const fatherBirthPlace = String(father.birth_place || father.birthPlace || '');
  const fatherBirthDate = String(father.birth_date || father.birthDate || '');
  const fatherTtl =
    fatherBirthPlace || fatherBirthDate
      ? `${fatherBirthPlace}${fatherBirthPlace && fatherBirthDate ? ', ' : ''}${fatherBirthDate}`
      : '-';

  const motherBirthPlace = String(mother.birth_place || mother.birthPlace || '');
  const motherBirthDate = String(mother.birth_date || mother.birthDate || '');
  const motherTtl =
    motherBirthPlace || motherBirthDate
      ? `${motherBirthPlace}${motherBirthPlace && motherBirthDate ? ', ' : ''}${motherBirthDate}`
      : '-';

  const programRaw = String(child.program || '');
  const programLabel =
    programRaw === '1_tahun'
      ? '1 Tahun (5-6 Tahun)'
      : programRaw === '2_tahun'
      ? '2 Tahun (4-5 Tahun)'
      : programRaw || '-';

  const bloodRaw = String(health.blood_type || health.bloodType || '');
  const bloodLabel =
    bloodRaw === 'tidak_diketahui' ? 'Tidak Diketahui' : bloodRaw || '-';

  return (
    <div className="space-y-6 pb-12">
      <Link to="/admin">
        <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
      </Link>

      {/* 1. Basic Info: Nama, Nama Wali, Nomor */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
              {registration.registration_number}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{registration.child_name}</h1>
          <p className="text-sm text-slate-600">
            Wali: <span className="font-medium text-slate-900">{registration.parent_name}</span> &bull;{' '}
            <a
              href={`https://wa.me/${registration.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Phone className="w-3.5 h-3.5" />
              {registration.whatsapp_number}
            </a>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {registration.status !== 'accepted' && (
            <Button
              size="sm"
              onClick={() => setTargetStatus('accepted')}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Terima
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
              Tolak
            </Button>
          )}
        </div>
      </div>

      {/* 2. Foto Pembayaran langsung tanpa keterangan berlebihan */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-800">Foto Bukti Pembayaran</h2>
        {latestPayment?.signed_url ? (
          latestPayment.proof_file_path.toLowerCase().endsWith('.pdf') ? (
            <a
              href={latestPayment.signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-emerald-700 underline font-medium"
            >
              Buka PDF Bukti Pembayaran <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <img
              src={latestPayment.signed_url}
              alt="Bukti Pembayaran"
              onClick={() => window.open(latestPayment.signed_url, '_blank')}
              className="max-h-96 rounded-xl border border-slate-200 object-contain bg-white cursor-pointer"
            />
          )
        ) : (
          <p className="text-xs text-slate-400">Belum ada bukti pembayaran.</p>
        )}
      </div>

      {/* 3. Informasi Lengkap Anak & Orang Tua */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
        {!formData ? (
          <p className="text-xs text-slate-400">Formulir pendaftaran lengkap belum diisi.</p>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 pb-1">Data Anak</h3>
              <InfoRow
                label="Nama Lengkap"
                value={String(child.full_name || child.fullName || registration.child_name)}
              />
              <InfoRow label="Nama Panggilan" value={String(child.nickname || '-')} />
              <InfoRow label="NIK" value={String(child.nik || '-')} />
              <InfoRow label="Jenis Kelamin" value={genderLabel} />
              <InfoRow label="Tempat, Tanggal Lahir" value={childTtl} />
              <InfoRow
                label="Anak ke- / Saudara"
                value={
                  child.child_order || child.childOrder
                    ? `Anak ke-${child.child_order ?? child.childOrder} (${
                        child.sibling_count ?? child.siblingCount ?? 0
                      } saudara)`
                    : '-'
                }
              />
              <InfoRow label="Program Pilihan" value={programLabel} />
              <InfoRow label="Alamat" value={String(child.address || '-')} />
              <InfoRow
                label="Berat / Tinggi Badan"
                value={
                  health.weight_kg || health.height_cm
                    ? `${health.weight_kg || '-'} kg / ${health.height_cm || '-'} cm`
                    : '-'
                }
              />
              <InfoRow label="Golongan Darah" value={bloodLabel} />
              <InfoRow
                label="Riwayat Alergi"
                value={String(health.allergy_history || health.allergies || '-')}
              />
              <InfoRow
                label="Riwayat Penyakit"
                value={String(health.disease_history || health.illnessHistory || '-')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 pb-1">Data Ayah</h3>
                <InfoRow
                  label="Nama Ayah"
                  value={String(father.full_name || father.fullName || '-')}
                />
                <InfoRow label="NIK" value={String(father.nik || '-')} />
                <InfoRow label="Tempat, Tanggal Lahir" value={fatherTtl} />
                <InfoRow
                  label="Pendidikan Terakhir"
                  value={String(father.last_education || father.lastEducation || '-')}
                />
                <InfoRow label="Pekerjaan" value={String(father.occupation || '-')} />
                <InfoRow
                  label="Penghasilan"
                  value={String(father.monthly_income || father.monthlyIncome || '-')}
                />
                <InfoRow
                  label="No. HP / WA"
                  value={String(father.whatsapp_number || father.phone || '-')}
                />
                <InfoRow label="Alamat" value={String(father.address || '-')} />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 pb-1">Data Ibu</h3>
                <InfoRow
                  label="Nama Ibu"
                  value={String(mother.full_name || mother.fullName || '-')}
                />
                <InfoRow label="NIK" value={String(mother.nik || '-')} />
                <InfoRow label="Tempat, Tanggal Lahir" value={motherTtl} />
                <InfoRow
                  label="Pendidikan Terakhir"
                  value={String(mother.last_education || mother.lastEducation || '-')}
                />
                <InfoRow label="Pekerjaan" value={String(mother.occupation || '-')} />
                <InfoRow
                  label="Penghasilan"
                  value={String(mother.monthly_income || mother.monthlyIncome || '-')}
                />
                <InfoRow
                  label="No. HP / WA"
                  value={String(mother.whatsapp_number || mother.phone || '-')}
                />
                <InfoRow label="Alamat" value={String(mother.address || '-')} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Langsung tampilkan 2 foto KK dan Akte di bawah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-800">Foto Kartu Keluarga (KK)</h2>
          {kkDoc?.signed_url ? (
            kkDoc.file_path.toLowerCase().endsWith('.pdf') ? (
              <a
                href={kkDoc.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-700 underline font-medium"
              >
                Buka PDF Kartu Keluarga <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <img
                src={kkDoc.signed_url}
                alt="Kartu Keluarga"
                onClick={() => window.open(kkDoc.signed_url, '_blank')}
                className="w-full max-h-96 rounded-xl border border-slate-200 object-contain bg-white cursor-pointer"
              />
            )
          ) : (
            <p className="text-xs text-slate-400">Belum diunggah.</p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-800">Foto Akte Kelahiran</h2>
          {akteDoc?.signed_url ? (
            akteDoc.file_path.toLowerCase().endsWith('.pdf') ? (
              <a
                href={akteDoc.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-700 underline font-medium"
              >
                Buka PDF Akte Kelahiran <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <img
                src={akteDoc.signed_url}
                alt="Akte Kelahiran"
                onClick={() => window.open(akteDoc.signed_url, '_blank')}
                className="w-full max-h-96 rounded-xl border border-slate-200 object-contain bg-white cursor-pointer"
              />
            )
          ) : (
            <p className="text-xs text-slate-400">Belum diunggah.</p>
          )}
        </div>
      </div>

      {/* Status Decision Dialog */}
      <Dialog open={targetStatus !== null} onOpenChange={(open) => !open && setTargetStatus(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {targetStatus === 'accepted'
                ? 'Konfirmasi Penerimaan Santri'
                : 'Konfirmasi Penolakan Pendaftaran'}
            </DialogTitle>
            <DialogDescription>
              {targetStatus === 'accepted'
                ? `Terima pendaftar ${registration.registration_number} (${registration.child_name})?`
                : `Tolak pendaftar ${registration.registration_number}? Masukkan alasan penolakan.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-medium text-slate-700">
              {targetStatus === 'rejected' ? 'Alasan Penolakan (Wajib):' : 'Catatan Admin (Opsional):'}
            </label>
            <Textarea
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
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }
            >
              {submittingStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Memproses...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRegistrantDetailPage;
