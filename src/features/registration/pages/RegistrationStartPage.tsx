import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  Phone,
  Baby,
  AlertTriangle,
  Loader2,
  Home,
  Search,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

import {
  initialRegistrationSchema,
  type InitialRegistrationInput,
} from "../schemas/initial-registration.schema";
import { createRegistration } from "../services/registration";
import {
  saveSessionCredentials,
  getSessionCredentials,
  clearSessionCredentials,
} from "@/lib/sessionCredentials";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  const [activeSession, setActiveSession] = useState(() => getSessionCredentials());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      saveSessionCredentials(
        response.registration_number,
        response.access_code,
        values.child_name
      );
      toast.success("Pendaftaran awal berhasil! Silakan unggah bukti transfer.");
      navigate(`/bayar/${encodeURIComponent(response.registration_number)}`, {
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
    clearSessionCredentials();
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 islamic-pattern py-10 px-4 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-md border-slate-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">
            Formulir Pendaftaran Awal
          </CardTitle>
          <CardDescription className="text-slate-600">
            Penerimaan Peserta Didik Baru (PPDB) TAUD SaQu Abu Ayyub TP 2027/2028
          </CardDescription>
        </CardHeader>

        <CardContent>
          {activeSession ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5 text-sm">
                <p className="font-semibold text-emerald-950">
                  Anda Memiliki Pendaftaran yang Sedang Berjalan
                </p>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Sistem mendeteksi pendaftaran aktif di perangkat ini. Silakan lanjutkan pendaftaran tersebut agar tidak membuat data ganda.
                </p>
                <div className="bg-white rounded-lg border border-emerald-200/80 p-3 space-y-1.5 text-xs">
                  {activeSession.childName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Calon Santri:</span>
                      <span className="font-semibold text-slate-800">{activeSession.childName}</span>
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
                    to={`/daftar/formulir/${encodeURIComponent(activeSession.registrationNumber)}`}
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
                    Daftar Calon Santri Baru (Anak Lain)
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
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

              <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">Sudah pernah mendaftar sebelumnya?</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50"
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
  );
};

export default RegistrationStartPage;
