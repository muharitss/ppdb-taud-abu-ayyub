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
  const { data, error } = await supabase.functions.invoke<VerifyAccessData>(
    "verify-registration-access",
    {
      body: {
        registration_number: registrationNumber.trim().toUpperCase(),
        access_code: accessCode.trim().toUpperCase(),
      },
    }
  );

  if (error) {
    let msg = error.message || "Nomor pendaftaran atau kode akses tidak valid";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) {
        if (ctx.status === 429) {
          msg = "Terlalu banyak percobaan. Coba lagi nanti.";
        } else if (ctx.status === 401 || ctx.status === 404) {
          msg = "Nomor pendaftaran atau kode akses tidak valid";
        } else if (typeof ctx.json === "function") {
          const body = await ctx.json();
          if (body?.error) {
            msg = body.error;
          }
        }
      }
    } catch {
      // Ignore context errors
    }
    throw new Error(msg);
  }

  if (!data) {
    throw new Error("Respon server tidak valid");
  }

  return data;
}
