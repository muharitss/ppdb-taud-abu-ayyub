import { supabase } from "@/lib/supabase/client";
import type { ReviewPaymentParams, ReviewPaymentResult } from "../types";

export async function reviewPayment({
  payment_id,
  approved,
  review_notes,
}: ReviewPaymentParams): Promise<ReviewPaymentResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("fn_review_payment", {
    p_payment_id: payment_id,
    p_approved: approved,
    p_admin_id: user?.id,
    p_review_notes: review_notes?.trim() || null,
  });

  const res = data as unknown as ReviewPaymentResult | null;
  if (error) {
    throw new Error(error.message || "Gagal memproses review pembayaran");
  }

  if (!res?.success) {
    throw new Error("Respon server tidak valid saat meninjau pembayaran");
  }

  return res;
}
