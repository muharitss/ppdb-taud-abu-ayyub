import { supabase } from "@/lib/supabase/client";
import type { CreateRegistrationRequest, CreateRegistrationResponse } from "../types";

export async function createRegistration(
  payload: CreateRegistrationRequest
): Promise<CreateRegistrationResponse> {
  const { data, error } = await supabase.functions.invoke<CreateRegistrationResponse>(
    "create-registration",
    { body: payload }
  );

  if (error) {
    throw new Error(error.message || "Gagal membuat pendaftaran");
  }

  if (!data || !data.registration_number || !data.access_code) {
    throw new Error("Respon server tidak valid");
  }

  return data;
}
