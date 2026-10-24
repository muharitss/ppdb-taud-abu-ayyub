import bcrypt from "bcryptjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  handleSubmitFullForm,
  OPAQUE_ERROR_MESSAGE,
} from "../../../../supabase/functions/submit-full-form/index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};
assert.ok = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

console.log("Running submit-full-form tests...");

const TEST_REG_NUMBER = "PPDB-2027-00555";
const TEST_CODE = "CODE1234";
const TEST_HASH = bcrypt.hashSync(TEST_CODE, 10);
const REG_ID = "33333333-4444-5555-6666-777777777777";

const sampleValidForm = {
  child: {
    full_name: "Muhammad Ali",
    nickname: "Ali",
    nik: "1408011205210001",
    birth_place: "Duri",
    birth_date: "2021-05-12",
    gender: "laki_laki",
    child_order: 1,
    sibling_count: 1,
    address: "Jl. Karang Anyar No. 5, Duri",
    program: "2_tahun",
  },
  father: {
    full_name: "Abdullah",
    nik: "1408011205850002",
    birth_place: "Duri",
    birth_date: "1985-05-12",
    last_education: "S1",
    occupation: "Karyawan Swasta",
    monthly_income: "5.000.000 - 10.000.000",
    whatsapp_number: "081234567890",
    address: "Jl. Karang Anyar No. 5, Duri",
  },
  mother: {
    full_name: "Fathimah",
    nik: "1408011205880003",
    birth_place: "Duri",
    birth_date: "1988-08-15",
    last_education: "D3",
    occupation: "Ibu Rumah Tangga",
    monthly_income: "",
    whatsapp_number: "081298765432",
    address: "Jl. Karang Anyar No. 5, Duri",
  },
  health: {
    weight_kg: 16.5,
    height_cm: 102,
    blood_type: "O",
    allergy_history: "Tidak ada",
    disease_history: "Tidak ada",
  },
};

function createMockSupabase(overrides?: {
  registration?: {
    id: string;
    registration_number: string;
    status: string;
    payment_status: string;
    submitted_at: string | null;
  } | null;
  accessRecord?: { access_code_hash: string } | null;
  documents?: Array<{ document_type: string; file_path: string }>;
  formData?: Record<string, unknown> | null;
}) {
  const auditLogs: unknown[] = [];
  const savedFormData: unknown[] = [];
  let regUpdated: unknown = null;

  const registrationData =
    overrides?.registration !== undefined
      ? overrides.registration
      : {
          id: REG_ID,
          registration_number: TEST_REG_NUMBER,
          status: "awaiting_form",
          payment_status: "payment_submitted",
          submitted_at: null,
        };

  const accessData =
    overrides?.accessRecord !== undefined
      ? overrides.accessRecord
      : { access_code_hash: TEST_HASH };

  const documentsData =
    overrides?.documents !== undefined
      ? overrides.documents
      : [
          { document_type: "kartu_keluarga", file_path: `${REG_ID}/kk.jpg` },
          { document_type: "akte_kelahiran", file_path: `${REG_ID}/akte.jpg` },
        ];

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
          update: (fields: unknown) => ({
            eq: () => {
              regUpdated = fields;
              return Promise.resolve({ error: null });
            },
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
            eq: () => Promise.resolve({ data: documentsData, error: null }),
          }),
        };
      }

      if (table === "registration_form_data") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: overrides?.formData ? { form_data: overrides.formData } : null,
                error: null,
              }),
            }),
          }),
          upsert: async (record: unknown) => {
            savedFormData.push(record);
            return { error: null };
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

    _inspect: {
      auditLogs,
      savedFormData,
      getRegUpdated: () => regUpdated,
    },
  };

  return mockClient as unknown as SupabaseClient & {
    _inspect: typeof mockClient._inspect;
  };
}

async function runTests() {
  // CORS & Method checks
  const optRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", { method: "OPTIONS" })
  );
  assert.equal(optRes.status, 200, "OPTIONS returns 200");

  const getRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", { method: "GET" })
  );
  assert.equal(getRes.status, 405, "GET returns 405");

  // Missing credentials
  const badReqRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", {
      method: "POST",
      body: JSON.stringify({ registration_number: "" }),
    })
  );
  assert.equal(badReqRes.status, 400, "Missing credentials returns 400");

  // Unknown registration (401 opaque)
  const notFoundClient = createMockSupabase({ registration: null });
  const notFoundRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", {
      method: "POST",
      body: JSON.stringify({
        registration_number: "PPDB-2027-99999",
        access_code: TEST_CODE,
        action: "get",
      }),
    }),
    notFoundClient
  );
  assert.equal(notFoundRes.status, 401, "Not found returns 401 opaque");
  const nfBody = await notFoundRes.json();
  assert.equal(nfBody.error, OPAQUE_ERROR_MESSAGE, "Opaque error message");

  // Action "get"
  const getClient = createMockSupabase({
    formData: sampleValidForm,
  });
  const actionGetRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", {
      method: "POST",
      body: JSON.stringify({
        registration_number: TEST_REG_NUMBER,
        access_code: TEST_CODE,
        action: "get",
      }),
    }),
    getClient
  );
  assert.equal(actionGetRes.status, 200, "Action get returns 200");
  const getData = await actionGetRes.json();
  assert.equal(getData.registration_number, TEST_REG_NUMBER, "Returns registration number");
  assert.equal(getData.documents.length, 2, "Returns 2 documents (KK & Akte)");
  assert.ok(getData.form_data.child, "Returns form_data");
  console.log("✓ Action 'get' verified");

  // Action "save_draft"
  const draftClient = createMockSupabase();
  const partialDraft = { child: { full_name: "Muhammad Ali" } };
  const draftRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", {
      method: "POST",
      body: JSON.stringify({
        registration_number: TEST_REG_NUMBER,
        access_code: TEST_CODE,
        action: "save_draft",
        form_data: partialDraft,
      }),
    }),
    draftClient
  );
  assert.equal(draftRes.status, 200, "Action save_draft returns 200");
  assert.equal(draftClient._inspect.savedFormData.length, 1, "Draft saved in DB");
  console.log("✓ Action 'save_draft' verified");

  // Action "submit" missing required field
  const invalidForm = { ...sampleValidForm, child: { ...sampleValidForm.child, nik: "123" } };
  const submitInvalidRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", {
      method: "POST",
      body: JSON.stringify({
        registration_number: TEST_REG_NUMBER,
        access_code: TEST_CODE,
        action: "submit",
        form_data: invalidForm,
      }),
    }),
    createMockSupabase()
  );
  assert.equal(submitInvalidRes.status, 400, "Invalid schema rejected with 400");
  console.log("✓ Schema validation on submit verified");

  // Action "submit" missing documents
  const missingDocsClient = createMockSupabase({
    documents: [{ document_type: "kartu_keluarga", file_path: "p/kk.jpg" }],
  });
  const submitMissingDocsRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", {
      method: "POST",
      body: JSON.stringify({
        registration_number: TEST_REG_NUMBER,
        access_code: TEST_CODE,
        action: "submit",
        form_data: sampleValidForm,
      }),
    }),
    missingDocsClient
  );
  assert.equal(submitMissingDocsRes.status, 400, "Missing documents rejected with 400");
  console.log("✓ Missing documents check on submit verified");

  // Action "submit" happy path
  const submitClient = createMockSupabase();
  const submitRes = await handleSubmitFullForm(
    new Request("http://localhost/functions/v1/submit-full-form", {
      method: "POST",
      body: JSON.stringify({
        registration_number: TEST_REG_NUMBER,
        access_code: TEST_CODE,
        action: "submit",
        form_data: sampleValidForm,
      }),
    }),
    submitClient
  );
  assert.equal(submitRes.status, 200, "Submit succeeded with 200");
  const submitData = await submitRes.json();
  assert.equal(submitData.status, "submitted", "Status is submitted");
  assert.ok(submitClient._inspect.getRegUpdated(), "Registration status updated in DB");
  assert.equal(submitClient._inspect.auditLogs.length, 1, "Audit log logged");
  console.log("✓ Happy path form submit verified");

  console.log("All submit-full-form tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  throw err;
});
