# Task 041 — Penggabungan Halaman Pendaftaran Awal & Pembayaran (1-Step Registration + Payment)

## Status
DONE

## Priority
P0

## Dependencies
- Task 015 — Registration UI (Initial Form)
- Task 016 — Payment Page UI
- Task 039 — Access Code Session Retention & Anti-Lockout

## Objective
Menyederhanakan alur pendaftaran awal untuk pengguna awam dengan menggabungkan **Formulir Pendaftaran Awal** dan **Halaman Pembayaran** menjadi **1 halaman tunggal** di route `/daftar`. Pengguna hanya perlu mengisi **3 input** (Nama Siswa, Nomor Handphone/WhatsApp, dan Upload Bukti Pembayaran) dan **baru mendapatkan Nomor Pendaftaran serta Kode Akses setelah bukti pembayaran berhasil diunggah**.

## Context & Hasil Analisis Sistem
Saat ini alur pendaftaran terpisah menjadi 2 halaman:
1. `/daftar` (`RegistrationStartPage.tsx`): meminta `child_name`, `parent_name`, `whatsapp_number`, lalu langsung memanggil RPC `fn_create_registration` dan menerbitkan Nomor Pendaftaran **sebelum** pengguna membayar/mengunggah bukti transfer.
2. `/bayar/:registrationNumber` (`PaymentPage.tsx`): menampilkan info rekening BSI Rp 300.000 dan mengunggah bukti pembayaran via `submitPaymentProof` (`uploadToCloudinary` + RPC `fn_submit_payment_proof`).

Masalah pada alur lama:
- Terlalu banyak langkah untuk orang tua yang awam teknologi.
- Pengguna yang hanya mengisi form awal tanpa mengunggah bukti bayar tetap mendapatkan Nomor Pendaftaran (menimbulkan data sampah berstatus `awaiting_payment` / `payment_pending` di database).

Solusi paling sederhana & minim perubahan (tanpa perlu migrasi database/RPC baru):
1. **Halaman `/daftar` (`RegistrationStartPage.tsx`) dijadikan 1 halaman gabungan** yang menampilkan informasi rekening pembayaran (Rp 300.000 ke BSI `7327913322` a.n. `TAUD SaQu Abu Ayyub`) sekaligus 3 input:
   - **Nama Lengkap Calon Siswa** (`child_name`)
   - **Nomor Handphone / WhatsApp Aktif** (`whatsapp_number`)
   - **Upload Bukti Pembayaran** (`PaymentProofUpload`)
2. **Urutan Eksekusi Saat Submit (Anti Nomor Pendaftaran Tanpa Bukti Bayar)**:
   - Langkah 1: Validasi `child_name`, `whatsapp_number`, dan pastikan file bukti pembayaran sudah dipilih (`selectedFile !== null`).
   - Langkah 2: Upload file bukti pembayaran ke Cloudinary terlebih dahulu (`uploadToCloudinary(file, "ppdb-taud/bukti-bayar")`). **Jika gagal atau belum ada file, proses langsung berhenti dan tidak menyentuh database sama sekali.**
   - Langkah 3: Panggil RPC `fn_create_registration` (untuk `p_parent_name` kirim nilai default `"Wali Murid"` agar lolos validasi `length >= 2` di RPC PostgreSQL yang sudah ada tanpa perlu migrasi database).
   - Langkah 4: Langsung panggil RPC `fn_submit_payment_proof` menggunakan `registration_number`, `access_code` dari Langkah 3 dan `secure_url` dari Langkah 2. Status pendaftaran otomatis menjadi `awaiting_form` dan `payment_status` menjadi `payment_submitted`.
   - Langkah 5: Simpan sesi ke `localStorage`/`sessionStorage` via `saveSessionCredentials(..., "payment_submitted")` dan arahkan pengguna langsung ke `/daftar/formulir/:registrationNumber` (di mana Nomor Pendaftaran & Kode Akses ditampilkan pada banner atas formulir lengkap).

---

## Scope (Daftar Pekerjaan)
1. **Update Zod Schema Pendaftaran Awal** di `src/features/registration/schemas/initial-registration.schema.ts`:
   - Hapus field `parent_name` dari `initialRegistrationSchema` sehingga hanya memvalidasi `child_name` dan `whatsapp_number`.
2. **Update Tipe Request & Service Pendaftaran** di `src/features/registration/types/index.ts` dan `src/features/registration/services/registration.ts`:
   - Tambahkan `file: File` pada parameter `createRegistration` (atau `CreateRegistrationRequest`).
   - Di dalam `createRegistration`:
     1. Panggil `uploadToCloudinary(payload.file, "ppdb-taud/bukti-bayar")` terlebih dahulu.
     2. Panggil `supabase.rpc("fn_create_registration", { p_child_name: payload.child_name, p_parent_name: "Wali Murid", p_whatsapp_number: payload.whatsapp_number })`.
     3. Panggil `supabase.rpc("fn_submit_payment_proof", { p_registration_number: res.registration_number, p_access_code: res.access_code, p_proof_url: uploadRes.secure_url })`.
     4. Kembalikan `res` (`registration_number`, `access_code`, `registration_id`).
3. **Gabungkan UI Payment ke `RegistrationStartPage.tsx` (`/daftar`)**:
   - Tampilkan blok informasi Biaya Pendaftaran (`Rp 300.000`) dan Rekening BSI (`7327913322` a.n. `TAUD SaQu Abu Ayyub`) beserta tombol salin nomor rekening di bagian atas form.
   - Hanya tampilkan 3 input pada form:
     1. Input `child_name` (Label: `"Nama Lengkap Calon Siswa"`)
     2. Input `whatsapp_number` (Label: `"Nomor Handphone / WhatsApp Aktif"`)
     3. Komponen `<PaymentProofUpload />` (Label: `"Upload Bukti Pembayaran *"`)
   - Nonaktifkan tombol submit apabila `!selectedFile || isSubmitting`.
   - Setelah submit berhasil, simpan sesi dengan status `"payment_submitted"` dan langsung redirect ke `/daftar/formulir/${encodeURIComponent(response.registration_number)}`.
   - Tambahkan tombol mengambang (floating button) `"Butuh Bantuan?"` menuju WhatsApp Admin di pojok kanan bawah.
4. **Bersihkan Pre-fill Placeholder `"Wali Murid"` di `FullFormWizard.tsx`**:
   - Karena RPC `fn_get_registration_full_form` mengisi `form_data.father.full_name` dari kolom `parent_name`, pastikan di `FullFormWizard.tsx` jika `initialData?.father?.full_name === "Wali Murid"` nilainya diubah menjadi `""` (string kosong) agar orang tua mengisi nama ayah asli pada tahap formulir lengkap.
5. **Redirect Route `/daftar/pembayaran` ke `/daftar` di `src/app/router.tsx`**:
   - Ubah `<Route path="/daftar/pembayaran" ... />` menjadi `<Navigate to="/daftar" replace />`.
   - Biarkan `<Route path="/bayar/:registrationNumber" element={<PaymentPage />} />` tetap ada khusus sebagai fallback apabila bukti bayar pendaftar ditolak admin (`payment_rejected`) dan perlu unggah ulang.

## Out of Scope
- Mengubah struktur tabel database PostgreSQL atau membuat file migrasi SQL baru.
- Mengubah alur 5 langkah pada `FullFormWizard.tsx` (`/daftar/formulir`).
- Mengubah halaman Dashboard Admin.

---

## Step-by-Step Implementation Guide (Untuk Junior Programmer / AI Agent)

### Langkah 1: Edit `src/features/registration/schemas/initial-registration.schema.ts`
Ganti seluruh isi file menjadi:
```typescript
import { z } from "zod";

export const initialRegistrationSchema = z.object({
  child_name: z
    .string()
    .trim()
    .min(2, "Nama siswa minimal 2 karakter")
    .max(100, "Nama siswa maksimal 100 karakter"),
  whatsapp_number: z
    .string()
    .trim()
    .regex(
      /^(\+?62|0)8[1-9][0-9]{6,10}$/,
      "Format nomor handphone/WhatsApp tidak valid (contoh: 08123456789)"
    ),
});

export type InitialRegistrationInput = z.infer<typeof initialRegistrationSchema>;
```

### Langkah 2: Edit `src/features/registration/types/index.ts`
Ubah `CreateRegistrationRequest` agar menerima `file: File` dan menghapus kewajiban `parent_name`:
```typescript
export interface CreateRegistrationRequest {
  child_name: string;
  whatsapp_number: string;
  file: File;
}

export interface CreateRegistrationResponse {
  registration_number: string;
  access_code: string;
  registration_id: string;
}

export interface RegistrationErrorResponse {
  error: string;
}
```

### Langkah 3: Edit `src/features/registration/services/registration.ts`
Ubah fungsi `createRegistration` agar mengunggah bukti bayar ke Cloudinary lebih dulu, baru membuat nomor pendaftaran dan mencatat bukti pembayaran:
```typescript
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
```

### Langkah 4: Edit `src/features/registration/pages/RegistrationStartPage.tsx`
1. Import komponen dan konfigurasi pembayaran yang sudah ada:
   - `PaymentProofUpload` dari `@/features/payments/components/PaymentProofUpload`
   - `DEFAULT_BANK_INFO` dari `@/features/payments/services/payment`
   - `ADMIN_CONTACTS` dari `@/config/schoolInfo`
   - Ikon tambahan `Copy, Check, FileCheck2, MessageCircle` dari `lucide-react`
2. Tambahkan state untuk file bukti pembayaran dan salin nomor rekening:
   ```tsx
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [fileError, setFileError] = useState<string | null>(null);
   const [copiedAcc, setCopiedAcc] = useState(false);
   ```
3. Hapus `parent_name: ""` dari `defaultValues` di `useForm<InitialRegistrationInput>()` dan hapus `<FormField name="parent_name" ... />` dari JSX.
4. Tambahkan blok informasi biaya pendaftaran (`Rp 300.000`) & nomor rekening BSI (`DEFAULT_BANK_INFO.accountNumber` + tombol copy) di atas `<Form>`.
5. Tambahkan komponen `<PaymentProofUpload selectedFile={selectedFile} onFileSelect={handleFileSelect} disabled={isSubmitting} />` di bawah field `whatsapp_number`.
6. Di dalam fungsi `onSubmit(values)`:
   - Cek `if (!selectedFile)` $\rightarrow$ tampilkan error `"Silakan unggah bukti pembayaran terlebih dahulu"` dan `return`.
   - Panggil `const response = await createRegistration({ ...values, file: selectedFile });`
   - Panggil `saveSessionCredentials(response.registration_number, response.access_code, values.child_name, "payment_submitted");`
   - Tampilkan toast sukses yang menyertakan `response.registration_number` dan arahkan (`navigate`) langsung ke:
     ```tsx
     navigate(`/daftar/formulir/${encodeURIComponent(response.registration_number)}`, {
       replace: true,
       state: {
         registrationNumber: response.registration_number,
         accessCode: response.access_code,
         childName: values.child_name,
       },
     });
     ```

### Langkah 5: Edit `src/features/registration/components/FullFormWizard.tsx`
Pada inisialisasi state `formData` (bagian `father: mergeSection(...)`), bersihkan nilai placeholder `"Wali Murid"` agar input Nama Ayah tidak terisi teks `"Wali Murid"`:
```tsx
father: mergeSection(
  {
    full_name: "",
    nik: "",
    birth_place: "",
    birth_date: "",
    last_education: "",
    occupation: "",
    monthly_income: "",
    whatsapp_number: "",
    address: "",
  },
  initialData?.father
    ? {
        ...initialData.father,
        full_name:
          initialData.father.full_name === "Wali Murid"
            ? ""
            : initialData.father.full_name,
      }
    : undefined,
  localData?.father,
),
```

### Langkah 6: Edit `src/app/router.tsx`
Ubah route `/daftar/pembayaran` agar langsung mengarah ke `/daftar`:
```tsx
<Route path="/daftar/pembayaran" element={<Navigate to="/daftar" replace />} />
```

---

## Files Expected to Change
- `src/features/registration/schemas/initial-registration.schema.ts`
- `src/features/registration/types/index.ts`
- `src/features/registration/services/registration.ts`
- `src/features/registration/pages/RegistrationStartPage.tsx`
- `src/features/registration/components/FullFormWizard.tsx`
- `src/app/router.tsx`

## Acceptance Criteria
- [x] Saat pengguna klik tombol "Daftar Sekarang", pengguna langsung menuju `/daftar` yang berisi informasi rekening pembayaran + form awal dalam 1 halaman.
- [x] Form pada halaman `/daftar` hanya memiliki 3 input: **Nama Siswa**, **Nomor Handphone/WhatsApp**, dan **Upload Bukti Pembayaran** (tanpa input Nama Orang Tua).
- [x] Tombol submit tidak dapat dikirim sebelum berkas bukti pembayaran dipilih.
- [x] Jika pengguna tidak mengisi form awal dan tidak mengunggah bukti pembayaran (atau upload gagal), **Nomor Pendaftaran tidak akan dibuat** di database.
- [x] Setelah form awal diisi dan bukti pembayaran berhasil diunggah, pengguna mendapatkan Nomor Pendaftaran & Kode Akses serta langsung diarahkan ke halaman formulir lengkap (`/daftar/formulir/:registrationNumber`).
- [x] Pada halaman formulir lengkap (`/daftar/formulir/:registrationNumber`), field Nama Ayah tidak terisi teks placeholder `"Wali Murid"`.
- [x] `npx tsc -b --noEmit`, `npm run lint`, dan `npm run build` berjalan sukses dengan 0 error.

## Verification Commands
Jalankan perintah berikut setelah selesai mengimplementasikan perubahan:
```bash
npx tsc -b --noEmit
npm run lint
npm run build
```
