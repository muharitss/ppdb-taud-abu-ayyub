import { describe, it, expect } from "vitest";
import { initialRegistrationSchema } from "../features/registration/schemas/initial-registration.schema.ts";

describe("initialRegistrationSchema", () => {
  const validPayload = {
    child_name: "Muhammad Abdullah",
    parent_name: "Ahmad Dahlan",
    whatsapp_number: "081234567890",
  };

  it("accepts valid input", () => {
    const result = initialRegistrationSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.child_name).toBe("Muhammad Abdullah");
      expect(result.data.parent_name).toBe("Ahmad Dahlan");
      expect(result.data.whatsapp_number).toBe("081234567890");
    }
  });

  it("accepts valid Indonesian WhatsApp number formats", () => {
    const validNumbers = [
      "081234567890",
      "+6281234567890",
      "6281234567890",
      "085211223344",
      "08987654321",
    ];

    for (const num of validNumbers) {
      const result = initialRegistrationSchema.safeParse({
        ...validPayload,
        whatsapp_number: num,
      });
      expect(result.success).toBe(true);
    }
  });

  it("trims whitespace from inputs", () => {
    const result = initialRegistrationSchema.safeParse({
      child_name: "  Ahmad Zaki  ",
      parent_name: "  Budi Santoso  ",
      whatsapp_number: "  081234567890  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.child_name).toBe("Ahmad Zaki");
      expect(result.data.parent_name).toBe("Budi Santoso");
      expect(result.data.whatsapp_number).toBe("081234567890");
    }
  });

  it("fails if child_name is too short or empty", () => {
    const resEmpty = initialRegistrationSchema.safeParse({
      ...validPayload,
      child_name: "",
    });
    expect(resEmpty.success).toBe(false);
    if (!resEmpty.success) {
      expect(resEmpty.error.issues[0].message).toBe("Nama anak minimal 2 karakter");
    }

    const resSingle = initialRegistrationSchema.safeParse({
      ...validPayload,
      child_name: "A",
    });
    expect(resSingle.success).toBe(false);
  });

  it("fails if child_name exceeds 100 characters", () => {
    const resLong = initialRegistrationSchema.safeParse({
      ...validPayload,
      child_name: "A".repeat(101),
    });
    expect(resLong.success).toBe(false);
    if (!resLong.success) {
      expect(resLong.error.issues[0].message).toBe("Nama anak maksimal 100 karakter");
    }
  });

  it("fails if parent_name is invalid", () => {
    const resEmpty = initialRegistrationSchema.safeParse({
      ...validPayload,
      parent_name: " ",
    });
    expect(resEmpty.success).toBe(false);
    if (!resEmpty.success) {
      expect(resEmpty.error.issues[0].message).toBe("Nama orang tua minimal 2 karakter");
    }

    const resLong = initialRegistrationSchema.safeParse({
      ...validPayload,
      parent_name: "B".repeat(101),
    });
    expect(resLong.success).toBe(false);
    if (!resLong.success) {
      expect(resLong.error.issues[0].message).toBe("Nama orang tua maksimal 100 karakter");
    }
  });

  it("fails if whatsapp_number is invalid format", () => {
    const invalidNumbers = [
      "",
      "12345",
      "07123456789", // does not start with 08 or 628
      "08012345678", // 080 is invalid (starts with 08[1-9])
      "08123", // too short
      "0812345678901234", // too long
      "abcdefghijk",
      "+1234567890",
    ];

    for (const num of invalidNumbers) {
      const res = initialRegistrationSchema.safeParse({
        ...validPayload,
        whatsapp_number: num,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe(
          "Format nomor WhatsApp tidak valid (contoh: 08123456789 atau 628123456789)"
        );
      }
    }
  });
});
