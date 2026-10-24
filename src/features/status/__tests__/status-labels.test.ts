function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};

import {
  getRegistrationStatusMeta,
  getPaymentStatusMeta,
} from "../../../lib/constants/statusLabels.ts";

console.log("Running status label tests...");

// 1. Indonesian labels for all registration statuses
assert.equal(getRegistrationStatusMeta("draft").label, "Draf Pendaftaran", "draft label");
assert.equal(getRegistrationStatusMeta("awaiting_payment").label, "Menunggu Pembayaran", "awaiting_payment label");
assert.equal(getRegistrationStatusMeta("awaiting_form").label, "Pengisian Formulir", "awaiting_form label");
assert.equal(getRegistrationStatusMeta("submitted").label, "Formulir Terkirim", "submitted label");
assert.equal(getRegistrationStatusMeta("under_review").label, "Sedang Diverifikasi", "under_review label");
assert.equal(getRegistrationStatusMeta("accepted").label, "Diterima (Lulus Seleksi)", "accepted label");
assert.equal(getRegistrationStatusMeta("rejected").label, "Belum Diterima", "rejected label");
console.log("✓ All registration status labels mapped to Indonesian");

// 2. Indonesian labels for payment statuses
assert.equal(getPaymentStatusMeta("payment_pending").label, "Belum Dibayar", "payment_pending label");
assert.equal(getPaymentStatusMeta("payment_submitted").label, "Bukti Transfer Diunggah", "payment_submitted label");
assert.equal(getPaymentStatusMeta("payment_verified").label, "Pembayaran Terverifikasi", "payment_verified label");
assert.equal(getPaymentStatusMeta("payment_rejected").label, "Pembayaran Ditolak", "payment_rejected label");
console.log("✓ All payment status labels mapped to Indonesian");

// 3. Fallback for unknown status
assert.equal(getRegistrationStatusMeta(undefined).label, "Tidak Diketahui", "undefined registration status fallback");
assert.equal(getPaymentStatusMeta(undefined).label, "Tidak Diketahui", "undefined payment status fallback");
console.log("✓ Fallback for undefined statuses verified");

console.log("All status label tests passed successfully!");
