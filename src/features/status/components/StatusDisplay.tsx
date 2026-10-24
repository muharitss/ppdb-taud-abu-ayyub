import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CreditCard,
  Calendar,
  Clock,
  ArrowRight,
  MessageCircle,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import {
  getRegistrationStatusMeta,
  getPaymentStatusMeta,
} from "@/lib/constants/statusLabels";
import type { VerifyAccessData } from "@/lib/api/status";

interface StatusDisplayProps {
  data: VerifyAccessData;
  accessCode: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  data,
  accessCode,
}) => {
  const regMeta = getRegistrationStatusMeta(data.registration_status);
  const payMeta = getPaymentStatusMeta(data.payment_status);

  const formattedDate = data.submitted_at
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(data.submitted_at))
    : null;

  const waHelpUrl = `https://wa.me/${ADMIN_CONTACTS.primary.whatsappNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya ingin menanyakan status pendaftaran nomor ${data.registration_number}.`,
  )}`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-emerald-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-emerald-50/70 border-b border-emerald-100/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase font-medium text-emerald-800">
                Nomor Pendaftaran
              </span>
              <CardTitle className="text-xl sm:text-2xl font-mono font-bold text-emerald-950">
                {data.registration_number}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${regMeta.badgeClassName}`}
              >
                {regMeta.label}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Pendaftaran */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <FileText className="w-4 h-4 text-emerald-600" />
                Status Pendaftaran
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${regMeta.badgeClassName}`}
                >
                  {regMeta.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {regMeta.description}
              </p>
            </div>

            {/* Status Pembayaran */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Status Pembayaran
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${payMeta.badgeClassName}`}
                >
                  {payMeta.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {payMeta.description}
              </p>
            </div>
          </div>

          {/* Submission Timestamp */}
          {formattedDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Formulir terkirim pada: <strong>{formattedDate}</strong>
              </span>
            </div>
          )}

          {/* Action Callouts Based on Status */}
          {data.registration_status === "awaiting_payment" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Clock className="w-4 h-4 text-amber-700" />
                Langkah Berikutnya: Pembayaran Biaya Pendaftaran
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Silakan lakukan transfer sebesar Rp 300.000 ke rekening resmi
                sekolah dan unggah foto bukti transfer untuk membuka formulir
                pendaftaran.
              </p>
              <Button
                asChild
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Link
                  to={`/bayar/${encodeURIComponent(data.registration_number)}`}
                  state={{ accessCode }}
                >
                  Bayar Sekarang & Unggah Bukti
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          )}

          {data.registration_status === "awaiting_form" && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <FileText className="w-4 h-4 text-blue-700" />
                Langkah Berikutnya: Lengkapi Formulir & Berkas
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Bukti pembayaran telah diterima. Silakan isi data lengkap calon
                siswa dan orang tua serta unggah foto Kartu Keluarga dan Akte
                Kelahiran.
              </p>
              <Button
                asChild
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link
                  to={`/daftar/formulir/${encodeURIComponent(data.registration_number)}`}
                  state={{
                    registrationNumber: data.registration_number,
                    accessCode,
                  }}
                >
                  Lengkapi Formulir Sekarang
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          )}

          {data.registration_status === "accepted" && (
            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <a
                href={ADMIN_CONTACTS.waGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Silahkan Gabung Grup
              </a>
            </Button>
          )}

          {/* Admin WhatsApp Help Link */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Ada pertanyaan terkait pendaftaran Anda?</span>
            <a
              href={waHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Hubungi Admin via WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusDisplay;
