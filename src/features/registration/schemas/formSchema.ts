import { z } from "zod";

/**
 * Full Registration Form Zod Schemas
 * Specs: specs/04-data-model.md (Section 3.5), task/task-020-form-requirements-confirmation.md
 */

// Phone, NIK, and ISO date regex constants
export const NIK_REGEX = /^\d{16}$/;
export const WHATSAPP_REGEX = /^(\+?62|0)8[1-9][0-9]{6,10}$/;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Enums
export const documentTypeSchema = z.enum([
  "kartu_keluarga",
  "akte_kelahiran",
]);
export type DocumentType = z.infer<typeof documentTypeSchema>;

export const genderSchema = z.enum(["laki_laki", "perempuan"]);
export type Gender = z.infer<typeof genderSchema>;

export const programSchema = z.enum(["1_tahun", "2_tahun"]);
export type Program = z.infer<typeof programSchema>;

export const bloodTypeSchema = z.enum([
  "A",
  "B",
  "AB",
  "O",
  "tidak_diketahui",
]);
export type BloodType = z.infer<typeof bloodTypeSchema>;

// Section 1 — Data Calon Peserta Didik
export const childSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap calon santri minimal 2 karakter")
    .max(100, "Nama lengkap calon santri maksimal 100 karakter"),
  nickname: z
    .string()
    .trim()
    .min(1, "Nama panggilan calon santri wajib diisi")
    .max(50, "Nama panggilan calon santri maksimal 50 karakter"),
  nik: z
    .string()
    .trim()
    .regex(NIK_REGEX, "NIK santri harus terdiri dari 16 digit angka"),
  birth_place: z
    .string()
    .trim()
    .min(2, "Tempat lahir santri minimal 2 karakter")
    .max(100, "Tempat lahir santri maksimal 100 karakter"),
  birth_date: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Format tanggal lahir santri harus YYYY-MM-DD"),
  gender: genderSchema,
  child_order: z.coerce
    .number()
    .int("Urutan anak harus berupa bilangan bulat")
    .min(1, "Urutan anak (anak ke-) minimal 1"),
  sibling_count: z.coerce
    .number()
    .int("Jumlah saudara harus berupa bilangan bulat")
    .min(0, "Jumlah saudara kandung minimal 0"),
  address: z
    .string()
    .trim()
    .min(5, "Alamat tempat tinggal santri minimal 5 karakter")
    .max(500, "Alamat tempat tinggal santri maksimal 500 karakter"),
  program: programSchema,
});
export type ChildFormData = z.infer<typeof childSchema>;

// Section 2 & 3 — Data Orang Tua (Ayah & Ibu)
const parentBaseSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  nik: z
    .string()
    .trim()
    .regex(NIK_REGEX, "NIK harus terdiri dari 16 digit angka"),
  birth_place: z
    .string()
    .trim()
    .min(2, "Tempat lahir minimal 2 karakter")
    .max(100, "Tempat lahir maksimal 100 karakter"),
  birth_date: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Format tanggal lahir harus YYYY-MM-DD"),
  last_education: z
    .string()
    .trim()
    .min(1, "Pendidikan terakhir wajib diisi")
    .max(50, "Pendidikan terakhir maksimal 50 karakter"),
  occupation: z
    .string()
    .trim()
    .min(1, "Pekerjaan wajib diisi")
    .max(100, "Pekerjaan maksimal 100 karakter"),
  monthly_income: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z
      .string()
      .trim()
      .max(100, "Penghasilan maksimal 100 karakter")
      .optional()
  ),
  whatsapp_number: z
    .string()
    .trim()
    .regex(
      WHATSAPP_REGEX,
      "Format nomor WhatsApp tidak valid (contoh: 08123456789 atau 628123456789)"
    ),
  address: z
    .string()
    .trim()
    .min(5, "Alamat domisili minimal 5 karakter")
    .max(500, "Alamat domisili maksimal 500 karakter"),
});

export const fatherSchema = parentBaseSchema.extend({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap ayah minimal 2 karakter")
    .max(100, "Nama lengkap ayah maksimal 100 karakter"),
  nik: z
    .string()
    .trim()
    .regex(NIK_REGEX, "NIK ayah harus terdiri dari 16 digit angka"),
  birth_place: z
    .string()
    .trim()
    .min(2, "Tempat lahir ayah minimal 2 karakter")
    .max(100, "Tempat lahir ayah maksimal 100 karakter"),
  birth_date: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Format tanggal lahir ayah harus YYYY-MM-DD"),
  whatsapp_number: z
    .string()
    .trim()
    .regex(
      WHATSAPP_REGEX,
      "Format nomor WhatsApp ayah tidak valid (contoh: 08123456789)"
    ),
  address: z
    .string()
    .trim()
    .min(5, "Alamat ayah minimal 5 karakter")
    .max(500, "Alamat ayah maksimal 500 karakter"),
});
export type FatherFormData = z.infer<typeof fatherSchema>;

export const motherSchema = parentBaseSchema.extend({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap ibu minimal 2 karakter")
    .max(100, "Nama lengkap ibu maksimal 100 karakter"),
  nik: z
    .string()
    .trim()
    .regex(NIK_REGEX, "NIK ibu harus terdiri dari 16 digit angka"),
  birth_place: z
    .string()
    .trim()
    .min(2, "Tempat lahir ibu minimal 2 karakter")
    .max(100, "Tempat lahir ibu maksimal 100 karakter"),
  birth_date: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Format tanggal lahir ibu harus YYYY-MM-DD"),
  whatsapp_number: z
    .string()
    .trim()
    .regex(
      WHATSAPP_REGEX,
      "Format nomor WhatsApp ibu tidak valid (contoh: 08123456789)"
    ),
  address: z
    .string()
    .trim()
    .min(5, "Alamat ibu minimal 5 karakter")
    .max(500, "Alamat ibu maksimal 500 karakter"),
});
export type MotherFormData = z.infer<typeof motherSchema>;

export type ParentFormData = z.infer<typeof parentBaseSchema>;

// Section 4 — Data Kesehatan Santri
export const healthSchema = z.object({
  weight_kg: z.coerce
    .number()
    .positive("Berat badan harus lebih dari 0 kg")
    .max(150, "Berat badan tidak valid"),
  height_cm: z.coerce
    .number()
    .positive("Tinggi badan harus lebih dari 0 cm")
    .max(250, "Tinggi badan tidak valid"),
  blood_type: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    bloodTypeSchema.optional()
  ),
  allergy_history: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().max(500, "Riwayat alergi maksimal 500 karakter").optional()
  ),
  disease_history: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().max(500, "Riwayat penyakit maksimal 500 karakter").optional()
  ),
});
export type HealthFormData = z.infer<typeof healthSchema>;

// Full Registration Form Schema (All 4 Sections combined)
export const registrationFormSchema = z.object({
  child: childSchema,
  father: fatherSchema,
  mother: motherSchema,
  health: healthSchema,
});
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
