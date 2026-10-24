import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  KeyRound,
  FileText,
  AlertTriangle,
  Loader2,
  Home,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_CONTACTS } from "@/config/schoolInfo";
import { getSessionCredentials } from "@/lib/sessionCredentials";
import { verifyRegistrationAccess, type VerifyAccessData } from "@/lib/api/status";
import { StatusDisplay } from "../components/StatusDisplay";

export const StatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryReg = searchParams.get("r") || "";

  const sessionCreds = getSessionCredentials();
  const initialReg = queryReg || (sessionCreds ? sessionCreds.registrationNumber : "");
  const initialCode = sessionCreds && sessionCreds.registrationNumber === initialReg ? sessionCreds.accessCode : "";

  const [registrationNumber, setRegistrationNumber] = useState(initialReg);
  const [accessCode, setAccessCode] = useState(initialCode);

  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<VerifyAccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLookup = useCallback(async (reg: string, code: string) => {
    const cleanReg = reg.trim().toUpperCase();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanReg) {
      toast.error("Nomor pendaftaran wajib diisi");
      return;
    }
    if (!cleanCode) {
      toast.error("Kode akses wajib diisi");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await verifyRegistrationAccess({
        registrationNumber: cleanReg,
        accessCode: cleanCode,
      });
      setStatusData(res);
      toast.success("Status pendaftaran berhasil ditemukan!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nomor pendaftaran atau kode akses tidak valid";
      setErrorMessage(msg);
      toast.error(msg);
      setStatusData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-check if credentials are fully present in session on initial load
  useEffect(() => {
    if (initialReg && initialCode && !statusData && !isLoading) {
      handleLookup(initialReg, initialCode);
    }
  }, [initialReg, initialCode, statusData, isLoading, handleLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(registrationNumber, accessCode);
  };

  const handleReset = () => {
    setStatusData(null);
    setErrorMessage(null);
    setRegistrationNumber("");
    setAccessCode("");
  };

  const waRecoveryUrl = `https://wa.me/${ADMIN_CONTACTS.primary.whatsappNumber}?text=${encodeURIComponent(
    `Assalamu'alaikum Admin PPDB TAUD Abu Ayyub, saya ingin menanyakan kode akses pendaftaran saya.${
      registrationNumber ? ` (Nomor Pendaftaran: ${registrationNumber})` : ""
    }`
  )}`;

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

        {/* Status Result View */}
        {statusData ? (
          <div className="space-y-4">
            <StatusDisplay data={statusData} accessCode={accessCode} />
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Periksa Pendaftaran Lain
              </Button>
            </div>
          </div>
        ) : (
          /* Search Form Card */
          <Card className="shadow-lg border-emerald-100">
            <CardHeader className="text-center pb-4 bg-emerald-50/70 border-b border-emerald-100/60">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-inner">
                <Search className="w-7 h-7" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-950">
                Cek Status Pendaftaran
              </CardTitle>
              <CardDescription className="text-emerald-800/80 text-xs sm:text-sm">
                Masukkan Nomor Pendaftaran dan Kode Akses rahasia Anda untuk melihat status terkini berkas pendaftaran santri baru.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regNumber" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Nomor Pendaftaran <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="regNumber"
                    placeholder="Contoh: PPDB-2027-00001"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessCode" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    Kode Akses (8 Karakter) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="accessCode"
                    maxLength={8}
                    placeholder="Contoh: ABCD2345"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Kode rahasia yang Anda peroleh saat pendaftaran awal.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memeriksa Status...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Periksa Status Pendaftaran
                    </>
                  )}
                </Button>

                <div className="text-center pt-1">
                  <a
                    href={waRecoveryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-emerald-700 underline inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Lupa Nomor Pendaftaran / Kode Akses? Hubungi Admin
                  </a>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StatusPage;
