import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Type definition for Deno runtime in Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// CORS headers for frontend SPA integration
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 32-char CSPRNG alphabet excluding ambiguous characters (0, O, 1, I) per security spec
const ACCESS_CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAccessCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ACCESS_CODE_CHARSET[byte % ACCESS_CODE_CHARSET.length]).join("");
}

export function validateWhatsAppNumber(wa: string): { valid: boolean; normalized?: string; error?: string } {
  if (!wa || typeof wa !== "string") {
    return { valid: false, error: "Nomor WhatsApp wajib diisi" };
  }
  const clean = wa.replace(/[\s-]/g, "");
  const waRegex = /^(\+?62|0)8[1-9][0-9]{6,10}$/;
  if (!waRegex.test(clean)) {
    return {
      valid: false,
      error: "Format nomor WhatsApp tidak valid. Gunakan format Indonesia (contoh: 08123456789 atau 628123456789)",
    };
  }

  let normalized = clean;
  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  } else if (normalized.startsWith("0")) {
    normalized = "62" + normalized.slice(1);
  }

  return { valid: true, normalized };
}

if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve(async (req: Request) => {
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

  let body: { child_name?: unknown; parent_name?: unknown; whatsapp_number?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Format request JSON tidak valid" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { child_name, parent_name, whatsapp_number } = body;

  if (typeof child_name !== "string" || !child_name.trim()) {
    return new Response(JSON.stringify({ error: "Nama anak wajib diisi" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (typeof parent_name !== "string" || !parent_name.trim()) {
    return new Response(JSON.stringify({ error: "Nama orang tua/wali wajib diisi" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const waValidation = validateWhatsAppNumber(typeof whatsapp_number === "string" ? whatsapp_number : "");
  if (!waValidation.valid || !waValidation.normalized) {
    return new Response(JSON.stringify({ error: waValidation.error || "Nomor WhatsApp tidak valid" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server configuration missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify registration is open
  const { data: configOpen } = await supabase
    .from("ppdb_config")
    .select("value")
    .eq("key", "registration_open")
    .maybeSingle();

  if (configOpen && (configOpen.value === false || configOpen.value === "false")) {
    return new Response(JSON.stringify({ error: "Pendaftaran PPDB saat ini sedang ditutup." }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Retrieve active PPDB period
  const { data: periodConfig } = await supabase
    .from("ppdb_config")
    .select("value")
    .eq("key", "ppdb_period")
    .maybeSingle();

  const ppdbPeriod =
    typeof periodConfig?.value === "string"
      ? periodConfig.value
      : periodConfig?.value
      ? JSON.stringify(periodConfig.value).replace(/"/g, "")
      : "2027-2028";

  const currentYear = new Date().getFullYear().toString();

  // Generate registration number (atomic via DB sequence or fallback with collision retry)
  let registrationNumber: string | null = null;
  try {
    const { data: generated, error: rpcError } = await supabase.rpc("generate_registration_number", {
      period: currentYear,
    });
    if (!rpcError && generated && typeof generated === "string") {
      registrationNumber = generated;
    }
  } catch {
    // DB RPC fallback below
  }

  if (!registrationNumber) {
    let attempts = 0;
    while (attempts < 10) {
      const seq = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
      const candidate = `PPDB-${currentYear}-${seq}`;
      const { data: existing } = await supabase
        .from("registrations")
        .select("id")
        .eq("registration_number", candidate)
        .maybeSingle();

      if (!existing) {
        registrationNumber = candidate;
        break;
      }
      attempts++;
    }
  }

  if (!registrationNumber) {
    return new Response(
      JSON.stringify({ error: "Gagal membuat nomor pendaftaran unik. Silakan coba kembali." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Generate 8-character CSPRNG access code and hash it
  const accessCode = generateAccessCode();
  const accessCodeHash = await bcrypt.hash(accessCode, 10);

  // Insert registration record (RLS bypassed via service role)
  const { data: registration, error: regError } = await supabase
    .from("registrations")
    .insert({
      registration_number: registrationNumber,
      child_name: child_name.trim(),
      parent_name: parent_name.trim(),
      whatsapp_number: waValidation.normalized,
      status: "awaiting_payment",
      payment_status: "payment_pending",
      ppdb_period: ppdbPeriod,
    })
    .select("id")
    .single();

  if (regError || !registration) {
    return new Response(
      JSON.stringify({ error: "Gagal membuat pendaftaran: " + (regError?.message || "Kesalahan database") }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Store access code hash in registration_access
  const { error: accessError } = await supabase.from("registration_access").insert({
    registration_id: registration.id,
    access_code_hash: accessCodeHash,
  });

  if (accessError) {
    // Rollback registration record if access credentials could not be stored
    await supabase.from("registrations").delete().eq("id", registration.id);
    return new Response(
      JSON.stringify({ error: "Gagal menyimpan kredensial akses pendaftaran." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Log audit event (non-fatal)
  try {
    await supabase.from("audit_events").insert({
      actor_type: "applicant",
      action: "registration_created",
      entity_type: "registration",
      entity_id: registration.id,
      metadata: { registration_number: registrationNumber },
    });
  } catch {
    // Best-effort audit logging
  }

  // Plaintext access_code returned ONCE in 201 response. NEVER logged.
  return new Response(
    JSON.stringify({
      registration_number: registrationNumber,
      access_code: accessCode,
      registration_id: registration.id,
    }),
    {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
  });
}

