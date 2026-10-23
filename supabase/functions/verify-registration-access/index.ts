import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Type definition for Deno runtime in Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// CORS headers for frontend SPA integration
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const OPAQUE_ERROR_MESSAGE = "Nomor pendaftaran atau kode akses tidak sesuai";
export const MAX_ATTEMPTS = 5;
export const WINDOW_MINUTES = 15;

// Precomputed cost-10 bcrypt hash for timing attack mitigation when registration is not found
const DUMMY_HASH = "$2a$10$e8k6m78Xz77J3/7Kqg/dLeX.Q.r9Kz8G3gXlqgD9n/2XyU5e7F9yK";

export interface VerifyAccessResponse {
  registration_number: string;
  registration_status: string;
  payment_status: string;
  submitted_at: string | null;
  form_completeness: boolean;
}

export async function handleVerifyAccess(
  req: Request,
  injectedSupabase?: SupabaseClient
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { registration_number?: unknown; access_code?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Format request JSON tidak valid" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawRegNum = body?.registration_number;
  const rawCode = body?.access_code;

  if (
    typeof rawRegNum !== "string" ||
    !rawRegNum.trim() ||
    typeof rawCode !== "string" ||
    !rawCode.trim()
  ) {
    return new Response(
      JSON.stringify({ error: "Nomor pendaftaran dan kode akses wajib diisi" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const normalizedRegNum = rawRegNum.trim().toUpperCase();
  const normalizedCode = rawCode.trim().toUpperCase();

  let supabase: SupabaseClient;
  if (injectedSupabase) {
    supabase = injectedSupabase;
  } else {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Server configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // 1. Look up registration
  const { data: registration } = await supabase
    .from("registrations")
    .select("id, registration_number, status, payment_status, submitted_at")
    .eq("registration_number", normalizedRegNum)
    .maybeSingle();

  // 2. Rate limit check (Max 5 failed attempts per 15-minute window)
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  let effectiveWindowStart = windowStart;
  if (registration) {
    const { data: lastSuccess } = await supabase
      .from("audit_events")
      .select("created_at")
      .eq("entity_type", "registration")
      .eq("entity_id", registration.id)
      .eq("action", "verify_access_success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastSuccess?.created_at && lastSuccess.created_at > windowStart) {
      effectiveWindowStart = lastSuccess.created_at;
    }
  }

  let failedAttempts = 0;
  if (registration) {
    const { count } = await supabase
      .from("audit_events")
      .select("id", { count: "exact", head: true })
      .eq("entity_type", "registration")
      .eq("entity_id", registration.id)
      .eq("action", "verify_access_failed")
      .gte("created_at", effectiveWindowStart);

    failedAttempts = count ?? 0;
  } else {
    // Check failed attempts by metadata registration_number when registration doesn't exist
    const { count } = await supabase
      .from("audit_events")
      .select("id", { count: "exact", head: true })
      .eq("entity_type", "registration")
      .eq("action", "verify_access_failed")
      .filter("metadata->>registration_number", "eq", normalizedRegNum)
      .gte("created_at", windowStart);

    failedAttempts = count ?? 0;
  }

  if (failedAttempts >= MAX_ATTEMPTS) {
    return new Response(
      JSON.stringify({ error: "Terlalu banyak percobaan gagal. Silakan coba lagi dalam 15 menit." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": "900",
        },
      }
    );
  }

  // 3. Not found registration handling with timing equalization
  if (!registration) {
    await bcrypt.compare(normalizedCode, DUMMY_HASH);
    try {
      await supabase.from("audit_events").insert({
        actor_type: "applicant",
        action: "verify_access_failed",
        entity_type: "registration",
        metadata: { registration_number: normalizedRegNum, reason: "not_found" },
      });
    } catch {
      // Best-effort audit logging
    }

    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 4. Retrieve access code hash
  const { data: accessRecord } = await supabase
    .from("registration_access")
    .select("id, access_code_hash")
    .eq("registration_id", registration.id)
    .maybeSingle();

  if (!accessRecord?.access_code_hash) {
    await bcrypt.compare(normalizedCode, DUMMY_HASH);
    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 5. Compare access code
  const isValid = await bcrypt.compare(normalizedCode, accessRecord.access_code_hash);

  if (!isValid) {
    try {
      await supabase.from("audit_events").insert({
        actor_type: "applicant",
        action: "verify_access_failed",
        entity_type: "registration",
        entity_id: registration.id,
        metadata: { registration_number: registration.registration_number, reason: "invalid_code" },
      });
    } catch {
      // Best-effort audit logging
    }

    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 6. Success: record success audit event (resets failed attempt window)
  try {
    await supabase.from("audit_events").insert({
      actor_type: "applicant",
      action: "verify_access_success",
      entity_type: "registration",
      entity_id: registration.id,
      metadata: { registration_number: registration.registration_number },
    });
  } catch {
    // Best-effort audit logging
  }

  // 7. Whitelisted response fields only
  const responseData: VerifyAccessResponse = {
    registration_number: registration.registration_number,
    registration_status: registration.status,
    payment_status: registration.payment_status,
    submitted_at: registration.submitted_at ?? null,
    form_completeness: false,
  };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve((req: Request) => handleVerifyAccess(req));
}
