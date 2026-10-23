import bcrypt from "bcryptjs";
import { generateAccessCode, validateWhatsAppNumber } from "../../../../supabase/functions/create-registration/index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};
assert.ok = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};
assert.notEqual = (a: unknown, b: unknown, message: string) => {
  if (a === b) throw new Error(`${message}: ${a} === ${b}`);
};

console.log("Running create-registration tests...");

// 1. WhatsApp Validation Tests
{
  const validCases = [
    { input: "081234567890", expected: "6281234567890" },
    { input: "+6281234567890", expected: "6281234567890" },
    { input: "6281234567890", expected: "6281234567890" },
    { input: "0812-3456-7890", expected: "6281234567890" },
    { input: "0812 3456 7890", expected: "6281234567890" },
    { input: "085211223344", expected: "6285211223344" },
  ];

  for (const c of validCases) {
    const res = validateWhatsAppNumber(c.input);
    assert.equal(res.valid, true, `Should accept valid WhatsApp: ${c.input}`);
    assert.equal(res.normalized, c.expected, `Should normalize ${c.input} to ${c.expected}`);
  }

  const invalidCases = [
    "",
    "   ",
    "07123456789", // not starting with 08 or 628
    "08012345678", // 080 not valid (starts with 08[1-9])
    "08123",       // too short
    "08123456789012345", // too long
    "abcdefg",
    "+1234567890",
  ];

  for (const inv of invalidCases) {
    const res = validateWhatsAppNumber(inv);
    assert.equal(res.valid, false, `Should reject invalid WhatsApp: ${inv}`);
  }
  console.log("✓ WhatsApp validation tests passed");
}

// 2. Access Code Generation Tests
{
  const ALLOWED_CHARS = new Set("ABCDEFGHJKLMNPQRSTUVWXYZ23456789".split(""));
  const FORBIDDEN_AMBIGUOUS = new Set(["0", "O", "1", "I"]);

  const codes = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const code = generateAccessCode();
    assert.equal(code.length, 8, `Access code must be 8 characters: ${code}`);

    for (const char of code) {
      assert.ok(ALLOWED_CHARS.has(char), `Char '${char}' must be in allowed charset`);
      assert.ok(!FORBIDDEN_AMBIGUOUS.has(char), `Char '${char}' must not be ambiguous`);
    }

    codes.add(code);
  }

  // 100 random 8-char codes should have near-zero chance of collision
  assert.equal(codes.size, 100, "100 generated access codes should all be distinct");
  console.log("✓ Access code generation tests passed (8-char CSPRNG, no ambiguous chars)");
}

// 3. Bcrypt Hash Verification
{
  const testCode = generateAccessCode();
  const hash = bcrypt.hashSync(testCode, 10);

  assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Hash must be a valid bcrypt hash string");
  assert.notEqual(hash, testCode, "Hash must never equal plaintext access code");

  const isMatch = bcrypt.compareSync(testCode, hash);
  assert.equal(isMatch, true, "Bcrypt compare must succeed for correct access code");

  const isWrongMatch = bcrypt.compareSync("WRONGCOD", hash);
  assert.equal(isWrongMatch, false, "Bcrypt compare must fail for incorrect access code");

  console.log("✓ Bcrypt hashing and comparison verification passed");
}

console.log("All create-registration logic tests passed successfully!");
