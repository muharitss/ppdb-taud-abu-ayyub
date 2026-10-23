import { supabase } from "@/lib/supabase/client";
import type {
  BankAccountInfo,
  SubmitPaymentProofParams,
  SubmitPaymentProofResponse,
} from "../types";

export const DEFAULT_BANK_INFO: BankAccountInfo = {
  bankName: "Bank Syariah Indonesia (BSI)",
  accountNumber: "7216959997",
  accountHolder: "TAUD SaQu Abu Ayyub",
  amount: 300000,
};

export async function submitPaymentProof({
  registrationNumber,
  accessCode,
  file,
}: SubmitPaymentProofParams): Promise<SubmitPaymentProofResponse> {
  const formData = new FormData();
  formData.append("registration_number", registrationNumber.trim().toUpperCase());
  formData.append("access_code", accessCode.trim().toUpperCase());
  formData.append("file", file);

  const { data, error } = await supabase.functions.invoke<SubmitPaymentProofResponse>(
    "submit-payment-proof",
    { body: formData }
  );

  if (error) {
    let message = error.message || "Gagal mengunggah bukti pembayaran";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error && typeof body.error === "string") {
          message = body.error;
        }
      }
    } catch {
      // Ignore body parse errors and keep fallback message
    }
    throw new Error(message);
  }

  if (!data || !data.success) {
    throw new Error("Respon server tidak valid");
  }

  return data;
}
