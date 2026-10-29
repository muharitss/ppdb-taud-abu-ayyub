const envMeta =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : (typeof globalThis !== "undefined" &&
       (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env) ||
      {};

const supabaseUrl = (envMeta.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey =
  (envMeta.VITE_SUPABASE_ANON_KEY as string) ||
  (envMeta.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  "";

const cloudinaryCloudName =
  (envMeta.VITE_CLOUDINARY_CLOUD_NAME as string) || "screenshottugas";
const cloudinaryUploadPreset =
  (envMeta.VITE_CLOUDINARY_UPLOAD_PRESET as string) || "ppdb_taud_unsigned";

if (envMeta.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[PPDB] Supabase environment variables missing. Please check .env.local (see .env.example).'
  );
}

export const env = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  supabaseUrl,
  supabaseAnonKey,
  CLOUDINARY_CLOUD_NAME: cloudinaryCloudName,
  CLOUDINARY_UPLOAD_PRESET: cloudinaryUploadPreset,
} as const;

export default env;
