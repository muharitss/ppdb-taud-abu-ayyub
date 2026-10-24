import { supabase } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { SCHOOL_BANK_INFO } from "@/config/schoolInfo";
import type {
  BankAccountInfo,
  SubmitPaymentProofParams,
  SubmitPaymentProofResponse,
} from "../types";

export const DEFAULT_BANK_INFO: BankAccountInfo = SCHOOL_BANK_INFO;

export async function submitPaymentProof({
  registrationNumber,
  accessCode,
  file,
}: SubmitPaymentProofParams): Promise<SubmitPaymentProofResponse> {
  const normReg = registrationNumber.trim().toUpperCase();
  const normCode = accessCode.trim().toUpperCase();

  // 1. Upload proof photo directly to Cloudinary
  const uploadRes = await uploadToCloudinary(file, "ppdb-taud/bukti-bayar");

  // 2. Record payment submission atomically in DB
  const { data, error } = await supabase.rpc(
    "fn_submit_payment_proof",
    {
      p_registration_number: normReg,
      p_access_code: normCode,
      p_proof_url: uploadRes.secure_url,
    }
  );

  const res = data as unknown as SubmitPaymentProofResponse | null;
  if (error || !res || res.success === false) {
    throw new Error(error?.message || "Gagal mencatat bukti pembayaran");
  }

  return res;
}
