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
    let message = error.message || "Gagal membuat pendaftaran";
    try {
      // Extract specific error message from Edge Function response body if available
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error && typeof body.error === "string") {
          message = body.error;
        }
      }
    } catch {
      // Ignore body parsing failure, use default error message
    }
    throw new Error(message);
  }

  if (!data || !data.registration_number || !data.access_code) {
    throw new Error("Respon server tidak valid");
  }

  return data;
}
