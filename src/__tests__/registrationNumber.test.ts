import { describe, it, expect } from "vitest";

export const REGISTRATION_NUMBER_REGEX = /^PPDB-\d{4}-\d{4,5}$/;
export const STRICT_REGISTRATION_NUMBER_REGEX = /^PPDB-\d{4}-\d{5}$/;

export function isValidRegistrationNumber(num: string, strict = false): boolean {
  return strict
    ? STRICT_REGISTRATION_NUMBER_REGEX.test(num)
    : REGISTRATION_NUMBER_REGEX.test(num);
}

describe("registration_number format validation", () => {
  it("validates standard PPDB-YYYY-XXXXX 5-digit format", () => {
    const validCases = [
      "PPDB-2026-00001",
      "PPDB-2027-00001",
      "PPDB-2027-00123",
      "PPDB-2027-99999",
      "PPDB-2028-12345",
    ];

    for (const val of validCases) {
      expect(isValidRegistrationNumber(val, true)).toBe(true);
      expect(isValidRegistrationNumber(val, false)).toBe(true);
    }
  });

  it("accepts legacy or 4-digit sequence in flexible mode", () => {
    const fourDigitCases = [
      "PPDB-2026-0001",
      "PPDB-2027-0042",
    ];

    for (const val of fourDigitCases) {
      expect(isValidRegistrationNumber(val, false)).toBe(true);
      expect(isValidRegistrationNumber(val, true)).toBe(false);
    }
  });

  it("rejects invalid prefixes, cases, and characters", () => {
    const invalidCases = [
      "",
      "ppdb-2027-00001", // lowercase prefix
      "REG-2027-00001",  // wrong prefix
      "PPDB202700001",   // missing hyphens
      "PPDB-27-00001",   // 2-digit year
      "PPDB-20271-00001",// 5-digit year
      "PPDB-2027-abcde", // non-numeric sequence
      "PPDB-2027-1",     // sequence too short
      "PPDB-2027-000001",// sequence too long (6 digits)
      "PPDB-YEAR-00001", // non-numeric year
      " PPDB-2027-00001",// untrimmed leading space
      "PPDB-2027-00001 ",// untrimmed trailing space
    ];

    for (const inv of invalidCases) {
      expect(isValidRegistrationNumber(inv, false)).toBe(false);
      expect(isValidRegistrationNumber(inv, true)).toBe(false);
    }
  });
});
