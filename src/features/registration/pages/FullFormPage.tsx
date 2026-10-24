import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import {
  FileText,
  KeyRound,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Home,
  MessageCircle,
  Copy,
  Check,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FullFormWizard } from "../components/FullFormWizard";
import { fetchFormDetails, type FormGetResult } from "../services/formService";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import {
  getSessionCredentials,
  saveSessionCredentials,
  clearSessionCredentials,
} from "@/lib/sessionCredentials";

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
  const [copiedCreds, setCopiedCreds] = useState(false);
  const hasAutoLoadedRef = useRef(false);

  const loadData = useCallback(async (reg: string, code: string) => {
    if (!reg.trim() || !code.trim()) return;
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await fetchFormDetails(reg, code);
      saveSessionCredentials(reg, code, res.form_data?.child?.full_name);

      if (res.payment_status === "payment_pending" || res.payment_status === "payment_rejected") {
        navigate(`/bayar/${encodeURIComponent(res.registration_number)}`, {
          replace: true,
          state: {
            registrationNumber: res.registration_number,
            accessCode: code.trim().toUpperCase(),
            childName: res.form_data?.child?.full_name,
          },
        });
        return;
      }

      setFormDetails(res);
      setHasLoaded(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memverifikasi akses formulir";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleCopyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(
        `Nomor Pendaftaran: ${registrationNumber}\nKode Akses: ${accessCode}`
      );
      setCopiedCreds(true);
      toast.success("Nomor Pendaftaran & Kode Akses berhasil disalin");
      setTimeout(() => setCopiedCreds(false), 2000);
    } catch {
      toast.error("Gagal menyalin kredensial");
    }
  };

  const handleSwitchSession = () => {
    clearSessionCredentials();
    hasAutoLoadedRef.current = true;
    setHasLoaded(false);
    setFormDetails(null);
    setRegistrationNumber("");
    setAccessCode("");
  };

  useEffect(() => {
    if (!hasAutoLoadedRef.current && initialRegNumber && initialAccessCode) {
      hasAutoLoadedRef.current = true;
      loadData(initialRegNumber, initialAccessCode);
    }
  }, [initialRegNumber, initialAccessCode, loadData]);

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(registrationNumber, accessCode);
  };

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
          <Link to="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <Home className="w-3.5 h-3.5 mr-1" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Active Credential Bar so user never loses Access Code */}
        {hasLoaded && formDetails && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div>
                <span className="text-slate-500 mr-1.5">No. Pendaftaran:</span>
                <span className="font-mono font-bold text-emerald-900">
                  {formDetails.registration_number}
                </span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">Kode Akses:</span>
                <span className="font-mono font-bold text-amber-900 tracking-wider">
                  {accessCode}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCredentials}
                className="h-7 px-2.5 text-xs bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              >
                {copiedCreds ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Salin Kredensial
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSwitchSession}
                className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800"
                title="Ganti nomor pendaftaran lain"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Ganti Sesi
              </Button>
            </div>
          </div>
        )}

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

        {/* 2. Authenticated: Directly Show FullFormWizard (unpaid registrations redirect to /bayar/:reg) */}
        {hasLoaded && formDetails && (
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
    </div>
  );
};

export default FullFormPage;
