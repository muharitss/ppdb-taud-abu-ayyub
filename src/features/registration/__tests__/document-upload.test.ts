import bcrypt from "bcryptjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  handleDocumentUpload,
  detectMimeType,
  OPAQUE_ERROR_MESSAGE,
  ALLOWED_DOC_TYPES,
  type DocumentUploadResponse,
} from "../../../../supabase/functions/document-upload/index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};
assert.ok = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

console.log("Running document-upload tests...");

// 1. Magic bytes detection unit tests
{
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
  const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
  const fakeBytes = new Uint8Array([0x00, 0x11, 0x22, 0x33]);

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
  console.log("✓ Magic byte detection passed");
}

// 2. Integration tests with mock Supabase client
const TEST_REG_NUMBER = "PPDB-2027-00123";
const TEST_CODE = "ABCD2345";
const TEST_HASH = bcrypt.hashSync(TEST_CODE, 10);
const REG_ID = "11111111-2222-3333-4444-555555555555";

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
  const upsertedDocs: unknown[] = [];
  const uploadedStorage: Array<{ path: string; file: unknown }> = [];
  const removedStorage: string[][] = [];

  const registrationData =
    overrides?.registration !== undefined
      ? overrides.registration
      : {
          id: REG_ID,
          registration_number: TEST_REG_NUMBER,
          status: "awaiting_form",
          payment_status: "payment_verified",
        };

  const accessData =
    overrides?.accessRecord !== undefined
      ? overrides.accessRecord
      : { access_code_hash: TEST_HASH };

  const mockClient = {
    from: (table: string) => {
      if (table === "registrations") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: registrationData,
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "registration_access") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: accessData,
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "registration_documents") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
          upsert: async (record: unknown) => {
            upsertedDocs.push(record);
            return { data: record, error: null };
          },
        };
      }

      if (table === "audit_events") {
        return {
          insert: async (entry: unknown) => {
            auditLogs.push(entry);
            return { error: null };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },

    storage: {
      from: (bucket: string) => {
        assert.equal(bucket, "registration-documents", "Bucket must be registration-documents");
        return {
          upload: async (path: string, file: unknown) => {
            if (overrides?.uploadError) {
              return { error: overrides.uploadError };
            }
            uploadedStorage.push({ path, file });
            return { error: null };
          },
          remove: async (paths: string[]) => {
            removedStorage.push(paths);
            return { data: paths, error: null };
          },
        };
      },
    },

    _inspect: {
      auditLogs,
      upsertedDocs,
      uploadedStorage,
      removedStorage,
    },
  };

  return mockClient as unknown as SupabaseClient & {
    _inspect: typeof mockClient._inspect;
  };
}

// 3. Tests execution
async function runTests() {
  // CORS & method
  const optionsRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", { method: "OPTIONS" })
  );
  assert.equal(optionsRes.status, 200, "OPTIONS returns 200");

  const getRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", { method: "GET" })
  );
  assert.equal(getRes.status, 405, "GET returns 405 Method Not Allowed");

  // Content-Type check
  const jsonRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
  );
  assert.equal(jsonRes.status, 400, "Non-multipart rejected");

  // Missing fields
  const emptyForm = new FormData();
  const emptyRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      body: emptyForm,
    })
  );
  assert.equal(emptyRes.status, 400, "Empty form rejected");

  // Invalid document_type
  const validJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x11, 0x22]);
  const formBadDoc = new FormData();
  formBadDoc.append("registration_number", TEST_REG_NUMBER);
  formBadDoc.append("access_code", TEST_CODE);
  formBadDoc.append("document_type", "ijazah_s1");
  formBadDoc.append("file", new Blob([validJpeg], { type: "image/jpeg" }));
  const badDocRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      body: formBadDoc,
    })
  );
  assert.equal(badDocRes.status, 400, "Invalid document_type rejected");

  // Invalid file format (magic bytes)
  const fakeFile = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
  const formFakeFile = new FormData();
  formFakeFile.append("registration_number", TEST_REG_NUMBER);
  formFakeFile.append("access_code", TEST_CODE);
  formFakeFile.append("document_type", "kartu_keluarga");
  formFakeFile.append("file", new Blob([fakeFile], { type: "image/jpeg" }));
  const fakeFileRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      body: formFakeFile,
    })
  );
  assert.equal(fakeFileRes.status, 400, "Corrupt/fake bytes rejected");

  // Unknown registration (401 opaque)
  const notFoundClient = createMockSupabase({ registration: null });
  const formValid = new FormData();
  formValid.append("registration_number", "PPDB-2027-99999");
  formValid.append("access_code", TEST_CODE);
  formValid.append("document_type", "kartu_keluarga");
  formValid.append("file", new Blob([validJpeg], { type: "image/jpeg" }));
  const notFoundRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      body: formValid,
    }),
    notFoundClient
  );
  assert.equal(notFoundRes.status, 401, "Not found returns 401 opaque");
  const notFoundBody = await notFoundRes.json();
  assert.equal(notFoundBody.error, OPAQUE_ERROR_MESSAGE, "Opaque error message");

  // Invalid access code (401 opaque)
  const formBadCode = new FormData();
  formBadCode.append("registration_number", TEST_REG_NUMBER);
  formBadCode.append("access_code", "WRONGCOD");
  formBadCode.append("document_type", "kartu_keluarga");
  formBadCode.append("file", new Blob([validJpeg], { type: "image/jpeg" }));
  const badCodeRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      body: formBadCode,
    }),
    createMockSupabase()
  );
  assert.equal(badCodeRes.status, 401, "Wrong code returns 401 opaque");

  // Status conflict (awaiting_payment / not verified)
  const unverifiedClient = createMockSupabase({
    registration: {
      id: REG_ID,
      registration_number: TEST_REG_NUMBER,
      status: "awaiting_payment",
      payment_status: "payment_pending",
    },
  });
  const unverifiedRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      body: formValid,
    }),
    unverifiedClient
  );
  assert.equal(unverifiedRes.status, 409, "Unverified payment returns 409 Conflict");

  // Status conflict (already submitted)
  const submittedClient = createMockSupabase({
    registration: {
      id: REG_ID,
      registration_number: TEST_REG_NUMBER,
      status: "submitted",
      payment_status: "payment_verified",
    },
  });
  const submittedRes = await handleDocumentUpload(
    new Request("http://localhost/functions/v1/document-upload", {
      method: "POST",
      body: formValid,
    }),
    submittedClient
  );
  assert.equal(submittedRes.status, 409, "Submitted status returns 409 Conflict");

  // Happy path upload for each allowed document type
  for (const docType of ALLOWED_DOC_TYPES) {
    const client = createMockSupabase();
    const goodForm = new FormData();
    goodForm.append("registration_number", TEST_REG_NUMBER);
    goodForm.append("access_code", TEST_CODE);
    goodForm.append("document_type", docType);
    goodForm.append("file", new Blob([validJpeg], { type: "image/jpeg" }));

    const res = await handleDocumentUpload(
      new Request("http://localhost/functions/v1/document-upload", {
        method: "POST",
        body: goodForm,
      }),
      client
    );

    assert.equal(res.status, 200, `${docType} upload succeeded with 200`);
    const data: DocumentUploadResponse = await res.json();
    assert.equal(data.success, true, "Success true");
    assert.equal(data.document_type, docType, `Document type ${docType}`);
    assert.ok(data.file_path.includes(`${REG_ID}/${docType}-`), "Storage path contains reg ID and docType");

    assert.equal(client._inspect.uploadedStorage.length, 1, "Uploaded to storage");
    assert.equal(client._inspect.upsertedDocs.length, 1, "Upserted to db");
    assert.equal(client._inspect.auditLogs.length, 1, "Audit log created");
    console.log(`✓ Happy path upload for ${docType} verified`);
  }

  console.log("All document-upload tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  throw err;
});
