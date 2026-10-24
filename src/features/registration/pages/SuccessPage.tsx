import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Users,
  ArrowRight,
  Home,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import { buildWaLink } from "../utils/whatsapp";

interface LocationState {
  registrationNumber?: string;
  accessCode?: string;
  childName?: string;
}

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const registrationNumber = state.registrationNumber || "";
  const accessCode = state.accessCode || "";
  const childName = state.childName || "";

  const [copied, setCopied] = useState(false);

  const waLink = registrationNumber
    ? buildWaLink({
        childName,
        registrationNumber,
        accessCode,
      })
    : ADMIN_CONTACTS.primary.whatsappUrl;

  const handleCopyInfo = async () => {
    if (!registrationNumber) return;
    const infoText = [
      "BUKTI PENDAFTARAN PPDB TAUD SaQu Abu Ayyub TP.2027/2028",
      childName ? `Nama Santri: ${childName}` : null,
      `Nomor Pendaftaran: ${registrationNumber}`,
      accessCode ? `Kode Akses: ${accessCode}` : null,
      `Cek Status: ${window.location.origin}/status`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(infoText);
      setCopied(true);
      toast.success("Informasi pendaftaran berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Gagal menyalin informasi ke clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 islamic-pattern py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span className="font-semibold text-emerald-800">TAUD SaQu Abu Ayyub</span>
          <Link to="/" className="inline-flex items-center hover:text-foreground">
            <Home className="w-3.5 h-3.5 mr-1" />
            Kembali ke Beranda
          </Link>
        </div>

        <Card className="shadow-lg border-emerald-100 overflow-hidden">
          {/* Header */}
          <CardHeader className="text-center pb-4 bg-emerald-50/70 border-b border-emerald-100/60">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-950">
              Pendaftaran Selesai!
            </CardTitle>
            <CardDescription className="text-emerald-800/80 max-w-md mx-auto text-xs sm:text-sm">
              Alhamdulillah, formulir pendaftaran dan berkas persyaratan santri baru TP.2027/2028 telah berhasil dikirim ke panitia PPDB.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-5">
            {/* Registrant Detail Box */}
            {registrationNumber ? (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  {childName && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 text-sm">
                      <span className="text-muted-foreground">Nama Calon Santri:</span>
                      <span className="font-semibold text-slate-800">{childName}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Nomor Pendaftaran:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded text-sm sm:text-base">
                      {registrationNumber}
                    </span>
                  </div>

                  {accessCode && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 text-sm">
                      <span className="text-muted-foreground">Kode Akses Rahasia:</span>
                      <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded tracking-wider">
                        {accessCode}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInfo}
                  className="w-full text-xs h-9 border-slate-300"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      Informasi Berhasil Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      Salin Informasi Pendaftaran
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center">
                Silakan simpan nomor pendaftaran dan periksa status Anda secara berkala.
              </div>
            )}

            {/* WA Group Button (Penting) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 shrink-0" />
                <h4 className="font-bold text-sm">Grup WhatsApp Resmi PPDB</h4>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed">
                Bergabunglah ke grup WhatsApp PPDB TAUD SaQu Abu Ayyub untuk mendapatkan pengumuman jadwal observasi, wawancara, dan informasi penting lainnya.
              </p>
              <div className="pt-1">
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-semibold"
                >
                  <a
                    href={ADMIN_CONTACTS.waGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    Gabung Grup WhatsApp PPDB
                  </a>
                </Button>
              </div>
            </div>

            {/* Step 2: Konfirmasi Admin WA */}
            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
              >
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Kirim Konfirmasi via WhatsApp
                </a>
              </Button>

              {/* Disclaimer manual send */}
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Perhatian:</strong> Pastikan Anda menekan tombol <strong>Kirim</strong> di aplikasi WhatsApp. Sistem web tidak dapat mengirimkan pesan secara otomatis tanpa konfirmasi dari Anda.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-between pt-4">
            <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto text-xs">
              <Link to="/">
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Kembali ke Beranda
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50">
              <Link to="/status">
                Cek Status Pendaftaran
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SuccessPage;
