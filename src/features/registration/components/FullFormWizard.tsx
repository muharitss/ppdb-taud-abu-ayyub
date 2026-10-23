import React, { useState } from "react";
import {
  User,
  Users,
  HeartPulse,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Save,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  childSchema,
  fatherSchema,
  motherSchema,
  healthSchema,
  registrationFormSchema,
  type RegistrationFormData,
} from "../schemas/formSchema";
import { saveFormDraft, submitFullForm, uploadRegistrationDocument } from "../services/formService";

interface FullFormWizardProps {
  registrationNumber: string;
  accessCode: string;
  initialData?: Partial<RegistrationFormData>;
  initialDocs?: Array<{ document_type: string; file_path: string }>;
  isReadOnly?: boolean;
  onSubmitted?: () => void;
}

const STEPS = [
  { id: 1, label: "Calon Santri", icon: User },
  { id: 2, label: "Data Ayah", icon: Users },
  { id: 3, label: "Data Ibu", icon: Users },
  { id: 4, label: "Kesehatan", icon: HeartPulse },
  { id: 5, label: "Dokumen", icon: UploadCloud },
];

export const FullFormWizard: React.FC<FullFormWizardProps> = ({
  registrationNumber,
  accessCode,
  initialData,
  initialDocs = [],
  isReadOnly = false,
  onSubmitted,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    child: {
      full_name: initialData?.child?.full_name || "",
      nickname: initialData?.child?.nickname || "",
      nik: initialData?.child?.nik || "",
      birth_place: initialData?.child?.birth_place || "",
      birth_date: initialData?.child?.birth_date || "",
      gender: initialData?.child?.gender || "laki_laki",
      child_order: initialData?.child?.child_order || 1,
      sibling_count: initialData?.child?.sibling_count || 0,
      address: initialData?.child?.address || "",
      program: initialData?.child?.program || "2_tahun",
    },
    father: {
      full_name: initialData?.father?.full_name || "",
      nik: initialData?.father?.nik || "",
      birth_place: initialData?.father?.birth_place || "",
      birth_date: initialData?.father?.birth_date || "",
      last_education: initialData?.father?.last_education || "",
      occupation: initialData?.father?.occupation || "",
      monthly_income: initialData?.father?.monthly_income || "",
      whatsapp_number: initialData?.father?.whatsapp_number || "",
      address: initialData?.father?.address || "",
    },
    mother: {
      full_name: initialData?.mother?.full_name || "",
      nik: initialData?.mother?.nik || "",
      birth_place: initialData?.mother?.birth_place || "",
      birth_date: initialData?.mother?.birth_date || "",
      last_education: initialData?.mother?.last_education || "",
      occupation: initialData?.mother?.occupation || "",
      monthly_income: initialData?.mother?.monthly_income || "",
      whatsapp_number: initialData?.mother?.whatsapp_number || "",
      address: initialData?.mother?.address || "",
    },
    health: {
      weight_kg: initialData?.health?.weight_kg || ("" as unknown as number),
      height_cm: initialData?.health?.height_cm || ("" as unknown as number),
      blood_type: initialData?.health?.blood_type || "tidak_diketahui",
      allergy_history: initialData?.health?.allergy_history || "",
      disease_history: initialData?.health?.disease_history || "",
    },
  });

  // Uploaded docs tracker (by document_type)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialDocs.forEach((doc) => {
      map[doc.document_type] = doc.file_path;
    });
    return map;
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to update deeply nested form state
  const updateField = (section: keyof RegistrationFormData, field: string, value: unknown) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
    // Clear field-specific error
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${section}.${field}`];
      return next;
    });
  };

  // Validation per section
  const validateCurrentStep = (): boolean => {
    setErrors({});
    if (currentStep === 1) {
      const res = childSchema.safeParse(formData.child);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[`child.${iss.path.join(".")}`] = iss.message;
        });
        setErrors(errs);
        toast.error(res.error.issues[0]?.message || "Periksa kembali data santri");
        return false;
      }
    } else if (currentStep === 2) {
      const res = fatherSchema.safeParse(formData.father);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[`father.${iss.path.join(".")}`] = iss.message;
        });
        setErrors(errs);
        toast.error(res.error.issues[0]?.message || "Periksa kembali data ayah");
        return false;
      }
    } else if (currentStep === 3) {
      const res = motherSchema.safeParse(formData.mother);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[`mother.${iss.path.join(".")}`] = iss.message;
        });
        setErrors(errs);
        toast.error(res.error.issues[0]?.message || "Periksa kembali data ibu");
        return false;
      }
    } else if (currentStep === 4) {
      const res = healthSchema.safeParse(formData.health);
      if (!res.success) {
        const errs: Record<string, string> = {};
        res.error.issues.forEach((iss) => {
          errs[`health.${iss.path.join(".")}`] = iss.message;
        });
        setErrors(errs);
        toast.error(res.error.issues[0]?.message || "Periksa kembali data kesehatan");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (isReadOnly) {
      if (currentStep < 5) setCurrentStep((prev) => prev + 1);
      return;
    }

    if (!validateCurrentStep()) return;

    // Auto-save draft before advancing
    try {
      setIsSaving(true);
      await saveFormDraft(registrationNumber, accessCode, formData);
      toast.success("Draf berhasil disimpan");
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan draf");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleManualSaveDraft = async () => {
    if (isReadOnly) return;
    try {
      setIsSaving(true);
      await saveFormDraft(registrationNumber, accessCode, formData);
      toast.success("Draf kemajuan formulir berhasil disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan draf");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocUpload = async (docType: "kartu_keluarga" | "akte_kelahiran" | "pas_foto", file: File) => {
    if (isReadOnly) return;
    // Client-side quick check
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran berkas melebihi batas maksimal 5MB");
      return;
    }
    const allowedMime = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedMime.includes(file.type)) {
      toast.error("Format berkas harus JPEG, PNG, atau PDF");
      return;
    }

    try {
      setUploadingDoc(docType);
      const res = await uploadRegistrationDocument(registrationNumber, accessCode, docType, file);
      setUploadedDocs((prev) => ({ ...prev, [docType]: res.file_path }));
      toast.success("Dokumen berhasil diunggah!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah dokumen");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleFinalSubmit = async () => {
    if (isReadOnly) return;

    // 1. Validate full schema
    const fullValidation = registrationFormSchema.safeParse(formData);
    if (!fullValidation.success) {
      toast.error(fullValidation.error.issues[0]?.message || "Data formulir belum lengkap");
      return;
    }

    // 2. Check all 3 documents uploaded
    const requiredTypes = ["kartu_keluarga", "akte_kelahiran", "pas_foto"];
    const missing = requiredTypes.filter((t) => !uploadedDocs[t]);
    if (missing.length > 0) {
      toast.error("Wajib mengunggah seluruh dokumen (KK, Akta Kelahiran, dan Pas Foto)");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFullForm(registrationNumber, accessCode, fullValidation.data);
      toast.success("Formulir pendaftaran dan dokumen berhasil dikirim!");
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim formulir");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="bg-card border rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto overflow-x-auto gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep || isReadOnly) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={step.id > currentStep && !isReadOnly}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-muted"
                    : "text-muted-foreground hover:text-foreground opacity-60"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span>
                  {step.id}. {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isReadOnly && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Formulir Pendaftaran Telah Dikirim</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Data Anda telah terkunci dan tersimpan dalam sistem kami.
              </p>
            </div>
          </div>
          <a
            href="https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            Gabung Grup WhatsApp
          </a>
        </div>
      )}

      {/* Wizard Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Langkah {currentStep} dari 5: {STEPS[currentStep - 1]?.label}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Lengkapi identitas lengkap dan program pembelajaran calon peserta didik."}
                {currentStep === 2 && "Lengkapi data identitas, pendidikan, dan kontak ayah kandung/wali."}
                {currentStep === 3 && "Lengkapi data identitas, pendidikan, dan kontak ibu kandung."}
                {currentStep === 4 && "Informasi riwayat kesehatan, fisik, dan golongan darah santri."}
                {currentStep === 5 && "Unggah berkas persyaratan wajib (Kartu Keluarga, Akta, Pas Foto)."}
              </CardDescription>
            </div>
            {!isReadOnly && currentStep < 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSaveDraft}
                disabled={isSaving}
                className="hidden sm:inline-flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Draf
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* STEP 1: CALON SANTRI */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="child_name">Nama Lengkap Santri *</Label>
                <Input
                  id="child_name"
                  placeholder="Contoh: Muhammad Rayyan Al-Fatih"
                  value={formData.child?.full_name || ""}
                  onChange={(e) => updateField("child", "full_name", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["child.full_name"] && (
                  <p className="text-xs text-destructive">{errors["child.full_name"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_nickname">Nama Panggilan *</Label>
                <Input
                  id="child_nickname"
                  placeholder="Contoh: Rayyan"
                  value={formData.child?.nickname || ""}
                  onChange={(e) => updateField("child", "nickname", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["child.nickname"] && (
                  <p className="text-xs text-destructive">{errors["child.nickname"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_nik">NIK Santri (16 Digit) *</Label>
                <Input
                  id="child_nik"
                  maxLength={16}
                  placeholder="16 digit sesuai Kartu Keluarga"
                  value={formData.child?.nik || ""}
                  onChange={(e) => updateField("child", "nik", e.target.value.replace(/\D/g, ""))}
                  disabled={isReadOnly}
                />
                {errors["child.nik"] && (
                  <p className="text-xs text-destructive">{errors["child.nik"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_birth_place">Tempat Lahir *</Label>
                <Input
                  id="child_birth_place"
                  placeholder="Contoh: Duri"
                  value={formData.child?.birth_place || ""}
                  onChange={(e) => updateField("child", "birth_place", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["child.birth_place"] && (
                  <p className="text-xs text-destructive">{errors["child.birth_place"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_birth_date">Tanggal Lahir *</Label>
                <Input
                  id="child_birth_date"
                  type="date"
                  value={formData.child?.birth_date || ""}
                  onChange={(e) => updateField("child", "birth_date", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["child.birth_date"] && (
                  <p className="text-xs text-destructive">{errors["child.birth_date"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_gender">Jenis Kelamin *</Label>
                <select
                  id="child_gender"
                  value={formData.child?.gender || "laki_laki"}
                  onChange={(e) => updateField("child", "gender", e.target.value)}
                  disabled={isReadOnly}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                >
                  <option value="laki_laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_program">Program Pembelajaran *</Label>
                <select
                  id="child_program"
                  value={formData.child?.program || "2_tahun"}
                  onChange={(e) => updateField("child", "program", e.target.value)}
                  disabled={isReadOnly}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                >
                  <option value="1_tahun">1 Tahun (Usia 5-6 Tahun)</option>
                  <option value="2_tahun">2 Tahun (Usia 4-5 Tahun)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_order">Anak ke- *</Label>
                <Input
                  id="child_order"
                  type="number"
                  min={1}
                  value={formData.child?.child_order || ""}
                  onChange={(e) => updateField("child", "child_order", Number(e.target.value))}
                  disabled={isReadOnly}
                />
                {errors["child.child_order"] && (
                  <p className="text-xs text-destructive">{errors["child.child_order"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_sibling_count">Jumlah Saudara Kandung *</Label>
                <Input
                  id="child_sibling_count"
                  type="number"
                  min={0}
                  value={formData.child?.sibling_count ?? 0}
                  onChange={(e) => updateField("child", "sibling_count", Number(e.target.value))}
                  disabled={isReadOnly}
                />
                {errors["child.sibling_count"] && (
                  <p className="text-xs text-destructive">{errors["child.sibling_count"]}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="child_address">Alamat Tempat Tinggal Santri *</Label>
                <Textarea
                  id="child_address"
                  rows={3}
                  placeholder="Alamat lengkap domisili santri (Jl, RT/RW, Kelurahan, Kecamatan, Kota)"
                  value={formData.child?.address || ""}
                  onChange={(e) => updateField("child", "address", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["child.address"] && (
                  <p className="text-xs text-destructive">{errors["child.address"]}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: DATA AYAH */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="father_name">Nama Lengkap Ayah *</Label>
                <Input
                  id="father_name"
                  placeholder="Nama lengkap ayah kandung"
                  value={formData.father?.full_name || ""}
                  onChange={(e) => updateField("father", "full_name", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["father.full_name"] && (
                  <p className="text-xs text-destructive">{errors["father.full_name"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_nik">NIK Ayah (16 Digit) *</Label>
                <Input
                  id="father_nik"
                  maxLength={16}
                  placeholder="16 digit NIK ayah"
                  value={formData.father?.nik || ""}
                  onChange={(e) => updateField("father", "nik", e.target.value.replace(/\D/g, ""))}
                  disabled={isReadOnly}
                />
                {errors["father.nik"] && (
                  <p className="text-xs text-destructive">{errors["father.nik"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_wa">Nomor WhatsApp Ayah *</Label>
                <Input
                  id="father_wa"
                  placeholder="08xxxxxxxxxx"
                  value={formData.father?.whatsapp_number || ""}
                  onChange={(e) => updateField("father", "whatsapp_number", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["father.whatsapp_number"] && (
                  <p className="text-xs text-destructive">{errors["father.whatsapp_number"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_birth_place">Tempat Lahir Ayah *</Label>
                <Input
                  id="father_birth_place"
                  placeholder="Kota / Tempat Lahir"
                  value={formData.father?.birth_place || ""}
                  onChange={(e) => updateField("father", "birth_place", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["father.birth_place"] && (
                  <p className="text-xs text-destructive">{errors["father.birth_place"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_birth_date">Tanggal Lahir Ayah *</Label>
                <Input
                  id="father_birth_date"
                  type="date"
                  value={formData.father?.birth_date || ""}
                  onChange={(e) => updateField("father", "birth_date", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["father.birth_date"] && (
                  <p className="text-xs text-destructive">{errors["father.birth_date"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_education">Pendidikan Terakhir *</Label>
                <Input
                  id="father_education"
                  placeholder="SMA / D3 / S1 / S2 / lainnya"
                  value={formData.father?.last_education || ""}
                  onChange={(e) => updateField("father", "last_education", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["father.last_education"] && (
                  <p className="text-xs text-destructive">{errors["father.last_education"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="father_occupation">Pekerjaan Ayah *</Label>
                <Input
                  id="father_occupation"
                  placeholder="PNS / Swasta / Wiraswasta / lainnya"
                  value={formData.father?.occupation || ""}
                  onChange={(e) => updateField("father", "occupation", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["father.occupation"] && (
                  <p className="text-xs text-destructive">{errors["father.occupation"]}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="father_income">Penghasilan Bulanan (Opsional)</Label>
                <Input
                  id="father_income"
                  placeholder="Contoh: 3.000.000 - 5.000.000"
                  value={formData.father?.monthly_income || ""}
                  onChange={(e) => updateField("father", "monthly_income", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="father_address">Alamat Domisili Ayah *</Label>
                <Textarea
                  id="father_address"
                  rows={3}
                  placeholder="Alamat lengkap tempat tinggal ayah saat ini"
                  value={formData.father?.address || ""}
                  onChange={(e) => updateField("father", "address", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["father.address"] && (
                  <p className="text-xs text-destructive">{errors["father.address"]}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: DATA IBU */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mother_name">Nama Lengkap Ibu *</Label>
                <Input
                  id="mother_name"
                  placeholder="Nama lengkap ibu kandung"
                  value={formData.mother?.full_name || ""}
                  onChange={(e) => updateField("mother", "full_name", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["mother.full_name"] && (
                  <p className="text-xs text-destructive">{errors["mother.full_name"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_nik">NIK Ibu (16 Digit) *</Label>
                <Input
                  id="mother_nik"
                  maxLength={16}
                  placeholder="16 digit NIK ibu"
                  value={formData.mother?.nik || ""}
                  onChange={(e) => updateField("mother", "nik", e.target.value.replace(/\D/g, ""))}
                  disabled={isReadOnly}
                />
                {errors["mother.nik"] && (
                  <p className="text-xs text-destructive">{errors["mother.nik"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_wa">Nomor WhatsApp Ibu *</Label>
                <Input
                  id="mother_wa"
                  placeholder="08xxxxxxxxxx"
                  value={formData.mother?.whatsapp_number || ""}
                  onChange={(e) => updateField("mother", "whatsapp_number", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["mother.whatsapp_number"] && (
                  <p className="text-xs text-destructive">{errors["mother.whatsapp_number"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_birth_place">Tempat Lahir Ibu *</Label>
                <Input
                  id="mother_birth_place"
                  placeholder="Kota / Tempat Lahir"
                  value={formData.mother?.birth_place || ""}
                  onChange={(e) => updateField("mother", "birth_place", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["mother.birth_place"] && (
                  <p className="text-xs text-destructive">{errors["mother.birth_place"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_birth_date">Tanggal Lahir Ibu *</Label>
                <Input
                  id="mother_birth_date"
                  type="date"
                  value={formData.mother?.birth_date || ""}
                  onChange={(e) => updateField("mother", "birth_date", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["mother.birth_date"] && (
                  <p className="text-xs text-destructive">{errors["mother.birth_date"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_education">Pendidikan Terakhir *</Label>
                <Input
                  id="mother_education"
                  placeholder="SMA / D3 / S1 / S2 / lainnya"
                  value={formData.mother?.last_education || ""}
                  onChange={(e) => updateField("mother", "last_education", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["mother.last_education"] && (
                  <p className="text-xs text-destructive">{errors["mother.last_education"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mother_occupation">Pekerjaan Ibu *</Label>
                <Input
                  id="mother_occupation"
                  placeholder="Ibu Rumah Tangga / PNS / Swasta / dll"
                  value={formData.mother?.occupation || ""}
                  onChange={(e) => updateField("mother", "occupation", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["mother.occupation"] && (
                  <p className="text-xs text-destructive">{errors["mother.occupation"]}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mother_income">Penghasilan Bulanan (Opsional)</Label>
                <Input
                  id="mother_income"
                  placeholder="Contoh: 1.000.000 - 3.000.000"
                  value={formData.mother?.monthly_income || ""}
                  onChange={(e) => updateField("mother", "monthly_income", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="mother_address">Alamat Domisili Ibu *</Label>
                <Textarea
                  id="mother_address"
                  rows={3}
                  placeholder="Alamat lengkap tempat tinggal ibu saat ini"
                  value={formData.mother?.address || ""}
                  onChange={(e) => updateField("mother", "address", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors["mother.address"] && (
                  <p className="text-xs text-destructive">{errors["mother.address"]}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: KESEHATAN */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="health_weight">Berat Badan (kg) *</Label>
                <Input
                  id="health_weight"
                  type="number"
                  step="0.1"
                  min={1}
                  placeholder="Contoh: 16.5"
                  value={formData.health?.weight_kg || ""}
                  onChange={(e) => updateField("health", "weight_kg", Number(e.target.value))}
                  disabled={isReadOnly}
                />
                {errors["health.weight_kg"] && (
                  <p className="text-xs text-destructive">{errors["health.weight_kg"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="health_height">Tinggi Badan (cm) *</Label>
                <Input
                  id="health_height"
                  type="number"
                  step="0.5"
                  min={1}
                  placeholder="Contoh: 105"
                  value={formData.health?.height_cm || ""}
                  onChange={(e) => updateField("health", "height_cm", Number(e.target.value))}
                  disabled={isReadOnly}
                />
                {errors["health.height_cm"] && (
                  <p className="text-xs text-destructive">{errors["health.height_cm"]}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="health_blood">Golongan Darah</Label>
                <select
                  id="health_blood"
                  value={formData.health?.blood_type || "tidak_diketahui"}
                  onChange={(e) => updateField("health", "blood_type", e.target.value)}
                  disabled={isReadOnly}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                >
                  <option value="tidak_diketahui">Tidak Diketahui / Belum Cek</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="health_allergy">Riwayat Alergi (Opsional)</Label>
                <Textarea
                  id="health_allergy"
                  rows={2}
                  placeholder="Alergi makanan (telur, seafood), obat-obatan, dingin, debu, dll."
                  value={formData.health?.allergy_history || ""}
                  onChange={(e) => updateField("health", "allergy_history", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="health_disease">Riwayat Penyakit Khusus (Opsional)</Label>
                <Textarea
                  id="health_disease"
                  rows={2}
                  placeholder="Riwayat kejang, asma, riwayat operasi, dll jika ada"
                  value={formData.health?.disease_history || ""}
                  onChange={(e) => updateField("health", "disease_history", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          )}

          {/* STEP 5: UPLOAD DOKUMEN */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Format yang didukung: <strong>JPEG, PNG, atau PDF</strong>. Ukuran masing-masing berkas maksimal{" "}
                  <strong>5 MB</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Kartu Keluarga */}
                <Card className={`border ${uploadedDocs["kartu_keluarga"] ? "border-emerald-500/50 bg-emerald-50/20" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">1. Kartu Keluarga (KK)</CardTitle>
                      {uploadedDocs["kartu_keluarga"] ? (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-100 border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Terunggah
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 bg-amber-100 border-amber-300">
                          Wajib
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Foto/scan Kartu Keluarga terbaru yang memuat data calon santri.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isReadOnly && (
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          disabled={uploadingDoc === "kartu_keluarga"}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocUpload("kartu_keluarga", file);
                          }}
                        />
                        {uploadingDoc === "kartu_keluarga" && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md text-xs gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Akte Kelahiran */}
                <Card className={`border ${uploadedDocs["akte_kelahiran"] ? "border-emerald-500/50 bg-emerald-50/20" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">2. Akte Kelahiran</CardTitle>
                      {uploadedDocs["akte_kelahiran"] ? (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-100 border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Terunggah
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 bg-amber-100 border-amber-300">
                          Wajib
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Foto/scan Akta Kelahiran resmi dari Disdukcapil.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isReadOnly && (
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          disabled={uploadingDoc === "akte_kelahiran"}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocUpload("akte_kelahiran", file);
                          }}
                        />
                        {uploadingDoc === "akte_kelahiran" && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md text-xs gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Pas Foto 3x4 */}
                <Card className={`border ${uploadedDocs["pas_foto"] ? "border-emerald-500/50 bg-emerald-50/20" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">3. Pas Foto 3×4</CardTitle>
                      {uploadedDocs["pas_foto"] ? (
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-100 border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Terunggah
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 bg-amber-100 border-amber-300">
                          Wajib
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Foto santri berbusana muslim/muslimah rapi dengan latar bebas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isReadOnly && (
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          disabled={uploadingDoc === "pas_foto"}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocUpload("pas_foto", file);
                          }}
                        />
                        {uploadingDoc === "pas_foto" && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md text-xs gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSaving || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Sebelumnya
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Selanjutnya
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            ) : !isReadOnly ? (
              <Button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Mengirim Pendaftaran...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4 mr-1.5" />
                    Kirim Formulir Pendaftaran
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
