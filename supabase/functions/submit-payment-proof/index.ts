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
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Precomputed cost-10 bcrypt hash for timing attack mitigation when registration is not found
const DUMMY_HASH = "$2a$10$e8k6m78Xz77J3/7Kqg/dLeX.Q.r9Kz8G3gXlqgD9n/2XyU5e7F9yK";

export interface MimeCheckResult {
  mime: "image/jpeg" | "image/png" | "application/pdf";
  ext: "jpg" | "png" | "pdf";
}

/**
 * Validates file magic bytes (not just trusting client-supplied Content-Type header).
 * JPEG: FF D8 FF
 * PNG: 89 50 4E 47
 * PDF: 25 50 44 46 (%PDF)
 */
export function detectMimeType(bytes: Uint8Array): MimeCheckResult | null {
  if (bytes.length < 4) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: "image/png", ext: "png" };
  }

  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { mime: "application/pdf", ext: "pdf" };
  }

  return null;
}

export interface SubmitPaymentProofResponse {
  success: boolean;
  status: "payment_submitted";
  registration_status: "awaiting_form";
  message: string;
}

export async function handleSubmitPaymentProof(
  req: Request,
  injectedSupabase?: SupabaseClient
): Promise<Response> {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2. Parse payload (supporting multipart/form-data)
  let rawRegNum: unknown;
  let rawAccessCode: unknown;
  let fileBytes: Uint8Array | null = null;
  let clientFileSize = 0;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      rawRegNum = formData.get("registration_number");
      rawAccessCode = formData.get("access_code");
      const fileEntry = formData.get("file");

      if (fileEntry && typeof (fileEntry as Blob).arrayBuffer === "function") {
        const fileBlob = fileEntry as Blob;
        clientFileSize = fileBlob.size;
        fileBytes = new Uint8Array(await fileBlob.arrayBuffer());
      }
    } catch {
      return new Response(JSON.stringify({ error: "Format form-data tidak valid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } else {
    return new Response(
      JSON.stringify({ error: "Content-Type harus multipart/form-data" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 3. Validate presence of credentials
  if (
    typeof rawRegNum !== "string" ||
    !rawRegNum.trim() ||
    typeof rawAccessCode !== "string" ||
    !rawAccessCode.trim()
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
  const normalizedCode = rawAccessCode.trim().toUpperCase();

  // 4. Validate file existence and constraints
  if (!fileBytes || fileBytes.length === 0) {
    return new Response(JSON.stringify({ error: "File bukti transfer wajib diunggah" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (clientFileSize > MAX_FILE_SIZE_BYTES || fileBytes.length > MAX_FILE_SIZE_BYTES) {
    return new Response(
      JSON.stringify({ error: "Ukuran file bukti transfer melebihi batas maksimal 5MB" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const detected = detectMimeType(fileBytes);
  if (!detected) {
    return new Response(
      JSON.stringify({
        error: "Format berkas tidak valid. Hanya berkas JPEG, PNG, atau PDF yang diperbolehkan.",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 5. Initialize Supabase Client
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

  // 6. Look up registration
  const { data: registration } = await supabase
    .from("registrations")
    .select("id, registration_number, status, payment_status")
    .eq("registration_number", normalizedRegNum)
    .maybeSingle();

  // Timing side-channel mitigation: if not found, do dummy bcrypt compare
  if (!registration) {
    await bcrypt.compare(normalizedCode, DUMMY_HASH);
    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 7. Verify access code
  const { data: accessRecord } = await supabase
    .from("registration_access")
    .select("access_code_hash")
    .eq("registration_id", registration.id)
    .maybeSingle();

  if (!accessRecord?.access_code_hash) {
    await bcrypt.compare(normalizedCode, DUMMY_HASH);
    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const isValidCode = await bcrypt.compare(normalizedCode, accessRecord.access_code_hash);
  if (!isValidCode) {
    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 8. Business workflow validation
  if (registration.payment_status === "payment_verified") {
    return new Response(
      JSON.stringify({ error: "Pembayaran untuk nomor pendaftaran ini telah diverifikasi." }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (registration.payment_status === "payment_submitted") {
    return new Response(
      JSON.stringify({
        error: "Bukti pembayaran telah dikirim sebelumnya dan sedang dalam antrean verifikasi admin.",
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (registration.status !== "awaiting_payment" && registration.payment_status !== "payment_rejected") {
    return new Response(
      JSON.stringify({
        error: "Status pendaftaran saat ini tidak mengizinkan pengunggahan bukti pembayaran.",
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 9. Upload proof file to private storage bucket: payment-proofs
  const filename = `${Date.now()}-proof.${detected.ext}`;
  const storagePath = `${registration.id}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(storagePath, fileBytes, {
      contentType: detected.mime,
      upsert: false,
    });

  if (uploadError) {
    return new Response(
      JSON.stringify({ error: "Gagal menyimpan berkas ke penyimpanan server." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 10. Record payment in payments table
  const { error: paymentInsertError } = await supabase.from("payments").insert({
    registration_id: registration.id,
    proof_file_path: storagePath,
    status: "payment_submitted",
  });

  if (paymentInsertError) {
    return new Response(
      JSON.stringify({ error: "Gagal mencatat data pembayaran di database." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 11. Update registration payment_status AND advance status to awaiting_form immediately
  const { error: regUpdateError } = await supabase
    .from("registrations")
    .update({
      payment_status: "payment_submitted",
      status: "awaiting_form",
      updated_at: new Date().toISOString(),
    })
    .eq("id", registration.id);

  if (regUpdateError) {
    return new Response(
      JSON.stringify({ error: "Gagal memperbarui status pendaftaran." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 12. Append audit event
  try {
    await supabase.from("audit_events").insert({
      actor_type: "applicant",
      action: "payment_proof_submitted",
      entity_type: "registration",
      entity_id: registration.id,
      metadata: {
        registration_number: registration.registration_number,
        proof_file_path: storagePath,
        file_size: fileBytes.length,
        mime_type: detected.mime,
      },
    });
  } catch {
    // Audit logging is best-effort
  }

  const responseBody: SubmitPaymentProofResponse = {
    success: true,
    status: "payment_submitted",
    registration_status: "awaiting_form",
    message: "Bukti pembayaran berhasil diunggah. Anda sekarang dapat langsung mengisi formulir pendaftaran.",
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve((req: Request) => handleSubmitPaymentProof(req));
}
