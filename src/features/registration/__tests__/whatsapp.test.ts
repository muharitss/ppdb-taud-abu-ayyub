function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.ok = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};
import { buildWaMessage, buildWaLink } from "../utils/whatsapp.ts";

console.log("Running whatsapp utility tests...");

// 1. buildWaMessage generates correct text mentioning TP.2027/2028 and variables
const msg = buildWaMessage({
  childName: "Ahmad Fatih",
  registrationNumber: "PPDB-2027-0001",
  accessCode: "ABC12345",
  statusUrl: "https://example.com/status",
});

assert.ok(msg.includes("TP.2027/2028"), "Message should mention TP.2027/2028");
assert.ok(msg.includes("Ahmad Fatih"), "Message should include child name");
assert.ok(msg.includes("PPDB-2027-0001"), "Message should include registration number");
assert.ok(msg.includes("ABC12345"), "Message should include access code");
assert.ok(msg.includes("https://example.com/status"), "Message should include status URL");
console.log("✓ buildWaMessage output verified");

// 2. buildWaLink produces valid wa.me link without '+' and encoded message
const link = buildWaLink({
  childName: "Ahmad Fatih",
  registrationNumber: "PPDB-2027-0001",
  accessCode: "ABC12345",
  statusUrl: "https://example.com/status",
});

assert.ok(link.startsWith("https://wa.me/6282169599979?text="), "Link must start with https://wa.me/<number>?text=");
assert.ok(!link.includes("+"), "Link number should not contain '+'");
assert.ok(link.includes(encodeURIComponent("PPDB-2027-0001")), "Link should contain encoded registration number");
console.log("✓ buildWaLink URL construction verified");

console.log("All whatsapp utility tests passed successfully!");
