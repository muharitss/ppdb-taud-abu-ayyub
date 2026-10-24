import { supabase } from "@/lib/supabase/client";
import type { VerifyAccessRequest, VerifyAccessResponse } from "../types";

export async function verifyRegistrationAccess(
  payload: VerifyAccessRequest
): Promise<VerifyAccessResponse> {
  const { data, error } = await supabase.rpc(
    "fn_verify_registration_access",
    {
      p_registration_number: payload.registration_number.trim().toUpperCase(),
      p_access_code: payload.access_code.trim().toUpperCase(),
    }
  );

  const res = data as Record<string, unknown> | null;
  if (error || !res || res.success === false) {
    throw new Error(
      (res?.error as string) || error?.message || "Nomor pendaftaran atau kode akses tidak valid"
    );
  }

  const status = (res.status as string) || "awaiting_payment";
  return {
    registration_number: res.registration_number as string,
    registration_status: status,
    payment_status: (res.payment_status as string) || "payment_pending",
    submitted_at: (res.submitted_at as string | null) || null,
    form_completeness: ["submitted", "under_review", "accepted", "rejected"].includes(status),
  };
}
