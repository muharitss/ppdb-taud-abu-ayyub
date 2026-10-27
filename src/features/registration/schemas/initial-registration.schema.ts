import { z } from "zod";

export const initialRegistrationSchema = z.object({
  child_name: z
    .string()
    .trim()
    .min(2, "Nama siswa minimal 2 karakter")
    .max(100, "Nama siswa maksimal 100 karakter"),
  whatsapp_number: z
    .string()
    .trim()
    .regex(
      /^(\+?62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor handphone/WhatsApp tidak valid (contoh: 08123456789)"
    ),
});

export type InitialRegistrationInput = z.infer<typeof initialRegistrationSchema>;
