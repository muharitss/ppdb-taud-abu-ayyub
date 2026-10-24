const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  '';

const cloudinaryCloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || 'screenshottugas';
const cloudinaryApiKey = (import.meta.env.VITE_CLOUDINARY_API_KEY as string) || '133461677346484';
const cloudinaryApiSecret = (import.meta.env.VITE_CLOUDINARY_API_SECRET as string) || '8sBjvAP9Ql3d31T2TxoKtxjVFWk';

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
  CLOUDINARY_API_KEY: cloudinaryApiKey,
  CLOUDINARY_API_SECRET: cloudinaryApiSecret,
} as const;

export default env;
