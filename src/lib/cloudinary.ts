import { env } from "@/lib/env";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];

/**
 * Memvalidasi tipe dan ukuran berkas sebelum diunggah ke Cloudinary.
 * Tetap mengecek ekstensi berkas apabila kamera ponsel mengirimkan MIME type kosong.
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Ukuran berkas melebihi batas maksimal 5MB" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const mimeValid = ALLOWED_MIME.includes(file.type);
  const extValid = ALLOWED_EXTENSIONS.includes(ext);

  if (!mimeValid && !extValid) {
    return {
      valid: false,
      error: "Format berkas tidak didukung. Harap unggah foto JPEG, PNG, atau dokumen PDF.",
    };
  }

  return { valid: true };
}

/**
 * Mengunggah berkas ke Cloudinary menggunakan Unsigned Upload Preset.
 * Mengembalikan URL HTTPS permanen (secure_url).
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "ppdb-taud"
): Promise<{ secure_url: string; public_id: string; format: string }> {
  const check = validateUploadFile(file);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Konfigurasi Cloudinary (Cloud Name / Upload Preset) belum lengkap");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Gagal mengunggah berkas ke Cloudinary");
  }

  return {
    secure_url: data.secure_url as string,
    public_id: data.public_id as string,
    format: data.format as string,
  };
}
