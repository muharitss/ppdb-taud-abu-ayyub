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
const DUMMY_HASH = "$2a$10$e8k6m78Xz77J3/7Kqg/dLeX.Q.r9Kz8G3gXlqgD9n/2XyU5e7F9yK";

export const ALLOWED_DOC_TYPES = ["kartu_keluarga", "akte_kelahiran", "pas_foto"] as const;
export type AllowedDocumentType = (typeof ALLOWED_DOC_TYPES)[number];

export interface MimeCheckResult {
  mime: "image/jpeg" | "image/png" | "application/pdf";
  ext: "jpg" | "png" | "pdf";
}

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

export interface DocumentUploadResponse {
  success: boolean;
  document_type: AllowedDocumentType;
  file_path: string;
  message: string;
}

export async function handleDocumentUpload(
  req: Request,
  injectedSupabase?: SupabaseClient
): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({ error: "Content-Type harus multipart/form-data" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  let rawRegNum: unknown;
  let rawAccessCode: unknown;
  let rawDocType: unknown;
  let fileBytes: Uint8Array | null = null;
  let clientFileSize = 0;

  try {
    const formData = await req.formData();
    rawRegNum = formData.get("registration_number");
    rawAccessCode = formData.get("access_code");
    rawDocType = formData.get("document_type");
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

  if (
    typeof rawDocType !== "string" ||
    !ALLOWED_DOC_TYPES.includes(rawDocType as AllowedDocumentType)
  ) {
    return new Response(
      JSON.stringify({
        error: `Tipe dokumen tidak valid. Pilihan yang diperbolehkan: ${ALLOWED_DOC_TYPES.join(", ")}`,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  const documentType = rawDocType as AllowedDocumentType;

  if (!fileBytes || fileBytes.length === 0) {
    return new Response(JSON.stringify({ error: "File dokumen wajib diunggah" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (clientFileSize > MAX_FILE_SIZE_BYTES || fileBytes.length > MAX_FILE_SIZE_BYTES) {
    return new Response(
      JSON.stringify({ error: "Ukuran berkas melebihi batas maksimal 5MB" }),
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

  // Look up registration
  const { data: registration } = await supabase
    .from("registrations")
    .select("id, registration_number, status, payment_status")
    .eq("registration_number", normalizedRegNum)
    .maybeSingle();

  if (!registration) {
    await bcrypt.compare(normalizedCode, DUMMY_HASH);
    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify access code
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

  // Verify status allows document upload
  if (registration.status !== "awaiting_form") {
    if (registration.payment_status !== "payment_verified") {
      return new Response(
        JSON.stringify({
          error: "Pembayaran belum diverifikasi. Formulir dan dokumen belum dapat diakses.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (registration.status === "submitted" || registration.status === "accepted" || registration.status === "rejected") {
      return new Response(
        JSON.stringify({
          error: "Formulir pendaftaran telah dikirim dan tidak dapat diubah.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Status pendaftaran saat ini tidak mengizinkan pengunggahan dokumen.",
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Check if previous document exists to remove it from storage
  const { data: existingDoc } = await supabase
    .from("registration_documents")
    .select("file_path")
    .eq("registration_id", registration.id)
    .eq("document_type", documentType)
    .maybeSingle();

  if (existingDoc?.file_path) {
    try {
      await supabase.storage.from("registration-documents").remove([existingDoc.file_path]);
    } catch {
      // Best-effort cleanup of previous file
    }
  }

  // Upload to private bucket: registration-documents
  const timestamp = Date.now();
  const storagePath = `${registration.id}/${documentType}-${timestamp}.${detected.ext}`;

  const { error: uploadError } = await supabase.storage
    .from("registration-documents")
    .upload(storagePath, fileBytes, {
      contentType: detected.mime,
      upsert: true,
    });

  if (uploadError) {
    return new Response(
      JSON.stringify({ error: "Gagal menyimpan berkas dokumen ke penyimpanan server." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Upsert into registration_documents
  const { error: upsertError } = await supabase
    .from("registration_documents")
    .upsert(
      {
        registration_id: registration.id,
        document_type: documentType,
        file_path: storagePath,
        uploaded_at: new Date().toISOString(),
      },
      { onConflict: "registration_id,document_type" }
    );

  if (upsertError) {
    return new Response(
      JSON.stringify({ error: "Gagal memperbarui catatan dokumen di database." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Audit event
  try {
    await supabase.from("audit_events").insert({
      actor_type: "applicant",
      action: "document_uploaded",
      entity_type: "registration_document",
      entity_id: registration.id,
      metadata: {
        document_type: documentType,
        file_path: storagePath,
        file_size: fileBytes.length,
      },
    });
  } catch {
    // Best-effort audit logging
  }

  const responseBody: DocumentUploadResponse = {
    success: true,
    document_type: documentType,
    file_path: storagePath,
    message: "Dokumen berhasil diunggah",
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve((req) => handleDocumentUpload(req));
}
