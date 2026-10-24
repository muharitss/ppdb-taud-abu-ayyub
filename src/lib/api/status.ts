import { supabase } from "@/lib/supabase/client";

export interface VerifyAccessParams {
  registrationNumber: string;
  accessCode: string;
}

export interface VerifyAccessData {
  registration_number: string;
  registration_status: string;
  payment_status: string;
  submitted_at: string | null;
  form_completeness: boolean;
}

export async function verifyRegistrationAccess({
  registrationNumber,
  accessCode,
}: VerifyAccessParams): Promise<VerifyAccessData> {
  const { data, error } = await supabase.rpc(
    "fn_verify_registration_access",
    {
      p_registration_number: registrationNumber.trim().toUpperCase(),
      p_access_code: accessCode.trim().toUpperCase(),
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
