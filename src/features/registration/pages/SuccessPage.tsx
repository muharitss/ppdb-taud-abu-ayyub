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
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import { getSessionCredentials } from "@/lib/sessionCredentials";
import { buildWaLink } from "../utils/whatsapp";

interface LocationState {
  registrationNumber?: string;
  accessCode?: string;
  childName?: string;
}

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const sessionCreds = getSessionCredentials();

  const registrationNumber =
    state.registrationNumber || sessionCreds?.registrationNumber || "";
  const accessCode = state.accessCode || sessionCreds?.accessCode || "";
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
      childName ? `Nama Siswa: ${childName}` : null,
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
        <Card className="shadow-lg border-emerald-100 overflow-hidden">
          <CardHeader className="text-center pb-4 bg-emerald-50/70 border-b border-emerald-100/60">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-950">
              Pendaftaran Selesai!
            </CardTitle>
            <CardDescription className="text-emerald-800/80 max-w-md mx-auto text-xs sm:text-sm">
              Simpan Nomor Pendaftaran dan Kode Akses Anda di bawah ini untuk
              melihat status pendaftaran.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {registrationNumber ? (
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  {childName && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/80 text-sm">
                      <span className="text-muted-foreground">
                        Nama Calon Siswa:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {childName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Nomor Pendaftaran:
                    </span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded text-sm sm:text-base">
                      {registrationNumber}
                    </span>
                  </div>

                  {accessCode && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 text-sm">
                      <span className="text-muted-foreground">Kode Akses:</span>
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
                      Salin Nomor Pendaftaran & Kode Akses
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center">
                Silakan simpan nomor pendaftaran dan periksa status Anda secara
                berkala.
              </div>
            )}

            {/* Simple WA Group Button without card, title, or description */}
            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11"
            >
              <a
                href={ADMIN_CONTACTS.waGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Bergabung ke Grup Whatsapp
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold h-11"
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
          </CardContent>

          <CardFooter className="bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-between pt-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto text-xs"
            >
              <Link to="/">
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Kembali ke Beranda
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
            >
              <Link to="/status">
                Lihat Status Pendaftaran
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
