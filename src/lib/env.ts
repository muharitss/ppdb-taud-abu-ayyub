const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  '';

const cloudinaryCloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || 'screenshottugas';
const cloudinaryUploadPreset =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || 'ppdb_taud_unsigned';

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
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
