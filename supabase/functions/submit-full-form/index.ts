import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Type definition for Deno runtime in Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const OPAQUE_ERROR_MESSAGE =
  "Nomor pendaftaran atau kode akses tidak sesuai";
const DUMMY_HASH =
  "$2a$10$e8k6m78Xz77J3/7Kqg/dLeX.Q.r9Kz8G3gXlqgD9n/2XyU5e7F9yK";

// Form Validation Schemas
export const NIK_REGEX = /^\d{16}$/;
export const WHATSAPP_REGEX = /^(\+?62|0)8[1-9][0-9]{6,10}$/;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const childSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap calon siswa minimal 2 karakter"),
  nickname: z.string().trim().min(1, "Nama panggilan calon siswa wajib diisi"),
  nik: z
    .string()
    .trim()
    .regex(NIK_REGEX, "NIK siswa harus terdiri dari 16 digit angka"),
  birth_place: z
    .string()
    .trim()
    .min(2, "Tempat lahir siswa minimal 2 karakter"),
  birth_date: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Format tanggal lahir siswa harus YYYY-MM-DD"),
  gender: z.enum(["laki_laki", "perempuan"]),
  child_order: z.coerce.number().int().min(1, "Urutan anak minimal 1"),
  sibling_count: z.coerce
    .number()
    .int()
    .min(0, "Jumlah saudara kandung minimal 0"),
  address: z.string().trim().min(5, "Alamat siswa minimal 5 karakter"),
  program: z.enum(["1_tahun", "2_tahun"]),
});

const parentBaseSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama lengkap orang tua minimal 2 karakter"),
  nik: z
    .string()
    .trim()
    .regex(NIK_REGEX, "NIK harus terdiri dari 16 digit angka"),
  birth_place: z.string().trim().min(2, "Tempat lahir minimal 2 karakter"),
  birth_date: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, "Format tanggal lahir harus YYYY-MM-DD"),
  last_education: z.string().trim().min(1, "Pendidikan terakhir wajib diisi"),
  occupation: z.string().trim().min(1, "Pekerjaan wajib diisi"),
  monthly_income: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().optional(),
  ),
  whatsapp_number: z
    .string()
    .trim()
    .regex(WHATSAPP_REGEX, "Nomor WhatsApp tidak valid"),
  address: z.string().trim().min(5, "Alamat minimal 5 karakter"),
});

const healthSchema = z.object({
  weight_kg: z.coerce.number().positive("Berat badan harus lebih dari 0 kg"),
  height_cm: z.coerce.number().positive("Tinggi badan harus lebih dari 0 cm"),
  blood_type: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.enum(["A", "B", "AB", "O", "tidak_diketahui"]).optional(),
  ),
  allergy_history: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().optional(),
  ),
  disease_history: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().optional(),
  ),
});

export const fullRegistrationSchema = z.object({
  child: childSchema,
  father: parentBaseSchema,
  mother: parentBaseSchema,
  health: healthSchema,
});

export interface SubmitFullFormRequest {
  action: "get" | "save_draft" | "submit";
  registration_number: string;
  access_code: string;
  form_data?: Record<string, unknown>;
}

export async function handleSubmitFullForm(
  req: Request,
  injectedSupabase?: SupabaseClient,
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

  let body: SubmitFullFormRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Format request JSON tidak valid" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { action = "get", registration_number, access_code, form_data } = body;

  if (
    typeof registration_number !== "string" ||
    !registration_number.trim() ||
    typeof access_code !== "string" ||
    !access_code.trim()
  ) {
    return new Response(
      JSON.stringify({ error: "Nomor pendaftaran dan kode akses wajib diisi" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const normalizedReg = registration_number.trim().toUpperCase();
  const normalizedCode = access_code.trim().toUpperCase();

  let supabase: SupabaseClient;
  if (injectedSupabase) {
    supabase = injectedSupabase;
  } else {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // Look up registration
  const { data: registration } = await supabase
    .from("registrations")
    .select("id, registration_number, status, payment_status, submitted_at")
    .eq("registration_number", normalizedReg)
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

  const isValid = await bcrypt.compare(
    normalizedCode,
    accessRecord.access_code_hash,
  );
  if (!isValid) {
    return new Response(JSON.stringify({ error: OPAQUE_ERROR_MESSAGE }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Handle action: "get"
  if (action === "get") {
    const { data: formDataRecord } = await supabase
      .from("registration_form_data")
      .select("form_data, updated_at")
      .eq("registration_id", registration.id)
      .maybeSingle();

    const { data: docs } = await supabase
      .from("registration_documents")
      .select("document_type, file_path, uploaded_at")
      .eq("registration_id", registration.id);

    return new Response(
      JSON.stringify({
        registration_number: registration.registration_number,
        status: registration.status,
        payment_status: registration.payment_status,
        submitted_at: registration.submitted_at,
        form_data: formDataRecord?.form_data || {},
        documents: docs || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // For write actions (save_draft and submit), check permissions
  if (
    registration.status === "submitted" ||
    registration.status === "under_review" ||
    registration.status === "accepted" ||
    registration.status === "rejected"
  ) {
    return new Response(
      JSON.stringify({
        error: "Formulir pendaftaran telah dikirim dan tidak dapat diubah.",
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (
    registration.payment_status !== "payment_submitted" &&
    registration.payment_status !== "payment_verified"
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Bukti pembayaran belum diunggah. Silakan unggah bukti pembayaran terlebih dahulu.",
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (
    registration.status !== "awaiting_form" &&
    registration.status !== "awaiting_payment"
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Status pendaftaran saat ini tidak mengizinkan pengisian formulir.",
      }),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Action: "save_draft"
  if (action === "save_draft") {
    const safeData =
      form_data && typeof form_data === "object" ? form_data : {};
    const { error: upsertErr } = await supabase
      .from("registration_form_data")
      .upsert(
        {
          registration_id: registration.id,
          form_data: safeData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "registration_id" },
      );

    if (upsertErr) {
      return new Response(
        JSON.stringify({ error: "Gagal menyimpan draf formulir ke database." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Draf berhasil disimpan" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Action: "submit"
  if (action === "submit") {
    // 1. Validate full form fields
    const parsed = fullRegistrationSchema.safeParse(form_data);
    if (!parsed.success) {
      const firstIssue =
        parsed.error.issues[0]?.message ||
        "Data formulir tidak lengkap atau tidak valid";
      return new Response(
        JSON.stringify({
          error: firstIssue,
          details: parsed.error.format(),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Validate required documents uploaded (Kartu Keluarga & Akte Kelahiran)
    const { data: uploadedDocs } = await supabase
      .from("registration_documents")
      .select("document_type")
      .eq("registration_id", registration.id);

    const docTypes = new Set(uploadedDocs?.map((d) => d.document_type) || []);
    const requiredTypes = ["kartu_keluarga", "akte_kelahiran"];
    const missingDocs = requiredTypes.filter((t) => !docTypes.has(t));

    if (missingDocs.length > 0) {
      return new Response(
        JSON.stringify({
          error:
            "Dokumen persyaratan belum lengkap (wajib mengunggah Kartu Keluarga dan Akte Kelahiran).",
          missing_documents: missingDocs,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Upsert validated form data
    const nowIso = new Date().toISOString();
    const { error: saveErr } = await supabase
      .from("registration_form_data")
      .upsert(
        {
          registration_id: registration.id,
          form_data: parsed.data,
          updated_at: nowIso,
        },
        { onConflict: "registration_id" },
      );

    if (saveErr) {
      return new Response(
        JSON.stringify({ error: "Gagal menyimpan data formulir pendaftaran." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 4. Update registration status to submitted
    const { error: updateErr } = await supabase
      .from("registrations")
      .update({
        status: "submitted",
        submitted_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", registration.id);

    if (updateErr) {
      return new Response(
        JSON.stringify({
          error: "Gagal memperbarui status pendaftaran ke submitted.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 5. Audit event
    try {
      await supabase.from("audit_events").insert({
        actor_type: "applicant",
        action: "full_form_submitted",
        entity_type: "registration",
        entity_id: registration.id,
        metadata: {
          registration_number: registration.registration_number,
          submitted_at: nowIso,
        },
      });
    } catch {
      // Best-effort audit logging
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: "submitted",
        submitted_at: nowIso,
        message: "Formulir pendaftaran dan dokumen berhasil dikirim.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ error: "Aksi tidak dikenali" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve((req) => handleSubmitFullForm(req));
}
