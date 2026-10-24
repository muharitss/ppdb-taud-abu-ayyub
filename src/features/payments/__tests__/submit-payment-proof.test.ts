import bcrypt from "bcryptjs";
import {
  handleSubmitPaymentProof,
  detectMimeType,
  OPAQUE_ERROR_MESSAGE,
  type SubmitPaymentProofResponse,
} from "../../../../supabase/functions/submit-payment-proof/index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};

console.log("Running submit-payment-proof tests...");

// 1. Magic bytes detection unit tests
{
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
  const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
  const fakeBytes = new Uint8Array([0x00, 0x11, 0x22, 0x33]);
  const shortBytes = new Uint8Array([0xff, 0xd8]);

  const jpegResult = detectMimeType(jpegBytes);
  assert.equal(jpegResult?.mime, "image/jpeg", "JPEG detected");
  assert.equal(jpegResult?.ext, "jpg", "JPEG extension");

  const pngResult = detectMimeType(pngBytes);
  assert.equal(pngResult?.mime, "image/png", "PNG detected");
  assert.equal(pngResult?.ext, "png", "PNG extension");

  const pdfResult = detectMimeType(pdfBytes);
  assert.equal(pdfResult?.mime, "application/pdf", "PDF detected");
  assert.equal(pdfResult?.ext, "pdf", "PDF extension");

  assert.equal(detectMimeType(fakeBytes), null, "Invalid bytes rejected");
  assert.equal(detectMimeType(shortBytes), null, "Short bytes rejected");
  console.log("✓ Magic byte MIME detection passed");
}

// 2. Integration handler tests with mock Supabase client
const TEST_REG_NUMBER = "PPDB-2027-00999";
const TEST_CODE = "ABCD2345";
const TEST_HASH = bcrypt.hashSync(TEST_CODE, 10);
const REG_ID = "22222222-3333-4444-5555-666666666666";

function createMockSupabase(overrides?: {
  registration?: {
    id: string;
    registration_number: string;
    status: string;
    payment_status: string;
  } | null;
  accessRecord?: { access_code_hash: string } | null;
  uploadError?: { message: string } | null;
}) {
  const auditLogs: unknown[] = [];
  const insertedPayments: unknown[] = [];
  const updatedRegistrations: unknown[] = [];
  const uploadedFiles: unknown[] = [];

  const registration =
    overrides?.registration !== undefined
      ? overrides.registration
      : {
          id: REG_ID,
          registration_number: TEST_REG_NUMBER,
          status: "awaiting_payment",
          payment_status: "payment_pending",
        };

  const accessRecord =
    overrides?.accessRecord !== undefined
      ? overrides.accessRecord
      : { access_code_hash: TEST_HASH };

  const mockClient = {
    from: (table: string) => {
      if (table === "registrations") {
        return {
          select: () => ({
            eq: (_field: string, val: string) => ({
              maybeSingle: async () => {
                if (registration && val === registration.registration_number) {
                  return { data: registration, error: null };
                }
                return { data: null, error: null };
              },
            }),
          }),
          update: (values: unknown) => ({
            eq: (_field: string, val: string) => {
              updatedRegistrations.push({ val, values });
              return Promise.resolve({ data: values, error: null });
            },
          }),
        };
      }

      if (table === "registration_access") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: accessRecord,
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "payments") {
        return {
          insert: async (row: unknown) => {
            insertedPayments.push(row);
            return { data: row, error: null };
          },
        };
      }

      if (table === "audit_events") {
        return {
          insert: async (row: unknown) => {
            auditLogs.push(row);
            return { data: row, error: null };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    storage: {
      from: (bucket: string) => {
        assert.equal(bucket, "payment-proofs", "Upload target bucket must be payment-proofs");
        return {
          upload: async (path: string, bytes: Uint8Array, opts: unknown) => {
            if (overrides?.uploadError) {
              return { data: null, error: overrides.uploadError };
            }
            uploadedFiles.push({ path, bytes, opts });
            return { data: { path }, error: null };
          },
        };
      },
    },
    _inspections: {
      auditLogs,
      insertedPayments,
      updatedRegistrations,
      uploadedFiles,
    },
  };

  return mockClient;
}

function createFormDataRequest(
  fields: {
    registration_number?: string;
    access_code?: string;
    file?: File | Blob;
  },
  options?: { method?: string; notMultipart?: boolean }
): Request {
  if (options?.notMultipart) {
    return new Request("http://localhost/submit-payment-proof", {
      method: options?.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  }

  const fd = new FormData();
  if (fields.registration_number !== undefined) {
    fd.append("registration_number", fields.registration_number);
  }
  if (fields.access_code !== undefined) {
    fd.append("access_code", fields.access_code);
  }
  if (fields.file !== undefined) {
    fd.append("file", fields.file);
  }

  return new Request("http://localhost/submit-payment-proof", {
    method: options?.method || "POST",
    body: fd,
  });
}

async function runAsyncTests() {
  // CORS & method
  {
    const reqOptions = new Request("http://localhost/submit-payment-proof", { method: "OPTIONS" });
    const res = await handleSubmitPaymentProof(reqOptions);
    assert.equal(res.status, 200, "OPTIONS status 200");
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*", "CORS header");

    const reqGet = new Request("http://localhost/submit-payment-proof", { method: "GET" });
    const resGet = await handleSubmitPaymentProof(reqGet);
    assert.equal(resGet.status, 405, "GET method not allowed");
    console.log("✓ CORS and method checks passed");
  }

  // Content type validation
  {
    const req = createFormDataRequest({}, { notMultipart: true });
    const res = await handleSubmitPaymentProof(req);
    assert.equal(res.status, 400, "Non-multipart rejected");
    console.log("✓ Content-Type check passed");
  }

  // Missing credentials
  {
    const req = createFormDataRequest({
      registration_number: "",
      access_code: "",
    });
    const res = await handleSubmitPaymentProof(req);
    assert.equal(res.status, 400, "Empty credentials rejected");
    console.log("✓ Empty credentials rejection passed");
  }

  // Missing or empty file
  {
    const req = createFormDataRequest({
      registration_number: TEST_REG_NUMBER,
      access_code: TEST_CODE,
    });
    const res = await handleSubmitPaymentProof(req);
    assert.equal(res.status, 400, "Missing file rejected");
    console.log("✓ Missing file rejection passed");
  }

  // Invalid file type (magic bytes check)
  {
    const fakeFile = new File([new Uint8Array([1, 2, 3, 4, 5])], "proof.txt", {
      type: "text/plain",
    });
    const req = createFormDataRequest({
      registration_number: TEST_REG_NUMBER,
      access_code: TEST_CODE,
      file: fakeFile,
    });
    const res = await handleSubmitPaymentProof(req);
    assert.equal(res.status, 400, "Invalid file format rejected");
    const data = await res.json();
    assert(data.error.includes("Format berkas tidak valid"), "Clear error for bad format");
    console.log("✓ Bad file magic bytes rejection passed");
  }

  // Non-existent registration opaque error
  {
    const mock = createMockSupabase({ registration: null });
    const validJpg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "proof.jpg", {
      type: "image/jpeg",
    });
    const req = createFormDataRequest({
      registration_number: "PPDB-2027-99999",
      access_code: TEST_CODE,
      file: validJpg,
    });
    // @ts-expect-error injected mock
    const res = await handleSubmitPaymentProof(req, mock);
    assert.equal(res.status, 401, "Non-existent returns 401");
    const data = await res.json();
    assert.equal(data.error, OPAQUE_ERROR_MESSAGE, "Opaque error message");
    console.log("✓ Non-existent registration opaque check passed");
  }

  // Wrong access code opaque error
  {
    const mock = createMockSupabase();
    const validJpg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "proof.jpg", {
      type: "image/jpeg",
    });
    const req = createFormDataRequest({
      registration_number: TEST_REG_NUMBER,
      access_code: "WRONGCOD",
      file: validJpg,
    });
    // @ts-expect-error injected mock
    const res = await handleSubmitPaymentProof(req, mock);
    assert.equal(res.status, 401, "Invalid code returns 401");
    const data = await res.json();
    assert.equal(data.error, OPAQUE_ERROR_MESSAGE, "Opaque error message");
    console.log("✓ Wrong code opaque check passed");
  }

  // Status conflicts: already verified or already submitted
  {
    const mockVerified = createMockSupabase({
      registration: {
        id: REG_ID,
        registration_number: TEST_REG_NUMBER,
        status: "awaiting_form",
        payment_status: "payment_verified",
      },
    });
    const validJpg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "proof.jpg", {
      type: "image/jpeg",
    });
    const req = createFormDataRequest({
      registration_number: TEST_REG_NUMBER,
      access_code: TEST_CODE,
      file: validJpg,
    });
    // @ts-expect-error injected mock
    const res = await handleSubmitPaymentProof(req, mockVerified);
    assert.equal(res.status, 409, "Already verified returns 409 conflict");

    const mockSubmitted = createMockSupabase({
      registration: {
        id: REG_ID,
        registration_number: TEST_REG_NUMBER,
        status: "awaiting_payment",
        payment_status: "payment_submitted",
      },
    });
    const req2 = createFormDataRequest({
      registration_number: TEST_REG_NUMBER,
      access_code: TEST_CODE,
      file: validJpg,
    });
    // @ts-expect-error injected mock
    const res2 = await handleSubmitPaymentProof(req2, mockSubmitted);
    assert.equal(res2.status, 409, "Already submitted returns 409 conflict");
    console.log("✓ Status conflict checks (409) passed");
  }

  // Successful submission (Happy Path)
  {
    const mock = createMockSupabase();
    const validPng = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      "receipt.png",
      { type: "image/png" }
    );
    const req = createFormDataRequest({
      registration_number: TEST_REG_NUMBER,
      access_code: TEST_CODE,
      file: validPng,
    });
    // @ts-expect-error injected mock
    const res = await handleSubmitPaymentProof(req, mock);
    assert.equal(res.status, 200, "Happy path returns 200");
    const body: SubmitPaymentProofResponse = await res.json();
    assert.equal(body.success, true, "Success is true");
    assert.equal(body.status, "payment_submitted", "Status is payment_submitted");
    assert.equal(body.registration_status, "awaiting_form", "Registration status advances immediately to awaiting_form");

    // Verify storage upload occurred
    assert.equal(mock._inspections.uploadedFiles.length, 1, "Uploaded 1 file");
    // Verify payments table insert occurred
    assert.equal(mock._inspections.insertedPayments.length, 1, "Recorded 1 payment");
    // Verify registration table updated with awaiting_form
    assert.equal(mock._inspections.updatedRegistrations.length, 1, "Updated registration");
    const updatedReg = mock._inspections.updatedRegistrations[0] as { values: { status: string; payment_status: string } };
    assert.equal(updatedReg.values.status, "awaiting_form", "DB registration status updated to awaiting_form");
    assert.equal(updatedReg.values.payment_status, "payment_submitted", "DB payment_status updated to payment_submitted");
    // Verify audit event logged
    assert.equal(mock._inspections.auditLogs.length, 1, "Logged 1 audit event");

    console.log("✓ Successful upload happy path verified");
  }

  console.log("All submit-payment-proof tests completed successfully!");
}

runAsyncTests().catch((err) => {
  console.error("Test failure:", err);
  throw err;
});
