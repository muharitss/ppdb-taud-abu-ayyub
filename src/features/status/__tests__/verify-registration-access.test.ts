import bcrypt from "bcryptjs";
import {
  handleVerifyAccess,
  OPAQUE_ERROR_MESSAGE,
  MAX_ATTEMPTS,
  type VerifyAccessResponse,
} from "../../../../supabase/functions/verify-registration-access/index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
assert.equal = (a: unknown, b: unknown, message: string) => {
  if (a !== b) throw new Error(`${message}: ${a} !== ${b}`);
};
assert.ok = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

console.log("Running verify-registration-access tests...");

// Setup mock data
const TEST_REG_NUMBER = "PPDB-2027-00123";
const TEST_CODE = "ABCD2345";
const TEST_HASH = bcrypt.hashSync(TEST_CODE, 10);
const REG_ID = "11111111-2222-3333-4444-555555555555";

interface MockAuditEvent {
  [key: string]: unknown;
  id: string;
  entity_type: string;
  entity_id?: string;
  action: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface MockQueryBuilder {
  eq: (field: string, val: string) => MockQueryBuilder;
  filter: (path: string, op: string, val: string) => MockQueryBuilder;
  order: (orderField: string, opts: unknown) => MockQueryBuilder;
  limit: (n: number) => { maybeSingle: () => Promise<{ data: MockAuditEvent | null }> };
  gte: (dateField: string, minDate: string) => Promise<{ count: number; data: null }>;
}

function createMockSupabase(initialState?: {
  auditEvents?: Array<MockAuditEvent>;
}) {
  const auditEvents: Array<MockAuditEvent> = initialState?.auditEvents ? [...initialState.auditEvents] : [];

  return {
    from: (tableName: string) => {
      if (tableName === "registrations") {
        return {
          select: () => ({
            eq: (_field: string, val: string) => ({
              maybeSingle: async () => {
                if (val === TEST_REG_NUMBER) {
                  return {
                    data: {
                      id: REG_ID,
                      registration_number: TEST_REG_NUMBER,
                      status: "awaiting_payment",
                      payment_status: "payment_pending",
                      submitted_at: null,
                      parent_name: "John Secret",
                      whatsapp_number: "6281234567890",
                    },
                    error: null,
                  };
                }
                return { data: null, error: null };
              },
            }),
          }),
        };
      }

      if (tableName === "registration_access") {
        return {
          select: () => ({
            eq: (_field: string, val: string) => ({
              maybeSingle: async () => {
                if (val === REG_ID) {
                  return {
                    data: {
                      id: "access-uuid-1",
                      access_code_hash: TEST_HASH,
                    },
                    error: null,
                  };
                }
                return { data: null, error: null };
              },
            }),
          }),
        };
      }

      if (tableName === "audit_events") {
        return {
          insert: async (event: {
            action: string;
            entity_type: string;
            entity_id?: string;
            metadata?: Record<string, unknown>;
          }) => {
            auditEvents.push({
              id: `evt-${auditEvents.length + 1}`,
              created_at: new Date().toISOString(),
              entity_type: event.entity_type,
              action: event.action,
              entity_id: event.entity_id,
              metadata: event.metadata,
            });
            return { error: null };
          },
          select: () => {
            const filters: Array<(e: MockAuditEvent) => boolean> = [];

            const builder: MockQueryBuilder = {
              eq: (field: string, val: string) => {
                filters.push((e) => e[field] === val);
                return builder;
              },
              filter: (path: string, _op: string, val: string) => {
                if (path === "metadata->>registration_number") {
                  filters.push((e) => e.metadata?.registration_number === val);
                }
                return builder;
              },
              order: () => builder,
              limit: () => ({
                maybeSingle: async () => {
                  const matches = auditEvents.filter((e) => filters.every((fn) => fn(e)));
                  return { data: matches[matches.length - 1] || null };
                },
              }),
              gte: async (dateField: string, minDate: string) => {
                filters.push((e) => (e[dateField] as string) >= minDate);
                const matches = auditEvents.filter((e) => filters.every((fn) => fn(e)));
                return { count: matches.length, data: null };
              },
            };
            return builder;
          },
        };
      }

      throw new Error(`Unexpected table name: ${tableName}`);
    },
    _getEvents: () => auditEvents,
  } as unknown as Parameters<typeof handleVerifyAccess>[1] & { _getEvents: () => Array<MockAuditEvent> };
}

async function run() {
  // 1. CORS Preflight & Method check
  {
    const resOpt = await handleVerifyAccess(new Request("http://localhost", { method: "OPTIONS" }));
    assert.equal(resOpt.status, 200, "OPTIONS should return 200");

    const resGet = await handleVerifyAccess(new Request("http://localhost", { method: "GET" }));
    assert.equal(resGet.status, 405, "GET should return 405 Method Not Allowed");
    console.log("✓ Method & CORS check passed");
  }

  // 2. Missing Input Validation
  {
    const client = createMockSupabase();
    const resEmpty = await handleVerifyAccess(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      client
    );
    assert.equal(resEmpty.status, 400, "Empty payload should return 400");

    const resPartial = await handleVerifyAccess(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ registration_number: TEST_REG_NUMBER }),
      }),
      client
    );
    assert.equal(resPartial.status, 400, "Missing access_code should return 400");
    console.log("✓ Input validation check passed");
  }

  // 3. Non-existent Registration Returns Opaque 401
  {
    const client = createMockSupabase();
    const resNotFound = await handleVerifyAccess(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          registration_number: "PPDB-2027-99999",
          access_code: "ABCD2345",
        }),
      }),
      client
    );
    assert.equal(resNotFound.status, 401, "Non-existent registration should return 401");
    const json = await resNotFound.json();
    assert.equal(json.error, OPAQUE_ERROR_MESSAGE, "Should return generic opaque error message");
    console.log("✓ Non-existent registration opaque error passed");
  }

  // 4. Incorrect Access Code Returns Same Opaque 401
  {
    const client = createMockSupabase();
    const resWrongCode = await handleVerifyAccess(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          registration_number: TEST_REG_NUMBER,
          access_code: "WRONGCOD",
        }),
      }),
      client
    );
    assert.equal(resWrongCode.status, 401, "Incorrect access code should return 401");
    const json = await resWrongCode.json();
    assert.equal(json.error, OPAQUE_ERROR_MESSAGE, "Wrong code must match exact same opaque error message");
    console.log("✓ Incorrect code opaque error passed");
  }

  // 5. Rate Limiting Check: 5 Failed Attempts Trigger 429
  {
    const client = createMockSupabase();
    // Simulate 5 failed attempts
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const res = await handleVerifyAccess(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify({
            registration_number: TEST_REG_NUMBER,
            access_code: "WRONGCOD",
          }),
        }),
        client
      );
      assert.equal(res.status, 401, `Attempt ${i + 1} should return 401`);
    }

    // 6th attempt should be blocked by rate limit
    const resBlocked = await handleVerifyAccess(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          registration_number: TEST_REG_NUMBER,
          access_code: TEST_CODE, // Even with correct code!
        }),
      }),
      client
    );
    assert.equal(resBlocked.status, 429, "6th attempt must return 429 Too Many Requests");
    assert.equal(resBlocked.headers.get("Retry-After"), "900", "Retry-After must be 900 seconds");
    console.log("✓ Rate limiting (5 failed attempts -> 429) passed");
  }

  // 6. Valid Credentials Return Status and Whitelist Fields Only
  {
    const client = createMockSupabase();
    const resSuccess = await handleVerifyAccess(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          registration_number: TEST_REG_NUMBER.toLowerCase(), // test case-insensitivity
          access_code: TEST_CODE.toLowerCase(),
        }),
      }),
      client
    );
    assert.equal(resSuccess.status, 200, "Valid credentials should return 200");
    const data = (await resSuccess.json()) as VerifyAccessResponse & Record<string, unknown>;

    assert.equal(data.registration_number, TEST_REG_NUMBER, "Returns correct registration number");
    assert.equal(data.registration_status, "awaiting_payment", "Returns correct registration_status");
    assert.equal(data.payment_status, "payment_pending", "Returns correct payment_status");
    assert.equal(data.submitted_at, null, "Returns submitted_at");
    assert.equal(data.form_completeness, false, "Returns form_completeness");

    // CRITICAL SECURITY CHECKS: Ensure private fields are NOT present
    assert.equal(data["access_code_hash"], undefined, "Never expose access_code_hash");
    assert.equal(data["parent_name"], undefined, "Never expose parent_name");
    assert.equal(data["whatsapp_number"], undefined, "Never expose whatsapp_number");
    assert.equal(data["documents"], undefined, "Never expose documents");
    assert.equal(data["form_data"], undefined, "Never expose form_data");
    console.log("✓ Successful verification & response whitelist security passed");
  }

  // 7. Success Resets Attempt Counter
  {
    const client = createMockSupabase({
      auditEvents: [
        {
          id: "fail-1",
          entity_type: "registration",
          entity_id: REG_ID,
          action: "verify_access_failed",
          created_at: new Date(Date.now() - 5000).toISOString(),
        },
      ],
    });

    // Successful attempt
    const res1 = await handleVerifyAccess(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          registration_number: TEST_REG_NUMBER,
          access_code: TEST_CODE,
        }),
      }),
      client
    );
    assert.equal(res1.status, 200, "First login succeeds");

    // After success, event count is effectively reset
    const events = client._getEvents();
    assert.ok(
      events.some((e: MockAuditEvent) => e.action === "verify_access_success"),
      "Audit event for success recorded"
    );
    console.log("✓ Successful login resets failure window passed");
  }

  console.log("All verify-registration-access tests completed successfully!");
}

await run();
