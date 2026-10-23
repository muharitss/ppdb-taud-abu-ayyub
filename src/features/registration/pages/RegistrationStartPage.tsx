import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Phone,
  Baby,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Home,
} from "lucide-react";

import {
  initialRegistrationSchema,
  type InitialRegistrationInput,
} from "../schemas/initial-registration.schema";
import { createRegistration } from "../services/registration";
import type { CreateRegistrationResponse } from "../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

export const RegistrationStartPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<CreateRegistrationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InitialRegistrationInput>({
    resolver: zodResolver(initialRegistrationSchema),
    defaultValues: {
      child_name: "",
      parent_name: "",
      whatsapp_number: "",
    },
  });

  const onSubmit = async (values: InitialRegistrationInput) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await createRegistration(values);
      setSuccessData(response);
      toast.success("Pendaftaran awal berhasil dibuat!");
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

  const handleCopyCode = async () => {
    if (!successData?.access_code) return;
    try {
      await navigator.clipboard.writeText(successData.access_code);
      setCopied(true);
      toast.success("Kode akses berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Gagal menyalin kode. Silakan catat secara manual.");
    }
  };

  const handleProceedToPayment = () => {
    if (!successData) return;
    // Pass accessCode strictly in React Router in-memory navigation state (never persistent storage)
    navigate(`/bayar/${encodeURIComponent(successData.registration_number)}`, {
      state: { accessCode: successData.access_code },
    });
  };

  // Render Success Screen
  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 islamic-pattern py-8 px-4 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg border-slate-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Pendaftaran Berhasil Dibuat
            </CardTitle>
            <CardDescription className="text-slate-600">
              TAUD SaQu Abu Ayyub — TP 2026/2027
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Registration Number Display */}
            <div className="bg-slate-100 rounded-lg p-3 text-center border border-slate-200">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block mb-0.5">
                Nomor Pendaftaran
              </span>
              <span className="text-xl font-bold font-mono text-slate-800 tracking-wider">
                {successData.registration_number}
              </span>
            </div>

            {/* Access Code Display */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-center">
              <span className="text-xs uppercase tracking-wider text-amber-800 font-bold block mb-1">
                Kode Akses Pendaftaran
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-widest text-amber-950 py-2 select-all">
                {successData.access_code}
              </div>
              <div className="mt-2 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="border-amber-300 text-amber-900 hover:bg-amber-100"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-emerald-600" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" /> Salin Kode Akses
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Critical Security Warning */}
            <div
              role="alert"
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md text-sm text-red-900 space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-red-950">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>PENTING! SIMPAN KODE AKSES INI</span>
              </div>
              <p className="text-xs leading-relaxed text-red-800">
                Kode ini <strong>hanya ditampilkan satu kali</strong> pada layar ini dan tidak disimpan dalam peramban Anda demi keamanan. Simpan atau catat nomor pendaftaran dan kode akses ini untuk memeriksa status dan melanjutkan proses pendaftaran.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full sm:w-auto text-slate-700"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-1" /> Beranda
              </Link>
            </Button>
            <Button
              type="button"
              onClick={handleProceedToPayment}
              className="w-full sm:flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium"
            >
              Lanjut ke Pembayaran <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render Registration Form
  return (
    <div className="min-h-screen bg-slate-50 islamic-pattern py-10 px-4 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-md border-slate-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Formulir Pendaftaran Awal
          </CardTitle>
          <CardDescription className="text-slate-600">
            Penerimaan Peserta Didik Baru (PPDB) TAUD SaQu Abu Ayyub TP 2026/2027
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3 flex items-start gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Child Name */}
              <FormField
                control={form.control}
                name="child_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Baby className="w-4 h-4 text-slate-500" />
                      Nama Lengkap Calon Santri
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Muhammad Fatih Al-Ayyubi"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Name */}
              <FormField
                control={form.control}
                name="parent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 font-medium text-slate-700">
                      <User className="w-4 h-4 text-slate-500" />
                      Nama Orang Tua / Wali
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Abdullah"
                        disabled={isSubmitting}
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
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Phone className="w-4 h-4 text-slate-500" />
                      Nomor WhatsApp Aktif
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Contoh: 08123456789 atau 628123456789"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Digunakan untuk konfirmasi dan tautan komunikasi panitia PPDB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto text-slate-700"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-1" /> Beranda
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Daftar Sekarang"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationStartPage;
