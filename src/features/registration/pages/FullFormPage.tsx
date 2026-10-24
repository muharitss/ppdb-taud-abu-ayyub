import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import {
  FileText,
  KeyRound,
  CreditCard,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Home,
  HelpCircle,
  MessageCircle,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FullFormWizard } from "../components/FullFormWizard";
import { fetchFormDetails, type FormGetResult } from "../services/formService";
import { BankInfoCard } from "@/features/payments/components/BankInfoCard";
import { PaymentProofUpload } from "@/features/payments/components/PaymentProofUpload";
import { DEFAULT_BANK_INFO, submitPaymentProof } from "@/features/payments/services/payment";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import { getSessionCredentials, saveSessionCredentials } from "@/lib/sessionCredentials";

export const FullFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { registrationNumber: paramRegNumber } = useParams<{ registrationNumber?: string }>();
  const location = useLocation();

  const stateData = location.state as { registrationNumber?: string; accessCode?: string } | undefined;
  const sessionCreds = getSessionCredentials();

  const initialRegNumber =
    paramRegNumber ||
    stateData?.registrationNumber ||
    (sessionCreds ? sessionCreds.registrationNumber : "");

  const initialAccessCode =
    stateData?.accessCode ||
    (sessionCreds && (!initialRegNumber || sessionCreds.registrationNumber === initialRegNumber)
      ? sessionCreds.accessCode
      : "");

  const [registrationNumber, setRegistrationNumber] = useState(initialRegNumber);
  const [accessCode, setAccessCode] = useState(initialAccessCode);

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [formDetails, setFormDetails] = useState<FormGetResult | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Inline payment proof upload state when payment_pending / payment_rejected
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [proofFileError, setProofFileError] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const loadData = useCallback(async (reg: string, code: string) => {
    if (!reg.trim() || !code.trim()) return;
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await fetchFormDetails(reg, code);
      setFormDetails(res);
      setHasLoaded(true);
      saveSessionCredentials(reg, code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memverifikasi akses formulir";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (registrationNumber && accessCode && !hasLoaded) {
      loadData(registrationNumber, accessCode);
    }
  }, [registrationNumber, accessCode, hasLoaded, loadData]);

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(registrationNumber, accessCode);
  };

  const handleProofUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProofFile || proofFileError) {
      toast.error(proofFileError || "Silakan pilih foto/berkas bukti pembayaran");
      return;
    }
    try {
      setIsUploadingProof(true);
      await submitPaymentProof({
        registrationNumber,
        accessCode,
        file: selectedProofFile,
      });
      toast.success("Bukti pembayaran berhasil diunggah! Membuka formulir pendaftaran...");
      await loadData(registrationNumber, accessCode);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah bukti pembayaran");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const waHelpUrl = `https://wa.me/${ADMIN_CONTACTS.primary.whatsappNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya ingin bertanya / meminta bantuan terkait pendaftaran${
      registrationNumber ? ` (Nomor Pendaftaran: ${registrationNumber})` : ""
    }.`
  )}`;

  const needsPaymentUpload =
    formDetails?.payment_status === "payment_pending" ||
    formDetails?.payment_status === "payment_rejected";

  const isReadOnlyForm =
    formDetails?.status === "submitted" ||
    formDetails?.status === "under_review" ||
    formDetails?.status === "accepted" ||
    formDetails?.status === "rejected";

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Formulir Lengkap PPDB</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                TAUD SaQu Abu Ayyub — TP. 2027/2028
              </p>
            </div>
          </div>
          <Link to="/" className="hidden sm:inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <Home className="w-3.5 h-3.5 mr-1" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* 1. Credential Input Form if not authenticated */}
        {!hasLoaded && (
          <Card className="max-w-lg mx-auto shadow-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">Akses Formulir Pendaftaran</CardTitle>
              <CardDescription>
                Masukkan Nomor Pendaftaran dan Kode Akses rahasia yang Anda peroleh saat pendaftaran awal.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCredentialSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regNum">Nomor Pendaftaran</Label>
                  <Input
                    id="regNum"
                    placeholder="Contoh: PPDB-2027-00001"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accCode">Kode Akses (8 Karakter)</Label>
                  <Input
                    id="accCode"
                    maxLength={8}
                    placeholder="Contoh: ABCD2345"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                {authError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      Buka Formulir
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <div className="text-center pt-1">
                  <a
                    href={`https://wa.me/${ADMIN_CONTACTS.primary.whatsappNumber}?text=${encodeURIComponent(
                      "Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya lupa/kehilangan Kode Akses Pendaftaran saya. Mohon bantuannya."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-emerald-700 underline inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Lupa / Kehilangan Kode Akses? Hubungi Admin
                  </a>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* 2. Authenticated: Evaluate State */}
        {hasLoaded && formDetails && (
          <div>
            {/* GATING: Payment Pending or Rejected -> Show Bank Info + Admin Help + Upload Proof */}
            {needsPaymentUpload ? (
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {formDetails.payment_status === "payment_rejected"
                        ? "Bukti Pembayaran Perlu Diunggah Ulang"
                        : "Unggah Bukti Pembayaran untuk Membuka Formulir"}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Silakan lakukan pembayaran biaya pendaftaran (Rp 300.000) dan unggah foto bukti pembayaran di bawah ini. Begitu bukti pembayaran diunggah, Anda dapat langsung mengisi formulir pendaftaran.
                    </p>
                  </div>
                </div>

                {/* 1. Keterangan Membayar Biaya Pendaftaran ke Nomor Rekening */}
                <BankInfoCard bankInfo={DEFAULT_BANK_INFO} registrationNumber={registrationNumber} />

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
                          Hubungi Admin PPDB (Ummu Rumi: 0821-6959-9979) melalui WhatsApp untuk bantuan pendaftaran dan pembayaran.
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

                {/* 3. Upload Foto Bukti Pembayaran -> Langsung Buka Formulir */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-base">Unggah Foto Bukti Pembayaran</CardTitle>
                        <CardDescription className="text-xs">
                          Unggah foto/struk transfer untuk langsung membuka halaman formulir pendaftaran.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <form onSubmit={handleProofUpload}>
                    <CardContent className="space-y-3">
                      <PaymentProofUpload
                        selectedFile={selectedProofFile}
                        onFileSelect={(file, err) => {
                          setSelectedProofFile(file);
                          setProofFileError(err || null);
                        }}
                        disabled={isUploadingProof}
                      />
                      {proofFileError && (
                        <p className="text-xs text-destructive font-medium">{proofFileError}</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        disabled={isUploadingProof || !selectedProofFile}
                        className="w-full sm:w-auto"
                      >
                        {isUploadingProof ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mengunggah Bukti Pembayaran...
                          </>
                        ) : (
                          <>
                            <FileCheck2 className="w-4 h-4 mr-2" />
                            Unggah & Buka Formulir Pendaftaran
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            ) : (
              /* Payment Proof Uploaded (payment_submitted or payment_verified) -> Directly Show FullFormWizard */
              <FullFormWizard
                registrationNumber={formDetails.registration_number}
                accessCode={accessCode}
                initialData={formDetails.form_data}
                initialDocs={formDetails.documents}
                isReadOnly={isReadOnlyForm}
                onSubmitted={(submittedChildName) => {
                  navigate("/daftar/berhasil", {
                    state: {
                      registrationNumber,
                      accessCode,
                      childName: submittedChildName || formDetails?.form_data?.child?.full_name,
                    },
                  });
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullFormPage;
