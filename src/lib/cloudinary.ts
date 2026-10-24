import { env } from "@/lib/env";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];

/**
 * Validates file type and size before upload.
 * Falls back to extension check when mobile cameras return empty or generic mime types.
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
 * Generates SHA-1 signature for Cloudinary signed upload using browser Web Crypto API.
 */
async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedStr =
    Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&") + apiSecret;

  const buffer = new TextEncoder().encode(sortedStr);
  const hash = await crypto.subtle.digest("SHA-1", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Uploads a file directly to Cloudinary using signed authentication.
 * Returns the permanent HTTPS secure_url.
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
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Konfigurasi Cloudinary tidak lengkap di server/klien");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await generateSignature({ folder, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

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
