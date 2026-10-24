import { describe, it, expect } from "vitest";
import {
  registrationFormSchema,
  childSchema,
  fatherSchema,
  motherSchema,
  healthSchema,
  documentTypeSchema,
  type RegistrationFormData,
} from "../features/registration/schemas/formSchema.ts";

describe("Registration Form Schemas", () => {
  const validSample: RegistrationFormData = {
    child: {
      full_name: "Ahmad Zaki",
      nickname: "Zaki",
      nik: "1234567890123456",
      birth_place: "Duri",
      birth_date: "2021-05-15",
      gender: "laki_laki",
      child_order: 1,
      sibling_count: 2,
      address: "Jl. Mawar No. 12, Duri, Mandau",
      program: "2_tahun",
    },
    father: {
      full_name: "Budi Santoso",
      nik: "1234567890123457",
      birth_place: "Pekanbaru",
      birth_date: "1990-08-20",
      last_education: "S1",
      occupation: "Karyawan Swasta",
      monthly_income: "Rp 5.000.000 - Rp 10.000.000",
      whatsapp_number: "081234567890",
      address: "Jl. Mawar No. 12, Duri, Mandau",
    },
    mother: {
      full_name: "Siti Rahma",
      nik: "1234567890123458",
      birth_place: "Bukittinggi",
      birth_date: "1992-03-10",
      last_education: "D3",
      occupation: "Ibu Rumah Tangga",
      monthly_income: undefined,
      whatsapp_number: "085212345678",
      address: "Jl. Mawar No. 12, Duri, Mandau",
    },
    health: {
      weight_kg: 18,
      height_cm: 105,
      blood_type: "O",
      allergy_history: "Alergi udang",
      disease_history: "Asma ringan saat balita",
    },
  };

  describe("childSchema", () => {
    it("accepts valid child data", () => {
      const res = childSchema.safeParse(validSample.child);
      expect(res.success).toBe(true);
    });

    it("rejects invalid NIK with specific error message", () => {
      const resShort = childSchema.safeParse({ ...validSample.child, nik: "12345" });
      expect(resShort.success).toBe(false);
      if (!resShort.success) {
        expect(resShort.error.issues[0].message).toBe("NIK santri harus terdiri dari 16 digit angka");
      }

      const resLetters = childSchema.safeParse({ ...validSample.child, nik: "123456789012345A" });
      expect(resLetters.success).toBe(false);
    });

    it("rejects invalid birth date format", () => {
      const res = childSchema.safeParse({ ...validSample.child, birth_date: "15/05/2021" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe("Format tanggal lahir santri harus YYYY-MM-DD");
      }
    });

    it("rejects non-positive child_order", () => {
      const res = childSchema.safeParse({ ...validSample.child, child_order: 0 });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe("Urutan anak (anak ke-) minimal 1");
      }
    });

    it("rejects invalid program", () => {
      const res = childSchema.safeParse({ ...validSample.child, program: "3_tahun" });
      expect(res.success).toBe(false);
    });
  });

  describe("fatherSchema and motherSchema", () => {
    it("accepts valid father and mother data", () => {
      expect(fatherSchema.safeParse(validSample.father).success).toBe(true);
      expect(motherSchema.safeParse(validSample.mother).success).toBe(true);
    });

    it("rejects invalid parent NIK", () => {
      const resFather = fatherSchema.safeParse({ ...validSample.father, nik: "1234" });
      expect(resFather.success).toBe(false);
      if (!resFather.success) {
        expect(resFather.error.issues[0].message).toBe("NIK ayah harus terdiri dari 16 digit angka");
      }

      const resMother = motherSchema.safeParse({ ...validSample.mother, nik: "1234" });
      expect(resMother.success).toBe(false);
      if (!resMother.success) {
        expect(resMother.error.issues[0].message).toBe("NIK ibu harus terdiri dari 16 digit angka");
      }
    });

    it("rejects invalid WhatsApp numbers", () => {
      const resFather = fatherSchema.safeParse({ ...validSample.father, whatsapp_number: "021123456" });
      expect(resFather.success).toBe(false);

      const resMother = motherSchema.safeParse({ ...validSample.mother, whatsapp_number: "invalid" });
      expect(resMother.success).toBe(false);
    });
  });

  describe("healthSchema", () => {
    it("accepts valid health data", () => {
      const res = healthSchema.safeParse(validSample.health);
      expect(res.success).toBe(true);
    });

    it("accepts health data with optional empty fields", () => {
      const res = healthSchema.safeParse({
        weight_kg: 20,
        height_cm: 110,
        blood_type: "",
        allergy_history: "",
        disease_history: null,
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.blood_type).toBeUndefined();
        expect(res.data.allergy_history).toBeUndefined();
        expect(res.data.disease_history).toBeUndefined();
      }
    });

    it("rejects non-positive weight or height", () => {
      const resZeroWeight = healthSchema.safeParse({ ...validSample.health, weight_kg: 0 });
      expect(resZeroWeight.success).toBe(false);

      const resNegHeight = healthSchema.safeParse({ ...validSample.health, height_cm: -10 });
      expect(resNegHeight.success).toBe(false);
    });
  });

  describe("documentTypeSchema", () => {
    it("accepts valid document types", () => {
      expect(documentTypeSchema.safeParse("kartu_keluarga").success).toBe(true);
      expect(documentTypeSchema.safeParse("akte_kelahiran").success).toBe(true);
    });

    it("rejects invalid document types", () => {
      expect(documentTypeSchema.safeParse("ijazah").success).toBe(false);
      expect(documentTypeSchema.safeParse("").success).toBe(false);
    });
  });

  describe("registrationFormSchema", () => {
    it("validates full complete form payload", () => {
      const res = registrationFormSchema.safeParse(validSample);
      expect(res.success).toBe(true);
    });

    it("fails when any section is missing or invalid", () => {
      const invalid = { ...validSample, child: { ...validSample.child, nik: "short" } };
      const res = registrationFormSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });
});
