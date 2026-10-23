import { supabase } from "@/lib/supabase/client";
import type {
  RegistrantPaymentItem,
  RegistrantDetail,
  ReviewPaymentParams,
  ReviewPaymentResult,
} from "../types";

export async function getPendingPayments(): Promise<RegistrantPaymentItem[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select(`
      id,
      registration_number,
      child_name,
      parent_name,
      whatsapp_number,
      status,
      payment_status,
      created_at,
      payments (
        id,
        proof_file_path,
        uploaded_at,
        status,
        review_notes
      )
    `)
    .eq("payment_status", "payment_submitted")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal mengambil daftar antrean pembayaran: " + error.message);
  }

  return (data || []) as unknown as RegistrantPaymentItem[];
}

export async function getRegistrantDetail(id: string): Promise<RegistrantDetail> {
  const { data, error } = await supabase
    .from("registrations")
    .select(`
      id,
      registration_number,
      child_name,
      parent_name,
      whatsapp_number,
      status,
      payment_status,
      review_notes,
      created_at,
      ppdb_period,
      payments (
        id,
        proof_file_path,
        uploaded_at,
        reviewed_at,
        reviewed_by,
        review_notes,
        status
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("Data pendaftar tidak ditemukan: " + (error?.message || ""));
  }

  return data as unknown as RegistrantDetail;
}

export async function createPaymentProofSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(filePath, 3600);

  if (error || !data?.signedUrl) {
    throw new Error("Gagal membuat tautan berkas bukti transfer: " + (error?.message || ""));
  }

  return data.signedUrl;
}

export async function reviewPayment({
  payment_id,
  approved,
  review_notes,
}: ReviewPaymentParams): Promise<ReviewPaymentResult> {
  const { data, error } = await supabase.functions.invoke<ReviewPaymentResult>(
    "admin-review-payment",
    {
      body: {
        payment_id,
        approved,
        review_notes: review_notes?.trim() || undefined,
      },
    }
  );

  if (error) {
    let message = error.message || "Gagal memproses review pembayaran";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error && typeof body.error === "string") {
          message = body.error;
        }
      }
    } catch {
      // keep fallback message
    }
    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error("Respon server tidak valid saat meninjau pembayaran");
  }

  return data;
}
