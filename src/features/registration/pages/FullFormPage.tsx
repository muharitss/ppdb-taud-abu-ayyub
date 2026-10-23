import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FileText,
  KeyRound,
  CreditCard,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Home,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FullFormWizard } from "../components/FullFormWizard";
import { fetchFormDetails, type FormGetResult } from "../services/formService";
import { BankInfoCard } from "@/features/payments/components/BankInfoCard";
import { DEFAULT_BANK_INFO } from "@/features/payments/services/payment";

export const FullFormPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = (location.state as { registrationNumber?: string; accessCode?: string } | undefined);
  const [registrationNumber, setRegistrationNumber] = useState(stateData?.registrationNumber || "");
  const [accessCode, setAccessCode] = useState(stateData?.accessCode || "");

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [formDetails, setFormDetails] = useState<FormGetResult | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadData = useCallback(async (reg: string, code: string) => {
    if (!reg.trim() || !code.trim()) return;
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await fetchFormDetails(reg, code);
      setFormDetails(res);
      setHasLoaded(true);
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
          <Link to="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
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
              <CardFooter>
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
              </CardFooter>
            </form>
          </Card>
        )}

        {/* 2. Authenticated: Evaluate State */}
        {hasLoaded && formDetails && (
          <div>
            {/* GATING CASE A: Payment Pending */}
            {formDetails.payment_status === "payment_pending" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Pembayaran Biaya Formulir Belum Dilakukan</p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Akses pengisian formulir lengkap dan upload berkas digembok sampai bukti transfer biaya formulir
                      (Rp 300.000) diunggah dan diverifikasi.
                    </p>
                  </div>
                </div>

                <BankInfoCard bankInfo={DEFAULT_BANK_INFO} registrationNumber={registrationNumber} />

                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      navigate("/daftar/pembayaran", {
                        state: { registrationNumber, accessCode },
                      })
                    }
                    className="w-full sm:w-auto"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Unggah Bukti Pembayaran Sekarang
                  </Button>
                </div>
              </div>
            )}

            {/* GATING CASE B: Payment Submitted (Pending Admin Review) */}
            {formDetails.payment_status === "payment_submitted" && (
              <Card className="text-center py-8">
                <CardHeader>
                  <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-2">
                    <Clock className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl">Bukti Pembayaran Sedang Diverifikasi</CardTitle>
                  <CardDescription className="max-w-md mx-auto text-sm mt-2">
                    Bukti pembayaran transfer Rp 300.000 untuk nomor pendaftaran{" "}
                    <strong>{formDetails.registration_number}</strong> telah kami terima dan sedang dalam antrean
                    verifikasi oleh admin panitia.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted max-w-md mx-auto text-xs text-muted-foreground text-left space-y-2">
                    <p className="font-medium text-foreground">Apa langkah selanjutnya?</p>
                    <p>1. Verifikasi manual dilakukan panitia dalam waktu 1×24 jam kerja.</p>
                    <p>2. Begitu status diverifikasi, formulir pendaftaran ini akan terbuka secara otomatis.</p>
                    <p>3. Anda dapat memeriksa berkala melalui halaman status pendaftaran.</p>
                  </div>
                </CardContent>
                <CardFooter className="justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate("/status", {
                        state: { registrationNumber, accessCode },
                      })
                    }
                  >
                    Cek Status Pendaftaran
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* CASE C: Awaiting Form or Submitted -> Wizard View */}
            {(formDetails.status === "awaiting_form" ||
              formDetails.status === "submitted" ||
              formDetails.status === "under_review" ||
              formDetails.status === "accepted") && (
              <FullFormWizard
                registrationNumber={formDetails.registration_number}
                accessCode={accessCode}
                initialData={formDetails.form_data}
                initialDocs={formDetails.documents}
                isReadOnly={formDetails.status !== "awaiting_form"}
                onSubmitted={() => {
                  loadData(registrationNumber, accessCode);
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
