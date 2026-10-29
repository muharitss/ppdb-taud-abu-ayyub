import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import type { AdminProfile } from "@/hooks/useAdminAuth";
import {
  getRegistrantFullDetail,
  updateRegistrantStatus,
  type RegistrantFullData,
  type DocumentItem,
} from "../services/adminDetail";
import { reviewPayment } from "../services/adminPayment";
import { RejectDialog } from "../components/RejectDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  ExternalLink,
  User as UserIcon,
  Users,
  CreditCard,
  FileCheck,
  FileText,
  Activity,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AdminContextType {
  user: User;
  profile: AdminProfile | null;
}

const REG_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  draft: {
    label: "Draf",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
  awaiting_payment: {
    label: "Menunggu Pembayaran",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  awaiting_form: {
    label: "Menunggu Formulir",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  submitted: {
    label: "Formulir Masuk",
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  under_review: {
    label: "Sedang Ditinjau",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  accepted: {
    label: "Diterima",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const PAY_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  payment_pending: {
    label: "Belum Bayar",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
  payment_submitted: {
    label: "Menunggu Verifikasi",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  payment_verified: {
    label: "Lunas",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  payment_rejected: {
    label: "Ditolak",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

function formatWaLink(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  const normalized = cleaned.startsWith("0")
    ? "62" + cleaned.slice(1)
    : cleaned;
  return `https://wa.me/${normalized}`;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

function DetailField({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`space-y-1 ${fullWidth ? "col-span-full" : ""}`}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 break-words">
        {value || "-"}
      </dd>
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

  const [targetStatus, setTargetStatus] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Lightbox preview modal for proof & documents
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getRegistrantFullDetail(id);
      setData(res);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat detail pendaftar",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusSubmit = async () => {
    if (!data || !targetStatus) return;

    if (targetStatus === "rejected" && !reviewNotes.trim()) {
      toast.error("Catatan penolakan wajib diisi!");
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
        targetStatus === "accepted"
          ? `Pendaftar ${data.registration.registration_number} resmi DITERIMA!`
          : `Pendaftar ${data.registration.registration_number} telah DITOLAK.`,
      );

      setTargetStatus(null);
      setReviewNotes("");
      fetchDetail();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengubah status pendaftar",
      );
    } finally {
      setSubmittingStatus(false);
    }
  };

  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [rejectPaymentDialogOpen, setRejectPaymentDialogOpen] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState(false);

  const handleRejectPayment = async (notes: string) => {
    const latestPmt = data?.payments?.[0];
    if (!latestPmt || !data) return;

    setRejectingPayment(true);
    try {
      await reviewPayment({
        payment_id: latestPmt.id,
        approved: false,
        review_notes: notes,
      });

      toast.success(
        `Bukti pembayaran ${data.registration.registration_number} ditolak. Pendaftar dapat mengunggah ulang bukti baru.`
      );
      setRejectPaymentDialogOpen(false);
      fetchDetail();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menolak bukti pembayaran"
      );
    } finally {
      setRejectingPayment(false);
    }
  };

  const handleVerifyPayment = async () => {
    const latestPmt = data?.payments?.[0];
    if (!latestPmt) return;

    setVerifyingPayment(true);
    try {
      await reviewPayment({
        payment_id: latestPmt.id,
        approved: true,
      });

      toast.success(
        `Pembayaran untuk ${data.registration.registration_number} berhasil diverifikasi!`,
      );
      fetchDetail();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memverifikasi pembayaran",
      );
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Memuat detail pendaftar...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
          </Button>
        </Link>
        <div className="p-10 bg-white border border-red-200 rounded-2xl text-center space-y-3 shadow-xs">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-semibold text-slate-800">
            Gagal Mengambil Data
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {error ||
              "Data pendaftar tidak ditemukan atau terjadi kendala jaringan."}
          </p>
        </div>
      </div>
    );
  }

  const { registration, formData, payments, documents } = data;
  const statusInfo = REG_STATUS_CONFIG[registration.status] || {
    label: registration.status,
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const payStatusInfo = PAY_STATUS_CONFIG[registration.payment_status] || {
    label: registration.payment_status,
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const child = (formData?.child || {}) as Record<string, unknown>;
  const father = (formData?.father || {}) as Record<string, unknown>;
  const mother = (formData?.mother || {}) as Record<string, unknown>;
  const health = (formData?.health || {}) as Record<string, unknown>;

  const latestPayment = payments?.[0];
  const kkDoc = documents.find((d) => d.document_type === "kartu_keluarga");
  const akteDoc = documents.find((d) => d.document_type === "akte_kelahiran");

  const genderRaw = String(child.gender || "");
  const genderLabel =
    genderRaw === "laki_laki" || genderRaw === "male"
      ? "Laki-laki"
      : genderRaw === "perempuan" || genderRaw === "female"
        ? "Perempuan"
        : "-";

  const childBirthPlace = String(child.birth_place || child.birthPlace || "");
  const childBirthDate = String(child.birth_date || child.birthDate || "");
  const childTtl =
    childBirthPlace || childBirthDate
      ? `${childBirthPlace}${childBirthPlace && childBirthDate ? ", " : ""}${childBirthDate}`
      : "-";

  const fatherBirthPlace = String(
    father.birth_place || father.birthPlace || "",
  );
  const fatherBirthDate = String(father.birth_date || father.birthDate || "");
  const fatherTtl =
    fatherBirthPlace || fatherBirthDate
      ? `${fatherBirthPlace}${fatherBirthPlace && fatherBirthDate ? ", " : ""}${fatherBirthDate}`
      : "-";

  const motherBirthPlace = String(
    mother.birth_place || mother.birthPlace || "",
  );
  const motherBirthDate = String(mother.birth_date || mother.birthDate || "");
  const motherTtl =
    motherBirthPlace || motherBirthDate
      ? `${motherBirthPlace}${motherBirthPlace && motherBirthDate ? ", " : ""}${motherBirthDate}`
      : "-";

  const programRaw = String(child.program || "");
  const programLabel =
    programRaw === "1_tahun"
      ? "1 Tahun "
      : programRaw === "2_tahun"
        ? "2 Tahun "
        : programRaw || "-";

  const bloodRaw = String(health.blood_type || health.bloodType || "");
  const bloodLabel =
    bloodRaw === "tidak_diketahui" ? "Tidak Diketahui" : bloodRaw || "-";

  const renderDocumentItem = (doc: DocumentItem | undefined, title: string) => {
    if (!doc) {
      return (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-700">{title}</span>
          <p className="text-xs text-slate-400 py-3 italic">
            Berkas belum diunggah.
          </p>
        </div>
      );
    }

    const isPdf = doc.file_path.toLowerCase().endsWith(".pdf");

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">{title}</span>
          {doc.signed_url && (
            <a
              href={doc.signed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 font-medium"
            >
              Buka Tab Baru <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {isPdf ? (
          <a
            href={doc.signed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-emerald-700 font-medium hover:underline py-2"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            Buka Dokumen PDF <ExternalLink className="w-3 h-3" />
          </a>
        ) : doc.signed_url ? (
          <img
            src={doc.signed_url}
            alt={title}
            onClick={() => setPreviewModal({ url: doc.signed_url!, title })}
            className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
          />
        ) : (
          <p className="text-xs text-amber-600 py-2">
            Tautan berkas sementara kadaluarsa.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Pendaftar
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Periode: {registration.ppdb_period || "2026/2027"}
        </span>
      </div>

      {/* Header Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                {registration.registration_number}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badge}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                />
                {statusInfo.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${payStatusInfo.badge}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${payStatusInfo.dot}`}
                />
                Bayar: {payStatusInfo.label}
              </span>
              {programLabel !== "-" && (
                <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 hidden md:inline-flex">
                  {programLabel}
                </span>
              )}
            </div>

            {/* Child Name & Guardian Info */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {registration.child_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 mt-1">
                <span>
                  Wali:{" "}
                  <strong className="text-slate-800">
                    {registration.parent_name}
                  </strong>
                </span>
                <span>&bull;</span>
                <a
                  href={formatWaLink(registration.whatsapp_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 transition-colors"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {registration.whatsapp_number}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Decision Actions */}
          <div className="flex items-center gap-2 sm:self-center shrink-0">
            {registration.status !== "accepted" && (
              <Button
                size="sm"
                onClick={() => setTargetStatus("accepted")}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                Terima Siswa
              </Button>
            )}
            {registration.status !== "rejected" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetStatus("rejected")}
                className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-medium"
              >
                <XCircle className="w-4 h-4" />
                Tolak
              </Button>
            )}
          </div>
        </div>

        {/* Status Callout Banner */}
        {registration.status === "accepted" && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              Calon siswa ini telah <strong>resmi diterima</strong>.
              {registration.review_notes && (
                <span className="block mt-0.5 text-emerald-700">
                  Catatan: {registration.review_notes}
                </span>
              )}
            </div>
          </div>
        )}
        {registration.status === "rejected" && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-rose-900 text-xs">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Pendaftaran ditolak</span>
              {registration.review_notes && (
                <p className="mt-0.5 text-rose-700">
                  Alasan: {registration.review_notes}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Data (7 Cols on LG) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Data Calon Siswa */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[var(--color-primary)] flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Data Calon Siswa
                  </h2>
                  <p className="text-xs text-slate-500">
                    Identitas dan data kesehatan anak
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {programLabel}
              </span>
            </div>

            {!formData ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Formulir pendaftaran lengkap belum diisi oleh wali siswa.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Identitas Diri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailField
                    label="Nama Lengkap"
                    value={String(
                      child.full_name ||
                        child.fullName ||
                        registration.child_name,
                    )}
                  />
                  <DetailField
                    label="Nama Panggilan"
                    value={String(child.nickname || "-")}
                  />
                  <DetailField
                    label="NIK (Nomor Induk Kependudukan)"
                    value={String(child.nik || "-")}
                  />
                  <DetailField label="Jenis Kelamin" value={genderLabel} />
                  <DetailField label="Tempat, Tanggal Lahir" value={childTtl} />
                  <DetailField
                    label="Urutan Anak"
                    value={
                      child.child_order || child.childOrder
                        ? `Anak ke-${child.child_order ?? child.childOrder} (dari ${
                            child.sibling_count ?? child.siblingCount ?? 0
                          } bersaudara)`
                        : "-"
                    }
                  />
                  <DetailField
                    label="Alamat Tempat Tinggal"
                    value={String(child.address || "-")}
                    fullWidth
                  />
                </div>

                {/* Sub-section: Kesehatan */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Kondisi Fisik & Riwayat Kesehatan
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <DetailField
                      label="Berat Badan"
                      value={health.weight_kg ? `${health.weight_kg} kg` : "-"}
                    />
                    <DetailField
                      label="Tinggi Badan"
                      value={health.height_cm ? `${health.height_cm} cm` : "-"}
                    />
                    <DetailField label="Golongan Darah" value={bloodLabel} />
                    <DetailField
                      label="Riwayat Alergi"
                      value={String(
                        health.allergy_history || health.allergies || "-",
                      )}
                    />
                    <div className="col-span-full pt-1">
                      <DetailField
                        label="Riwayat Penyakit"
                        value={String(
                          health.disease_history ||
                            health.illnessHistory ||
                            "-",
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Data Orang Tua & Wali */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Data Orang Tua / Wali
                </h2>
                <p className="text-xs text-slate-500">
                  Informasi identitas ayah dan ibu
                </p>
              </div>
            </div>

            {!formData ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Data orang tua belum tersedia.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Data Ayah */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Data Ayah Kandung
                    </h3>
                    {Boolean(father.whatsapp_number) && (
                      <a
                        href={formatWaLink(String(father.whatsapp_number))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        Chat Ayah
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailField
                      label="Nama Ayah"
                      value={String(father.full_name || father.fullName || "-")}
                    />
                    <DetailField
                      label="NIK Ayah"
                      value={String(father.nik || "-")}
                    />
                    <DetailField
                      label="Tempat, Tanggal Lahir"
                      value={fatherTtl}
                    />
                    <DetailField
                      label="Pendidikan Terakhir"
                      value={String(
                        father.last_education || father.lastEducation || "-",
                      )}
                    />
                    <DetailField
                      label="Pekerjaan"
                      value={String(father.occupation || "-")}
                    />
                    <DetailField
                      label="Penghasilan Bulanan"
                      value={String(
                        father.monthly_income || father.monthlyIncome || "-",
                      )}
                    />
                    <DetailField
                      label="No. WhatsApp / HP"
                      value={String(
                        father.whatsapp_number || father.phone || "-",
                      )}
                    />
                    <DetailField
                      label="Alamat Tempat Tinggal"
                      value={String(father.address || "-")}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Data Ibu */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Data Ibu Kandung
                    </h3>
                    {Boolean(mother.whatsapp_number) && (
                      <a
                        href={formatWaLink(String(mother.whatsapp_number))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        Chat Ibu
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailField
                      label="Nama Ibu"
                      value={String(mother.full_name || mother.fullName || "-")}
                    />
                    <DetailField
                      label="NIK Ibu"
                      value={String(mother.nik || "-")}
                    />
                    <DetailField
                      label="Tempat, Tanggal Lahir"
                      value={motherTtl}
                    />
                    <DetailField
                      label="Pendidikan Terakhir"
                      value={String(
                        mother.last_education || mother.lastEducation || "-",
                      )}
                    />
                    <DetailField
                      label="Pekerjaan"
                      value={String(mother.occupation || "-")}
                    />
                    <DetailField
                      label="Penghasilan Bulanan"
                      value={String(
                        mother.monthly_income || mother.monthlyIncome || "-",
                      )}
                    />
                    <DetailField
                      label="No. WhatsApp / HP"
                      value={String(
                        mother.whatsapp_number || mother.phone || "-",
                      )}
                    />
                    <DetailField
                      label="Alamat Tempat Tinggal"
                      value={String(mother.address || "-")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payments (5 Cols on LG) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bukti Pembayaran - langsung gambar tanpa card & tanpa border, ukuran tetap kecil */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Bukti Pembayaran
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${payStatusInfo.badge}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${payStatusInfo.dot}`}
                />
                {payStatusInfo.label}
              </span>
            </div>

            {latestPayment?.signed_url ? (
              latestPayment.proof_file_path.toLowerCase().endsWith(".pdf") ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <a
                    href={latestPayment.signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-emerald-700 font-medium hover:underline py-1"
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    Buka PDF Pembayaran <ExternalLink className="w-3 h-3" />
                  </a>
                  {registration.payment_status !== "payment_verified" ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleVerifyPayment}
                        disabled={verifyingPayment || rejectingPayment}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium shadow-xs"
                      >
                        {verifyingPayment ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Memverifikasi...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verifikasi Pembayaran
                          </>
                        )}
                      </Button>
                      {latestPayment.status === "payment_submitted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectPaymentDialogOpen(true)}
                          disabled={verifyingPayment || rejectingPayment}
                          className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 font-medium"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Tolak Bukti Bayar
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Pembayaran Terverifikasi
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start gap-4 pt-1">
                  {/* Gambar Bukti Pembayaran */}
                  <div className="shrink-0 space-y-1.5">
                    <img
                      src={latestPayment.signed_url}
                      alt="Bukti Pembayaran"
                      onClick={() =>
                        setPreviewModal({
                          url: latestPayment.signed_url!,
                          title: "Bukti Pembayaran Pendaftaran",
                        })
                      }
                      className="max-h-44 w-auto max-w-full cursor-pointer hover:opacity-95 transition-opacity"
                    />
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>
                        Diunggah: {formatDate(latestPayment.uploaded_at)}
                      </span>
                      <span>&bull;</span>
                      <a
                        href={latestPayment.signed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        Tab Baru <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Tombol / Status Verifikasi di samping gambar */}
                  <div className="flex-1 space-y-2 pt-0.5 w-full sm:w-auto">
                    {registration.payment_status !== "payment_verified" ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handleVerifyPayment}
                          disabled={verifyingPayment || rejectingPayment}
                          className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium shadow-xs"
                        >
                          {verifyingPayment ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Memverifikasi...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verifikasi Pembayaran
                            </>
                          )}
                        </Button>
                        {latestPayment.status === "payment_submitted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectPaymentDialogOpen(true)}
                            disabled={verifyingPayment || rejectingPayment}
                            className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 font-medium"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak Bukti Bayar
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Pembayaran Terverifikasi
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-400 py-3 italic">
                Belum ada bukti pembayaran yang diunggah.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Berkas Persyaratan (KK & Akte Kelahiran) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 pb-1">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Berkas Persyaratan
          </h2>
        </div>

        {/* Di laptop berjejer kesamping (md:grid-cols-2), di hape ke bawah (grid-cols-1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {renderDocumentItem(kkDoc, "Kartu Keluarga (KK)")}
          {renderDocumentItem(akteDoc, "Akte Kelahiran")}
        </div>
      </div>

      {/* Lightbox Image Preview Modal - Langsung gambar tanpa border dan tanpa card */}
      <Dialog
        open={previewModal !== null}
        onOpenChange={(open) => !open && setPreviewModal(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] max-h-[95vh] w-auto flex items-center justify-center outline-none ring-0 focus:outline-hidden"
        >
          {previewModal?.url && (
            <div className="relative inline-block max-h-[92vh] max-w-[95vw]">
              <img
                src={previewModal.url}
                alt={previewModal.title}
                onClick={() => setPreviewModal(null)}
                className="max-h-[92vh] max-w-[95vw] w-auto h-auto object-contain cursor-zoom-out"
              />
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="absolute -top-3 -right-3 p-1.5 rounded-full bg-black/75 text-white hover:bg-black transition-colors shadow-lg"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Decision Confirmation Dialog */}
      <Dialog
        open={targetStatus !== null}
        onOpenChange={(open) => !open && setTargetStatus(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {targetStatus === "accepted"
                ? "Konfirmasi Penerimaan Siswa"
                : "Konfirmasi Penolakan Pendaftaran"}
            </DialogTitle>
            <DialogDescription>
              {targetStatus === "accepted"
                ? `Apakah Anda yakin ingin MENERIMA siswa ${registration.child_name} (${registration.registration_number})?`
                : `Apakah Anda yakin ingin MENOLAK pendaftaran ${registration.child_name} (${registration.registration_number})?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-medium text-slate-700">
              {targetStatus === "rejected"
                ? "Alasan Penolakan (Wajib Diisi):"
                : "Catatan Tambahan (Opsional):"}
            </label>
            <Textarea
              placeholder={
                targetStatus === "rejected"
                  ? "Contoh: Berkas tidak lengkap, usia belum memenuhi syarat..."
                  : "Catatan untuk wali atau panitia..."
              }
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="text-xs"
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
                targetStatus === "accepted"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-rose-600 hover:bg-rose-700 text-white"
              }
            >
              {submittingStatus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : targetStatus === "accepted" ? (
                "Terima Siswa"
              ) : (
                "Tolak Pendaftar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RejectDialog
        isOpen={rejectPaymentDialogOpen}
        onClose={() => setRejectPaymentDialogOpen(false)}
        onConfirm={handleRejectPayment}
        isSubmitting={rejectingPayment}
        registrationNumber={registration.registration_number}
      />
    </div>
  );
};

export default AdminRegistrantDetailPage;
