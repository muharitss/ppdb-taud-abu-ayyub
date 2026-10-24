import { describe, it, expect } from "vitest";
import { buildWaMessage, buildWaLink } from "../features/registration/utils/whatsapp.ts";
import { ADMIN_CONTACTS } from "../config/schoolInfo.ts";

describe("WhatsApp Utilities", () => {
  const sampleParams = {
    childName: "Ahmad Fatih",
    registrationNumber: "PPDB-2027-00001",
    accessCode: "KODE1234",
    statusUrl: "https://ppdb.taud-abu-ayyub.sch.id/status",
  };

  describe("buildWaMessage", () => {
    it("generates correct message text with all parameters", () => {
      const msg = buildWaMessage(sampleParams);

      expect(msg).toContain("TP.2027/2028");
      expect(msg).toContain("Nama Santri: Ahmad Fatih");
      expect(msg).toContain("Nomor Pendaftaran: PPDB-2027-00001");
      expect(msg).toContain("Kode Akses: KODE1234");
      expect(msg).toContain("https://ppdb.taud-abu-ayyub.sch.id/status");
      expect(msg).toContain("Assalamu'alaikum Admin PPDB TAUD SaQu Abu Ayyub");
    });

    it("handles optional childName and accessCode gracefully", () => {
      const msg = buildWaMessage({
        registrationNumber: "PPDB-2027-00002",
        statusUrl: "https://example.com/status",
      });

      expect(msg).toContain("Nomor Pendaftaran: PPDB-2027-00002");
      expect(msg).not.toContain("Nama Santri:");
      expect(msg).not.toContain("Kode Akses:");
      expect(msg).toContain("https://example.com/status");
    });

    it("uses fallback status URL when not provided", () => {
      const msg = buildWaMessage({
        registrationNumber: "PPDB-2027-00003",
      });

      expect(msg).toContain("Cek Status Pendaftaran:");
      expect(msg).toMatch(/https?:\/\//);
    });
  });

  describe("buildWaLink", () => {
    it("produces valid wa.me URL with clean phone number and encoded text", () => {
      const link = buildWaLink(sampleParams);
      const cleanExpectedPhone = ADMIN_CONTACTS.primary.whatsappNumber.replace(/\D/g, "");

      expect(link.startsWith(`https://wa.me/${cleanExpectedPhone}?text=`)).toBe(true);
      expect(link).not.toContain("+");
      expect(link).toContain(encodeURIComponent("PPDB-2027-00001"));
      expect(link).toContain(encodeURIComponent("Ahmad Fatih"));
      expect(link).toContain(encodeURIComponent("KODE1234"));
    });

    it("allows custom target WhatsApp number and cleans non-digit characters", () => {
      const customPhone = "+62 812-9999-8888";
      const link = buildWaLink(sampleParams, customPhone);

      expect(link.startsWith("https://wa.me/6281299998888?text=")).toBe(true);
    });
  });
});
