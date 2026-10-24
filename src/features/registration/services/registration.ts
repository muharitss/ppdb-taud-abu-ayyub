import { supabase } from "@/lib/supabase/client";
import type { CreateRegistrationRequest, CreateRegistrationResponse } from "../types";

export async function createRegistration(
  payload: CreateRegistrationRequest
): Promise<CreateRegistrationResponse> {
  const { data, error } = await supabase.rpc(
    "fn_create_registration",
    {
      p_child_name: payload.child_name,
      p_parent_name: payload.parent_name,
      p_whatsapp_number: payload.whatsapp_number,
    }
  );

  if (error) {
    throw new Error(error.message || "Gagal membuat pendaftaran");
  }

  const res = data as unknown as CreateRegistrationResponse;
  if (!res || !res.registration_number || !res.access_code) {
    throw new Error("Respon server tidak valid");
  }

  return res;
}
