import React, { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  CreditCard,
  KeyRound,
  FileCheck2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Home,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { BankInfoCard } from "../components/BankInfoCard";
import { PaymentProofUpload } from "../components/PaymentProofUpload";
import { submitPaymentProof, DEFAULT_BANK_INFO } from "../services/payment";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import { saveSessionCredentials, getSessionCredentials } from "@/lib/sessionCredentials";

export const PaymentPage: React.FC = () => {
  const { registrationNumber: paramRegNumber } = useParams<{ registrationNumber?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // In-memory accessCode and registrationNumber from router navigation or safe sessionStorage fallback
  const locationState = location.state as { registrationNumber?: string; accessCode?: string } | undefined;
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

  const [registrationNumber, setRegistrationNumber] = useState(initialRegNumber);
  const [accessCode, setAccessCode] = useState(initialAccessCode);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setIsSubmitted(true);
      saveSessionCredentials(cleanReg, cleanCode);
      toast.success("Bukti pembayaran berhasil diunggah! Anda dapat langsung mengisi formulir pendaftaran.");
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

  // WhatsApp Admin Help & Pertanyaan link
  const waHelpUrl = `https://wa.me/${ADMIN_CONTACTS.primary.whatsappNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya ingin bertanya / meminta bantuan terkait pendaftaran${
      registrationNumber ? ` (Nomor Pendaftaran: ${registrationNumber})` : ""
    }.`
  )}`;

  const handleProceedToForm = () => {
    navigate("/daftar/formulir", {
      state: {
        registrationNumber: registrationNumber.trim().toUpperCase(),
        accessCode: accessCode.trim().toUpperCase(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-light)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-200">
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <Link to="/status" className="hover:text-emerald-700 transition-colors">
              Cek Status
            </Link>
          </div>
        </div>

        {/* Success View: Directly Proceed to Form */}
        {isSubmitted ? (
          <Card className="border-emerald-200 shadow-md overflow-hidden bg-white">
            <div className="bg-emerald-600 p-6 text-white text-center space-y-2">
              <div className="inline-flex p-3 bg-white/20 rounded-full mb-1">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">Bukti Pembayaran Berhasil Diunggah!</h1>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
                Terima kasih, bukti pembayaran Anda telah diterima. Anda sekarang dapat langsung mengisi formulir pendaftaran lengkap.
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Nomor Pendaftaran:</span>
                  <span className="font-mono font-bold text-gray-900">{registrationNumber}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Status Formulir:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Siap Diisi Sekarang
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Langkah Selanjutnya:
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-gray-600 pl-1">
                  <li>Klik tombol <strong>Isi Formulir Pendaftaran</strong> di bawah untuk langsung melengkapi data santri & orang tua.</li>
                  <li>Siapkan foto/scan <strong>Kartu Keluarga (KK)</strong> dan <strong>Akte Kelahiran</strong> untuk diunggah pada halaman formulir.</li>
                  <li>Pastikan Anda tetap menyimpan <strong>Nomor Pendaftaran</strong> dan <strong>Kode Akses</strong> Anda.</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleProceedToForm}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold"
                >
                  Isi Formulir Pendaftaran
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <a
                    href={waHelpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Bantuan & Pertanyaan Admin
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Payment, Help Contact & Upload Form View */
          <div className="space-y-6">
            {/* 1. Keterangan Membayar Biaya Pendaftaran ke Nomor Rekening */}
            <BankInfoCard
              bankInfo={DEFAULT_BANK_INFO}
              registrationNumber={registrationNumber}
            />

            {/* 2. Akses ke Nomor Admin untuk Help & Pertanyaan */}
            <Card className="border-emerald-200 bg-emerald-50/40 shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-950">
                      Butuh Bantuan atau Ada Pertanyaan?
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Hubungi Admin PPDB (Ummu Rumi: 0821-6959-9979) melalui WhatsApp jika mengalami kendala pembayaran atau pendaftaran.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto shrink-0 border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100"
                >
                  <a
                    href={waHelpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Hubungi Admin (WA)
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* 3. Upload Foto Bukti Pembayaran */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)] text-white">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-900">
                      Unggah Foto Bukti Pembayaran
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Setelah mengunggah bukti pembayaran, Anda langsung dapat mengisi formulir pendaftaran.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="pt-5 space-y-5">
                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>{errorMessage}</div>
                    </div>
                  )}

                  {/* Registration Number Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="registration_number" className="text-xs font-semibold text-gray-700">
                      Nomor Pendaftaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="registration_number"
                      type="text"
                      placeholder="Contoh: PPDB-2027-00001"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      disabled={isSubmitting || Boolean(paramRegNumber)}
                      className="font-mono uppercase bg-slate-50/70"
                      required
                    />
                  </div>

                  {/* Access Code Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="access_code" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                        Kode Akses <span className="text-red-500">*</span>
                      </Label>
                      {initialAccessCode && (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Otomatis terisi dari pendaftaran
                        </span>
                      )}
                    </div>
                    <Input
                      id="access_code"
                      type="text"
                      maxLength={12}
                      placeholder="Masukkan 8 karakter kode akses Anda"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      disabled={isSubmitting}
                      className="font-mono uppercase bg-slate-50/70 tracking-wider"
                      required
                    />
                    <p className="text-[11px] text-gray-500">
                      Kode akses 8 karakter yang Anda terima pada langkah pendaftaran awal.
                    </p>
                  </div>

                  {/* File Upload Component */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs font-semibold text-gray-700">
                      Berkas Bukti Transfer (JPG, PNG, PDF) <span className="text-red-500">*</span>
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
                </CardContent>

                <CardFooter className="pt-2 pb-6 px-6 flex flex-col sm:flex-row gap-3">
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

                  <Button
                    type="button"
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto text-xs border-slate-300"
                  >
                    <Link to="/status">Cek Status Dulu</Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
