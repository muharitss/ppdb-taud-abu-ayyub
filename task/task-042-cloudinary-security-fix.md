# Task 042 — Perbaikan Keamanan Cloudinary (Hapus API Secret dari Frontend & Gunakan Unsigned Upload Preset)

## Status
NOT_STARTED

## Priority
P0 (Kritis — Keamanan)

## Dependencies
- Task 041 — Combined Registration & Payment Flow

## Objective
Menghapus **Cloudinary API Secret** yang saat ini tertulis langsung (*hardcoded*) di kode frontend (`src/lib/env.ts` dan `src/lib/cloudinary.ts`), lalu mengganti mekanisme upload dari **Signed Upload di Browser** menjadi **Unsigned Upload Preset** yang aman untuk frontend.

---

## Context & Penjelasan Masalah (Untuk Junior Developer)
Saat ini, file `src/lib/env.ts` menyimpan nilai `CLOUDINARY_API_SECRET` (`'8sBjvAP9Ql3d31T2TxoKtxjVFWk'`) dan mengeksposnya ke browser melalui variabel `VITE_CLOUDINARY_API_SECRET`. Kemudian file `src/lib/cloudinary.ts` menggunakan secret tersebut di fungsi `generateSignature()` untuk membuat tanda tangan digital (*SHA-1 signature*) di sisi browser pengguna.

**Mengapa ini sangat berbahaya?**
1. Semua kode di dalam folder `src/` dan semua variabel yang diawali `VITE_` akan digabungkan (*bundled*) oleh Vite dan dikirim ke browser setiap pengunjung website.
2. Siapa pun yang membuka **Browser DevTools (Inspect Element -> Sources / Network)** atau membaca repositori Git dapat melihat `CLOUDINARY_API_SECRET` tersebut.
3. Dengan `API Secret`, pihak tidak bertanggung jawab memiliki akses penuh ke akun Cloudinary sekolah: mereka bisa **menghapus seluruh foto Kartu Keluarga, Akte Kelahiran, dan bukti transfer**, atau mengunggah ribuan file sampah hingga kuota Cloudinary habis.

**Bagaimana solusi yang benar dan paling sederhana?**
Cloudinary menyediakan fitur resmi bernama **Unsigned Upload Preset** khusus untuk aplikasi frontend (tanpa perlu server backend tambahan):
1. Di Dashboard Cloudinary, pemilik akun merotasi (*regenerate*) API Secret lama dan membuat satu **Unsigned Upload Preset** (misalnya bernama `ppdb_taud_unsigned`) yang dibatasi hanya menerima format `jpg, jpeg, png, pdf` dengan ukuran maksimal `5 MB`.
2. Di kode frontend (`src/lib/env.ts` dan `src/lib/cloudinary.ts`), kita **menghapus** `CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY`, dan fungsi `generateSignature()`.
3. Saat mengunggah file ke `https://api.cloudinary.com/v1_1/<cloud_name>/auto/upload`, kita cukup mengirimkan `file`, `upload_preset`, dan `folder` di dalam `FormData`.

---

## Scope (Daftar Pekerjaan)
1. **Update `.env.example`**:
   - Hapus `VITE_CLOUDINARY_API_KEY` dan `VITE_CLOUDINARY_API_SECRET` jika ada, lalu tambahkan `VITE_CLOUDINARY_CLOUD_NAME` dan `VITE_CLOUDINARY_UPLOAD_PRESET`.
2. **Update `src/lib/env.ts`**:
   - Hapus variabel `cloudinaryApiKey` dan `cloudinaryApiSecret` beserta nilai fallback rahasianya.
   - Tambahkan `cloudinaryUploadPreset` yang membaca `import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET` dengan fallback default `'ppdb_taud_unsigned'`.
3. **Update `src/lib/cloudinary.ts`**:
   - Hapus fungsi `generateSignature()`.
   - Ubah fungsi `uploadToCloudinary()` agar menggunakan `upload_preset` (`env.CLOUDINARY_UPLOAD_PRESET`), bukan `api_key` + `timestamp` + `signature`.

## Out of Scope
- Mengubah alur penyimpanan URL di database PostgreSQL (tetap menyimpan `secure_url` seperti sebelumnya).
- Mengubah komponen UI upload file (`PaymentProofUpload.tsx` atau `FullFormWizard.tsx`).

---

## Step-by-Step Implementation Guide (Panduan Langkah demi Langkah)

### Langkah 1: Konfigurasi di Dashboard Cloudinary (Dilakukan oleh Admin / Pemilik Akun)
> **Catatan untuk AI Agent / Developer:** Langkah 1 ini dilakukan di web Cloudinary. Anda tetap harus mengerjakan Langkah 2, 3, dan 4 pada kode proyek.
1. Login ke [Cloudinary Console](https://console.cloudinary.com/).
2. Buka **Settings (ikon roda gigi) -> Access Keys**, lalu **Generate New Pair** dan hapus/nonaktifkan API Key & Secret lama (`8sBjvAP9Ql3d31T2TxoKtxjVFWk`).
3. Buka **Settings -> Upload -> Upload Presets**, lalu klik **Add Upload Preset**:
   - **Upload preset name:** `ppdb_taud_unsigned`
   - **Signing Mode:** Pilih **Unsigned**
   - **Folder:** `ppdb-taud`
   - **Allowed formats (di bagian Upload Manipulations / Media Analysis):** `jpg, jpeg, png, pdf`
   - Klik **Save**.

---

### Langkah 2: Edit file `.env.example`
Buka file `.env.example` dan pastikan bagian konfigurasi Cloudinary hanya berisi `VITE_CLOUDINARY_CLOUD_NAME` dan `VITE_CLOUDINARY_UPLOAD_PRESET` (tanpa API Secret):

```env
# Konfigurasi Cloudinary (Unsigned Upload untuk Frontend)
VITE_CLOUDINARY_CLOUD_NAME="screenshottugas"
VITE_CLOUDINARY_UPLOAD_PRESET="ppdb_taud_unsigned"
```

---

### Langkah 3: Edit file `src/lib/env.ts`
Ganti seluruh isi file `src/lib/env.ts` dengan kode berikut (perhatikan bahwa `CLOUDINARY_API_KEY` dan `CLOUDINARY_API_SECRET` sudah dihapus sepenuhnya):

```typescript
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
```

---

### Langkah 4: Edit file `src/lib/cloudinary.ts`
Ganti seluruh isi file `src/lib/cloudinary.ts` dengan kode berikut. Kita menghapus fungsi `generateSignature` dan mengirimkan `upload_preset` ke endpoint Cloudinary:

```typescript
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
```

---

## Files Expected to Change
- `.env.example`
- `src/lib/env.ts`
- `src/lib/cloudinary.ts`

## Acceptance Criteria
- [ ] Tidak ada lagi string `8sBjvAP9Ql3d31T2TxoKtxjVFWk` atau `CLOUDINARY_API_SECRET` di seluruh file dalam folder `src/`.
- [ ] Fungsi `generateSignature` di `src/lib/cloudinary.ts` sudah dihapus.
- [ ] Fungsi `uploadToCloudinary` menggunakan `upload_preset` dari `env.CLOUDINARY_UPLOAD_PRESET`.
- [ ] `npx tsc -b --noEmit`, `npm run lint`, dan `npm run build` berjalan sukses dengan 0 error.

## Verification Commands
Jalankan perintah berikut di terminal untuk memastikan tidak ada error kompilasi maupun kebocoran secret:
```bash
npx tsc -b --noEmit
npm run lint
npm run build
```
