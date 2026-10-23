import { z } from "zod";

export const initialRegistrationSchema = z.object({
  child_name: z
    .string()
    .trim()
    .min(2, "Nama anak minimal 2 karakter")
    .max(100, "Nama anak maksimal 100 karakter"),
  parent_name: z
    .string()
    .trim()
    .min(2, "Nama orang tua minimal 2 karakter")
    .max(100, "Nama orang tua maksimal 100 karakter"),
  whatsapp_number: z
    .string()
    .trim()
    .regex(
      /^(\+?62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor WhatsApp tidak valid (contoh: 08123456789 atau 628123456789)"
    ),
});

export type InitialRegistrationInput = z.infer<typeof initialRegistrationSchema>;
