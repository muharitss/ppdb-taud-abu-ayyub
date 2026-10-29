import { supabase } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { CreateRegistrationRequest, CreateRegistrationResponse } from "../types";

export async function createRegistration(
  payload: CreateRegistrationRequest
): Promise<CreateRegistrationResponse> {
  // 1. Upload bukti pembayaran ke Cloudinary terlebih dahulu.
  // Jika upload gagal, nomor pendaftaran TIDAK AKAN dibuat di database.
  const uploadRes = await uploadToCloudinary(payload.file, "ppdb-taud/bukti-bayar");

  // 2. Buat pendaftaran + catat bukti pembayaran secara atomic dalam 1 transaksi RPC
  const { data, error } = await supabase.rpc("fn_create_registration", {
    p_child_name: payload.child_name,
    p_parent_name: "Wali Murid",
    p_whatsapp_number: payload.whatsapp_number,
    p_proof_url: uploadRes.secure_url,
  });

  if (error) {
    throw new Error(error.message || "Gagal membuat pendaftaran");
  }

  const res = data as unknown as CreateRegistrationResponse;
  if (!res || !res.registration_number || !res.access_code) {
    throw new Error("Respon server tidak valid");
  }

  return res;
}
