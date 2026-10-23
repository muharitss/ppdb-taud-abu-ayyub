import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Type definition for Deno runtime in Supabase Edge Functions
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// CORS headers for admin portal integration
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AdminReviewPaymentPayload {
  payment_id: string;
  approved: boolean;
  review_notes?: string;
}

export interface AdminReviewPaymentResponse {
  success: boolean;
  new_status: "payment_verified" | "payment_rejected";
  message: string;
}

export async function handleAdminReviewPayment(
  req: Request,
  customSupabaseClient?: SupabaseClient
): Promise<Response> {
  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. Enforce POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3. Extract and validate Bearer Token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Autentikasi diperlukan. Header Authorization tidak ditemukan." }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) {
    return new Response(
      JSON.stringify({ error: "Sesi tidak valid atau telah kedaluwarsa." }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 4. Initialize Supabase Client
  let supabase: SupabaseClient;
  if (customSupabaseClient) {
    supabase = customSupabaseClient;
  } else {
    const supabaseUrl = typeof Deno !== "undefined" ? Deno.env.get("SUPABASE_URL") : "";
    const supabaseServiceRole =
      typeof Deno !== "undefined" ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") : "";

    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response(
        JSON.stringify({ error: "Konfigurasi server Supabase belum lengkap." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // 5. Verify JWT & Get User
  const { data: userData, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !userData?.user) {
    return new Response(
      JSON.stringify({ error: "Sesi administrator tidak valid atau sudah kedaluwarsa." }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const callerUser = userData.user;

  // 6. Verify Admin Role in admin_profiles
  const { data: adminProfile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id, role")
    .eq("id", callerUser.id)
    .single();

  if (profileError || !adminProfile || adminProfile.role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Akses ditolak. Anda tidak memiliki izin administrator." }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 7. Parse and Validate Request Body
  let body: Partial<AdminReviewPaymentPayload>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Format payload request JSON tidak valid." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { payment_id, approved, review_notes } = body;

  if (!payment_id || typeof payment_id !== "string" || !UUID_REGEX.test(payment_id)) {
    return new Response(
      JSON.stringify({ error: "Parameter payment_id tidak valid atau bukan format UUID." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (typeof approved !== "boolean") {
    return new Response(
      JSON.stringify({ error: "Parameter approved wajib bernilai boolean (true/false)." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const trimmedNotes = typeof review_notes === "string" ? review_notes.trim() : "";

  // Review notes are mandatory when rejecting
  if (!approved && !trimmedNotes) {
    return new Response(
      JSON.stringify({ error: "Catatan penolakan (review_notes) wajib diisi jika bukti ditolak." }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // 8. Execute atomic DB update via RPC fn_review_payment
  const { error: rpcError } = await supabase.rpc("fn_review_payment", {
    p_payment_id: payment_id,
    p_approved: approved,
    p_admin_id: callerUser.id,
    p_review_notes: trimmedNotes || null,
  });

  if (rpcError) {
    const errorMsg = rpcError.message || "";
    // Payment record not found
    if (rpcError.code === "P0002" || errorMsg.includes("Payment record not found")) {
      return new Response(
        JSON.stringify({ error: "Data pembayaran tidak ditemukan." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Invalid status transition / concurrent review
    if (rpcError.code === "P0001" || errorMsg.includes("is not in submitted status")) {
      return new Response(
        JSON.stringify({
          error: "Status pembayaran telah berubah atau sudah pernah ditinjau sebelumnya.",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Missing notes in RPC
    if (rpcError.code === "P0003" || errorMsg.includes("Review notes are required")) {
      return new Response(
        JSON.stringify({ error: "Catatan penolakan wajib diisi." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Gagal memproses peninjauan pembayaran: " + errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const newStatus: "payment_verified" | "payment_rejected" = approved
    ? "payment_verified"
    : "payment_rejected";

  const responseBody: AdminReviewPaymentResponse = {
    success: true,
    new_status: newStatus,
    message: approved
      ? "Pembayaran berhasil diverifikasi dan disetujui."
      : "Pembayaran telah ditolak dengan catatan yang diberikan.",
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve((req: Request) => handleAdminReviewPayment(req));
}
