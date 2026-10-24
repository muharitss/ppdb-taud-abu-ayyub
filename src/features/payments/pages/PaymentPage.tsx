import React, { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Copy,
  Check,
  KeyRound,
  FileCheck2,
  AlertTriangle,
  Loader2,
  MessageCircle,
  Home,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PaymentProofUpload } from "../components/PaymentProofUpload";
import { submitPaymentProof, DEFAULT_BANK_INFO } from "../services/payment";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import { saveSessionCredentials, getSessionCredentials } from "@/lib/sessionCredentials";

export const PaymentPage: React.FC = () => {
  const { registrationNumber: paramRegNumber } = useParams<{ registrationNumber?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as
    | { registrationNumber?: string; accessCode?: string; childName?: string }
    | undefined;
  const sessionCreds = getSessionCredentials();

  const initialRegNumber =
    paramRegNumber ||
    locationState?.registrationNumber ||
    (sessionCreds ? sessionCreds.registrationNumber : "");

  const initialAccessCode =
    locationState?.accessCode ||
    (sessionCreds && (!initialRegNumber || sessionCreds.registrationNumber === initialRegNumber)
      ? sessionCreds.accessCode
      : "");

  const hasAutoCredentials = Boolean(initialRegNumber && initialAccessCode);

  const [registrationNumber, setRegistrationNumber] = useState(initialRegNumber);
  const [accessCode, setAccessCode] = useState(initialAccessCode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAcc, setCopiedAcc] = useState(false);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(DEFAULT_BANK_INFO.accountNumber);
      setCopiedAcc(true);
      toast.success("Nomor rekening berhasil disalin");
      setTimeout(() => setCopiedAcc(false), 2000);
    } catch {
      toast.error("Gagal menyalin nomor rekening");
    }
  };

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(DEFAULT_BANK_INFO.amount);

  const handleFileSelect = (file: File | null, error?: string | null) => {
    setSelectedFile(file);
    setFileError(error || null);
    if (error) {
      toast.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanReg = registrationNumber.trim().toUpperCase();
    const cleanCode = accessCode.trim().toUpperCase();

    if (!cleanReg) {
      setErrorMessage("Nomor pendaftaran wajib diisi");
      toast.error("Nomor pendaftaran wajib diisi");
      return;
    }

    if (!cleanCode) {
      setErrorMessage("Kode akses wajib diisi");
      toast.error("Kode akses wajib diisi");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Silakan pilih berkas bukti transfer Anda");
      toast.error("Silakan pilih berkas bukti transfer Anda");
      return;
    }

    if (fileError) {
      toast.error(fileError);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitPaymentProof({
        registrationNumber: cleanReg,
        accessCode: cleanCode,
        file: selectedFile,
      });

      saveSessionCredentials(cleanReg, cleanCode);
      toast.success("Bukti pembayaran berhasil diunggah! Silakan lengkapi formulir pendaftaran.");
      navigate("/daftar/formulir", {
        state: {
          registrationNumber: cleanReg,
          accessCode: cleanCode,
          childName: locationState?.childName,
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengunggah bukti pembayaran. Silakan coba lagi.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const waHelpUrl = `https://wa.me/${ADMIN_CONTACTS.primary.whatsappNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya ingin bertanya / meminta bantuan terkait pembayaran pendaftaran${
      registrationNumber ? ` (Nomor Pendaftaran: ${registrationNumber})` : ""
    }.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 islamic-pattern py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* Navigation Breadcrumb */}
        {/* <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span className="font-semibold text-emerald-800">TAUD SaQu Abu Ayyub</span>
          <Link to="/" className="inline-flex items-center hover:text-foreground transition-colors">
            <Home className="w-3.5 h-3.5 mr-1" />
            Kembali ke Beranda
          </Link>
        </div> */}

        {/* Judul Halaman di luar Card */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">
            Pembayaran Biaya Pendaftaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Penerimaan Peserta Didik Baru (PPDB) TP 2027/2028
          </p>
        </div>

        <Card className="border border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {/* 1. Biaya Pendaftaran & Nominal (tanpa card) */}
            <div className="text-center pt-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Biaya Pendaftaran
              </span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {formattedAmount}
              </div>
            </div>

            {/* 2. Logo BSI di tengah, nomor rekening & tombol salin icon-only */}
            <div className="pt-2 pb-4 text-center border-y border-slate-100 space-y-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
                alt="Bank Syariah Indonesia (BSI)"
                className="h-8 mx-auto object-contain"
                loading="lazy"
              />
              <div className="flex items-center justify-center gap-1">
                <span className="font-mono text-lg font-bold text-slate-800 tracking-wider">
                  {DEFAULT_BANK_INFO.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Salin nomor rekening"
                  aria-label="Salin nomor rekening"
                >
                  {copiedAcc ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                a.n. {DEFAULT_BANK_INFO.accountHolder}
              </p>
              {registrationNumber && (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/70 rounded-md py-1 px-2.5 inline-block mt-1">
                  Berita transfer: <span className="font-mono font-semibold">{registrationNumber}</span>
                </p>
              )}
            </div>

            {/* 3. Form input & Upload bukti transfer */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {!hasAutoCredentials && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="registration_number" className="text-xs font-medium text-slate-700">
                      Nomor Pendaftaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="registration_number"
                      type="text"
                      placeholder="Contoh: PPDB-2027-00001"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      disabled={isSubmitting || Boolean(paramRegNumber)}
                      className="font-mono uppercase text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="access_code" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      Kode Akses <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="access_code"
                      type="text"
                      maxLength={12}
                      placeholder="8 karakter kode akses"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      disabled={isSubmitting}
                      className="font-mono uppercase text-sm tracking-wider"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Unggah Bukti */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Unggah Bukti Transfer <span className="text-red-500">*</span>
                </Label>
                <PaymentProofUpload
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
                  disabled={isSubmitting}
                />
                {fileError && (
                  <p className="text-xs text-red-600 font-medium">{fileError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengunggah Bukti Pembayaran...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4 mr-2" />
                    Kirim Bukti Pembayaran
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Tombol butuh bantuan melayang di sudut kanan bawah */}
      <a
        href={waHelpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full bg-white border border-slate-200 text-slate-700 shadow-md hover:text-emerald-700 hover:border-emerald-300 transition-all"
      >
        <MessageCircle className="w-4 h-4 text-emerald-600" />
        <span>Butuh Bantuan?</span>
      </a>
    </div>
  );
};

export default PaymentPage;
