import { supabase } from "@/lib/supabase/client";
import type { VerifyAccessRequest, VerifyAccessResponse } from "../types";

export async function verifyRegistrationAccess(
  payload: VerifyAccessRequest
): Promise<VerifyAccessResponse> {
  const { data, error } = await supabase.functions.invoke<VerifyAccessResponse>(
    "verify-registration-access",
    { body: payload }
  );

  if (error) {
    throw new Error(error.message || "Gagal memverifikasi status pendaftaran");
  }

  if (!data || !data.registration_number || !data.registration_status) {
    throw new Error("Respon server tidak valid");
  }

  return data;
}
