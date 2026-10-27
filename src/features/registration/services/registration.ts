import { supabase } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { CreateRegistrationRequest, CreateRegistrationResponse } from "../types";

export async function createRegistration(
  payload: CreateRegistrationRequest
): Promise<CreateRegistrationResponse> {
  // 1. Upload bukti pembayaran ke Cloudinary terlebih dahulu.
  // Jika upload gagal, nomor pendaftaran TIDAK AKAN dibuat di database.
  const uploadRes = await uploadToCloudinary(payload.file, "ppdb-taud/bukti-bayar");

  // 2. Buat record pendaftaran & dapatkan nomor pendaftaran + kode akses
  const { data, error } = await supabase.rpc("fn_create_registration", {
    p_child_name: payload.child_name,
    p_parent_name: "Wali Murid",
    p_whatsapp_number: payload.whatsapp_number,
  });

  if (error) {
    throw new Error(error.message || "Gagal membuat pendaftaran");
  }

  const res = data as unknown as CreateRegistrationResponse;
  if (!res || !res.registration_number || !res.access_code) {
    throw new Error("Respon server tidak valid");
  }

  // 3. Catat bukti pembayaran & ubah status pendaftaran menjadi awaiting_form
  const { data: payData, error: payError } = await supabase.rpc(
    "fn_submit_payment_proof",
    {
      p_registration_number: res.registration_number,
      p_access_code: res.access_code,
      p_proof_url: uploadRes.secure_url,
    }
  );

  const payRes = payData as { success?: boolean } | null;
  if (payError || !payRes || payRes.success === false) {
    throw new Error(payError?.message || "Gagal mencatat bukti pembayaran");
  }

  return res;
}
