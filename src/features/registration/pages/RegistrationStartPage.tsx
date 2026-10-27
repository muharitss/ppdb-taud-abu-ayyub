import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Phone,
  Baby,
  AlertTriangle,
  Loader2,
  Home,
  Search,
  ArrowRight,
  PlusCircle,
  Copy,
  Check,
  FileCheck2,
  MessageCircle,
} from "lucide-react";

import {
  initialRegistrationSchema,
  type InitialRegistrationInput,
} from "../schemas/initial-registration.schema";
import { createRegistration } from "../services/registration";
import { PaymentProofUpload } from "@/features/payments/components/PaymentProofUpload";
import { DEFAULT_BANK_INFO } from "@/features/payments/services/payment";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import {
  saveSessionCredentials,
  getSessionCredentials,
  clearSessionCredentials,
  getResumeUrl,
} from "@/lib/sessionCredentials";
import { verifyRegistrationAccess } from "@/lib/api/status";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

export const RegistrationStartPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(() =>
    getSessionCredentials(),
  );
  const [isValidatingSession, setIsValidatingSession] = useState(Boolean(activeSession));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate active session against server in case it was deleted by an admin
  useEffect(() => {
    const creds = getSessionCredentials();
    if (!creds) {
      setIsValidatingSession(false);
      return;
    }
    let isMounted = true;

    verifyRegistrationAccess({
      registrationNumber: creds.registrationNumber,
      accessCode: creds.accessCode,
    })
      .then((res) => {
        if (isMounted) {
          saveSessionCredentials(
            creds.registrationNumber,
            creds.accessCode,
            creds.childName,
            res.payment_status,
          );
          setActiveSession(getSessionCredentials());
          setIsValidatingSession(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          clearSessionCredentials(creds.registrationNumber);
          setActiveSession(null);
          setIsValidatingSession(false);
          toast.info(
            "Pendaftaran sebelumnya tidak ditemukan atau telah dihapus oleh pihak sekolah. Silakan lakukan pendaftaran baru.",
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const form = useForm<InitialRegistrationInput>({
    resolver: zodResolver(initialRegistrationSchema),
    defaultValues: {
      child_name: "",
      whatsapp_number: "",
    },
  });

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(DEFAULT_BANK_INFO.amount);

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

  const handleFileSelect = (file: File | null, error?: string | null) => {
    setSelectedFile(file);
    setFileError(error || null);
    if (error) {
      toast.error(error);
    }
  };

  const onSubmit = async (values: InitialRegistrationInput) => {
    setErrorMessage(null);

    if (!selectedFile) {
      const err = "Silakan unggah bukti transfer pembayaran terlebih dahulu";
      setFileError(err);
      toast.error(err);
      return;
    }

    if (fileError) {
      toast.error(fileError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createRegistration({
        child_name: values.child_name,
        whatsapp_number: values.whatsapp_number,
        file: selectedFile,
      });

      saveSessionCredentials(
        response.registration_number,
        response.access_code,
        values.child_name,
        "payment_submitted",
      );

      toast.success(
        `Pendaftaran & bukti pembayaran berhasil dikirim! No: ${response.registration_number}`,
      );

      navigate(`/daftar/formulir/${encodeURIComponent(response.registration_number)}`, {
        replace: true,
        state: {
          registrationNumber: response.registration_number,
          accessCode: response.access_code,
          childName: values.child_name,
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewForAnotherChild = () => {
    clearSessionCredentials(activeSession?.registrationNumber);
    setActiveSession(null);
  };

  const waHelpUrl = `https://wa.me/${ADMIN_CONTACTS.primary.whatsappNumber}?text=${encodeURIComponent(
    "Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya ingin bertanya / meminta bantuan terkait pendaftaran & pembayaran."
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 islamic-pattern py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span className="font-semibold text-emerald-800">TAUD SaQu Abu Ayyub</span>
          <Link
            to="/"
            className="inline-flex items-center hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Judul Halaman di luar Card */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">
            Formulir Pendaftaran & Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Penerimaan Peserta Didik Baru (PPDB) TP 2027/2028
          </p>
        </div>

        <Card className="border border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-5">
            {isValidatingSession ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                <p className="text-xs text-slate-500">
                  Memeriksa status pendaftaran aktif di perangkat ini...
                </p>
              </div>
            ) : activeSession ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5 text-sm">
                  <p className="font-semibold text-emerald-950">
                    Anda Memiliki Pendaftaran yang Sedang Berjalan
                  </p>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Sistem mendeteksi pendaftaran aktif di perangkat ini. Silakan
                    lanjutkan pendaftaran tersebut agar tidak membuat data ganda.
                  </p>
                  <div className="bg-white rounded-lg border border-emerald-200/80 p-3 space-y-1.5 text-xs">
                    {activeSession.childName && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Calon Siswa:</span>
                        <span className="font-semibold text-slate-800">
                          {activeSession.childName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nomor Pendaftaran:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {activeSession.registrationNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kode Akses:</span>
                      <span className="font-mono font-bold text-amber-800 tracking-wider">
                        {activeSession.accessCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Button
                    asChild
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold"
                  >
                    <Link
                      to={getResumeUrl(activeSession)}
                      state={{
                        registrationNumber: activeSession.registrationNumber,
                        accessCode: activeSession.accessCode,
                        childName: activeSession.childName,
                      }}
                    >
                      Lanjutkan Pendaftaran Ini
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full text-xs">
                    <Link to="/status">
                      <Search className="w-3.5 h-3.5 mr-1.5" />
                      Lihat Status Pendaftaran
                    </Link>
                  </Button>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleStartNewForAnotherChild}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                      Daftar Calon Siswa Baru / Reset Sesi Ini
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Biaya Pendaftaran & Nominal */}
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
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>{errorMessage}</div>
                    </div>
                  </div>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* Child Name */}
                    <FormField
                      control={form.control}
                      name="child_name"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Baby className="w-3.5 h-3.5 text-slate-400" />
                            Nama Lengkap Calon Siswa <span className="text-red-500">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              placeholder="Contoh: Muhammad Fatih Al-Ayyubi"
                              disabled={isSubmitting}
                              className="text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* WhatsApp Number */}
                    <FormField
                      control={form.control}
                      name="whatsapp_number"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            Nomor Handphone / WhatsApp Aktif <span className="text-red-500">*</span>
                          </Label>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Contoh: 08123456789 atau 628123456789"
                              disabled={isSubmitting}
                              className="text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-[11px] text-slate-500">
                            Digunakan untuk konfirmasi dan komunikasi panitia PPDB.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unggah Bukti */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
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
                          Memproses & Mengunggah...
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-4 h-4 mr-2" />
                          Daftar & Kirim Bukti Pembayaran
                        </>
                      )}
                    </Button>

                    <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                      <p className="text-xs text-slate-500">
                        Sudah pernah mendaftar sebelumnya?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs"
                      >
                        <Link to="/status">
                          <Search className="w-3.5 h-3.5 mr-1.5" />
                          Lihat Status Pendaftaran
                        </Link>
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}
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

export default RegistrationStartPage;
