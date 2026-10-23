/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  handleAdminReviewPayment,
  type AdminReviewPaymentResponse,
} from "../../../../supabase/functions/admin-review-payment/index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};

console.log("Running admin-review-payment Edge Function tests...");

const ADMIN_USER_ID = "11111111-2222-3333-4444-555555555555";
const NON_ADMIN_USER_ID = "99999999-8888-7777-6666-555555555555";
const VALID_PAYMENT_ID = "22222222-3333-4444-5555-666666666666";
const VALID_TOKEN = "valid-admin-jwt-token";

interface MockConfig {
  user?: { id: string } | null;
  authError?: { message: string } | null;
  adminProfile?: { id: string; role: string } | null;
  profileError?: { message: string } | null;
  rpcResult?: { success: boolean; new_status: string } | null;
  rpcError?: { message: string; code?: string } | null;
}

function createMockSupabase(config: MockConfig = {}) {
  let calledRpcName = "";
  let calledRpcParams: unknown = null;

  const mock = {
    auth: {
      getUser: async (token: string) => {
        if (token !== VALID_TOKEN || config.authError) {
          return { data: { user: null }, error: config.authError || { message: "Invalid JWT" } };
        }
        return {
          data: {
            user: config.user !== undefined ? config.user : { id: ADMIN_USER_ID },
          },
          error: null,
        };
      },
    },
    from: (table: string) => {
      if (table === "admin_profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => {
                if (config.profileError) {
                  return { data: null, error: config.profileError };
                }
                if (config.adminProfile !== undefined) {
                  return { data: config.adminProfile, error: null };
                }
                return { data: { id: ADMIN_USER_ID, role: "admin" }, error: null };
              },
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
    rpc: async (name: string, params: unknown) => {
      calledRpcName = name;
      calledRpcParams = params;
      if (config.rpcError) {
        return { data: null, error: config.rpcError };
      }
      return {
        data: config.rpcResult || {
          success: true,
          payment_id: VALID_PAYMENT_ID,
          new_status: "payment_verified",
        },
        error: null,
      };
    },
    _getCalledRpc: () => ({ calledRpcName, calledRpcParams }),
  };

  return mock;
}

// 1. CORS Preflight & Method check
{
  const optionsReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "OPTIONS",
  });
  const resOptions = await handleAdminReviewPayment(optionsReq, createMockSupabase() as any);
  assert.equal(resOptions.status, 200, "OPTIONS returns 200");

  const getReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "GET",
  });
  const resGet = await handleAdminReviewPayment(getReq, createMockSupabase() as any);
  assert.equal(resGet.status, 405, "GET returns 405 Method Not Allowed");
  console.log("✓ CORS preflight and method check passed");
}

// 2. Authentication checks
{
  const noAuthReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_id: VALID_PAYMENT_ID, approved: true }),
  });
  const resNoAuth = await handleAdminReviewPayment(noAuthReq, createMockSupabase() as any);
  assert.equal(resNoAuth.status, 401, "Missing auth header returns 401");

  const badTokenReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: "Bearer invalid-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: VALID_PAYMENT_ID, approved: true }),
  });
  const resBadToken = await handleAdminReviewPayment(badTokenReq, createMockSupabase() as any);
  assert.equal(resBadToken.status, 401, "Invalid token returns 401");
  console.log("✓ Authentication checks passed");
}

// 3. Authorization check (non-admin)
{
  const nonAdminMock = createMockSupabase({
    user: { id: NON_ADMIN_USER_ID },
    adminProfile: null,
    profileError: { message: "No row found" },
  });
  const nonAdminReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VALID_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: VALID_PAYMENT_ID, approved: true }),
  });
  const resNonAdmin = await handleAdminReviewPayment(nonAdminReq, nonAdminMock as any);
  assert.equal(resNonAdmin.status, 403, "Non-admin returns 403 Forbidden");
  console.log("✓ Authorization role guard (403) passed");
}

// 4. Input validation checks
{
  const badUuidReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VALID_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: "not-a-uuid", approved: true }),
  });
  const resBadUuid = await handleAdminReviewPayment(badUuidReq, createMockSupabase() as any);
  assert.equal(resBadUuid.status, 400, "Bad UUID returns 400");

  const missingApprovedReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VALID_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: VALID_PAYMENT_ID }),
  });
  const resMissingApproved = await handleAdminReviewPayment(
    missingApprovedReq,
    createMockSupabase() as any
  );
  assert.equal(resMissingApproved.status, 400, "Missing approved flag returns 400");

  const rejectWithoutNotesReq = new Request(
    "http://localhost/functions/v1/admin-review-payment",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VALID_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment_id: VALID_PAYMENT_ID, approved: false, review_notes: "   " }),
    }
  );
  const resRejectNoNotes = await handleAdminReviewPayment(
    rejectWithoutNotesReq,
    createMockSupabase() as any
  );
  assert.equal(resRejectNoNotes.status, 400, "Rejecting without notes returns 400");
  console.log("✓ Input validation checks passed");
}

// 5. Payment not found (404) & Conflict (409)
{
  const notFoundMock = createMockSupabase({
    rpcError: { message: "Payment record not found", code: "P0002" },
  });
  const notFoundReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VALID_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: VALID_PAYMENT_ID, approved: true }),
  });
  const resNotFound = await handleAdminReviewPayment(notFoundReq, notFoundMock as any);
  assert.equal(resNotFound.status, 404, "Payment not found returns 404");

  const conflictMock = createMockSupabase({
    rpcError: {
      message: "Payment is not in submitted status (current status: payment_verified)",
      code: "P0001",
    },
  });
  const conflictReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VALID_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: VALID_PAYMENT_ID, approved: true }),
  });
  const resConflict = await handleAdminReviewPayment(conflictReq, conflictMock as any);
  assert.equal(resConflict.status, 409, "Already reviewed payment returns 409 Conflict");
  console.log("✓ 404 Not Found and 409 Conflict checks passed");
}

// 6. Successful approve flow
{
  const approveMock = createMockSupabase();
  const approveReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VALID_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_id: VALID_PAYMENT_ID, approved: true }),
  });
  const resApprove = await handleAdminReviewPayment(approveReq, approveMock as any);
  assert.equal(resApprove.status, 200, "Approve returns 200");
  const data = (await resApprove.json()) as AdminReviewPaymentResponse;
  assert.equal(data.success, true, "Success is true");
  assert.equal(data.new_status, "payment_verified", "Status is payment_verified");

  const { calledRpcName, calledRpcParams } = approveMock._getCalledRpc();
  assert.equal(calledRpcName, "fn_review_payment", "RPC fn_review_payment called");
  assert.equal((calledRpcParams as any).p_payment_id, VALID_PAYMENT_ID, "Payment ID matches");
  assert.equal((calledRpcParams as any).p_approved, true, "Approved flag is true");
  assert.equal((calledRpcParams as any).p_admin_id, ADMIN_USER_ID, "Admin ID matches caller");
  console.log("✓ Successful approval flow passed");
}

// 7. Successful reject flow with review notes
{
  const rejectMock = createMockSupabase();
  const rejectReq = new Request("http://localhost/functions/v1/admin-review-payment", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VALID_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_id: VALID_PAYMENT_ID,
      approved: false,
      review_notes: "Foto buram dan nominal tidak terlihat jelas.",
    }),
  });
  const resReject = await handleAdminReviewPayment(rejectReq, rejectMock as any);
  assert.equal(resReject.status, 200, "Reject returns 200");
  const data = (await resReject.json()) as AdminReviewPaymentResponse;
  assert.equal(data.success, true, "Success is true");
  assert.equal(data.new_status, "payment_rejected", "Status is payment_rejected");

  const { calledRpcParams } = rejectMock._getCalledRpc();
  assert.equal((calledRpcParams as any).p_approved, false, "Approved flag is false");
  assert.equal(
    (calledRpcParams as any).p_review_notes,
    "Foto buram dan nominal tidak terlihat jelas.",
    "Review notes passed correctly"
  );
  console.log("✓ Successful rejection flow with notes passed");
}

console.log("All admin-review-payment tests completed successfully!");
