import { supabase } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { RegistrationFormData } from "../schemas/formSchema";

export interface FormGetResult {
  registration_number: string;
  status: string;
  payment_status: string;
  submitted_at: string | null;
  form_data: Partial<RegistrationFormData>;
  documents: Array<{
    document_type: string;
    file_path: string;
    uploaded_at?: string;
  }>;
}

export async function fetchFormDetails(
  registrationNumber: string,
  accessCode: string
): Promise<FormGetResult> {
  const normReg = registrationNumber.trim().toUpperCase();
  const normCode = accessCode.trim().toUpperCase();

  const { data, error } = await supabase.rpc(
    "fn_get_registration_full_form",
    {
      p_registration_number: normReg,
      p_access_code: normCode,
    }
  );

  const res = data as unknown as FormGetResult | null;
  if (error || !res) {
    throw new Error(error?.message || "Gagal mengambil data formulir");
  }

  return res;
}

export async function saveFormDraft(
  registrationNumber: string,
  accessCode: string,
  formData: Partial<RegistrationFormData>
): Promise<{ success: boolean; message: string }> {
  const normReg = registrationNumber.trim().toUpperCase();
  const normCode = accessCode.trim().toUpperCase();

  const { data, error } = await supabase.rpc(
    "fn_save_registration_draft",
    {
      p_registration_number: normReg,
      p_access_code: normCode,
      p_form_data: formData,
    }
  );

  const res = data as unknown as { success: boolean; message: string } | null;
  if (error || !res || res.success === false) {
    throw new Error(error?.message || "Gagal menyimpan draf");
  }

  return res;
}

export async function submitFullForm(
  registrationNumber: string,
  accessCode: string,
  formData: RegistrationFormData
): Promise<{ success: boolean; status: string; message: string }> {
  const normReg = registrationNumber.trim().toUpperCase();
  const normCode = accessCode.trim().toUpperCase();

  const { data, error } = await supabase.rpc("fn_submit_registration_final", {
    p_registration_number: normReg,
    p_access_code: normCode,
    p_form_data: formData,
  });

  const res = data as unknown as {
    success: boolean;
    status: string;
    message: string;
  } | null;

  if (error || !res || res.success === false) {
    throw new Error(error?.message || "Gagal mengirim formulir pendaftaran");
  }

  return res;
}

export async function uploadRegistrationDocument(
  registrationNumber: string,
  accessCode: string,
  documentType: "kartu_keluarga" | "akte_kelahiran",
  file: File
): Promise<{ success: boolean; file_path: string; message: string }> {
  const normReg = registrationNumber.trim().toUpperCase();
  const normCode = accessCode.trim().toUpperCase();

  // 1. Upload file directly to Cloudinary
  const uploadRes = await uploadToCloudinary(file, "ppdb-taud/dokumen");

  // 2. Upsert document record in DB
  const { data, error } = await supabase.rpc("fn_upload_registration_document", {
    p_registration_number: normReg,
    p_access_code: normCode,
    p_document_type: documentType,
    p_file_url: uploadRes.secure_url,
  });

  const res = data as unknown as {
    success: boolean;
    document_type: string;
    file_path: string;
    message: string;
  } | null;

  if (error || !res || res.success === false) {
    throw new Error(error?.message || "Gagal mencatat dokumen di server");
  }

  return {
    success: res.success,
    file_path: res.file_path,
    message: res.message,
  };
}
