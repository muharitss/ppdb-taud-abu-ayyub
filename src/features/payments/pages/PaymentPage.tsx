import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  KeyRound,
  FileCheck2,
  AlertTriangle,
  Loader2,
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
    `Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya ingin bertanya / meminta bantuan terkait pendaftaran${
      registrationNumber ? ` (Nomor Pendaftaran: ${registrationNumber})` : ""
    }.`
  )}`;

  return (
    <div className="min-h-screen bg-[var(--color-light)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
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

                {!hasAutoCredentials && (
                  <>
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

                    <div className="space-y-1.5">
                      <Label htmlFor="access_code" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-gray-500" />
                        Kode Akses <span className="text-red-500">*</span>
                      </Label>
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
                    </div>
                  </>
                )}

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

              <CardFooter className="pt-2 pb-6 px-6">
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
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
