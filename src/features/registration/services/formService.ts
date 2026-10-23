import { supabase } from "@/lib/supabase/client";
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
  const { data, error } = await supabase.functions.invoke<FormGetResult>(
    "submit-full-form",
    {
      body: {
        action: "get",
        registration_number: registrationNumber.trim().toUpperCase(),
        access_code: accessCode.trim().toUpperCase(),
      },
    }
  );

  if (error) {
    let msg = error.message || "Gagal mengambil data formulir";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      }
    } catch {
      // ignore JSON parse
    }
    throw new Error(msg);
  }

  if (!data) {
    throw new Error("Respon server tidak valid");
  }

  return data;
}

export async function saveFormDraft(
  registrationNumber: string,
  accessCode: string,
  formData: Partial<RegistrationFormData>
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.functions.invoke<{ success: boolean; message: string }>(
    "submit-full-form",
    {
      body: {
        action: "save_draft",
        registration_number: registrationNumber.trim().toUpperCase(),
        access_code: accessCode.trim().toUpperCase(),
        form_data: formData,
      },
    }
  );

  if (error) {
    let msg = error.message || "Gagal menyimpan draf";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return data || { success: true, message: "Draf berhasil disimpan" };
}

export async function submitFullForm(
  registrationNumber: string,
  accessCode: string,
  formData: RegistrationFormData
): Promise<{ success: boolean; status: string; message: string }> {
  const { data, error } = await supabase.functions.invoke<{
    success: boolean;
    status: string;
    message: string;
  }>("submit-full-form", {
    body: {
      action: "submit",
      registration_number: registrationNumber.trim().toUpperCase(),
      access_code: accessCode.trim().toUpperCase(),
      form_data: formData,
    },
  });

  if (error) {
    let msg = error.message || "Gagal mengirim formulir pendaftaran";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return data || { success: true, status: "submitted", message: "Formulir pendaftaran berhasil dikirim" };
}

export async function uploadRegistrationDocument(
  registrationNumber: string,
  accessCode: string,
  documentType: "kartu_keluarga" | "akte_kelahiran" | "pas_foto",
  file: File
): Promise<{ success: boolean; file_path: string; message: string }> {
  const formData = new FormData();
  formData.append("registration_number", registrationNumber.trim().toUpperCase());
  formData.append("access_code", accessCode.trim().toUpperCase());
  formData.append("document_type", documentType);
  formData.append("file", file);

  const { data, error } = await supabase.functions.invoke<{
    success: boolean;
    document_type: string;
    file_path: string;
    message: string;
  }>("document-upload", {
    body: formData,
  });

  if (error) {
    let msg = error.message || "Gagal mengunggah dokumen";
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) msg = body.error;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (!data || !data.success) {
    throw new Error("Respon server tidak valid");
  }

  return data;
}
