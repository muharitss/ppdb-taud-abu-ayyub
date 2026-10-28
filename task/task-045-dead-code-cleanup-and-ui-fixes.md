# Task 045 — Pembersihan Kode Mati (Dead Code), Dependensi Tidak Terpakai, & Perbaikan Bug Minor UI/Schema

## Status
NOT_STARTED

## Priority
P1 (Kualitas Kode, Performa Build, & Bug Minor UI)

## Dependencies
- Task 043 — RPC Security & Validation Hardening
- Task 044 — Admin Payment Reject & Query Fixes

## Objective
Membersihkan lebih dari **4.600 baris kode mati (*dead code*)** dan **5 dependensi npm yang tidak terpakai**, memperbaiki unit test agar menguji kode yang aktif, menyederhanakan duplikasi skema validasi orang tua (`fatherSchema` & `motherSchema`), serta memperbaiki bug input angka pada wizard formulir dan typo CSS di halaman utama.

---

## Context & Penjelasan Masalah (Untuk Junior Developer)

Selama pengembangan aplikasi ini, terdapat beberapa perubahan arsitektur (seperti perpindahan dari Supabase Edge Functions ke PostgreSQL RPC dan penyederhanaan halaman Admin menjadi 2 halaman utama). Namun, file-file lama tidak dihapus sehingga menumpuk di repositori:

1. **6 Supabase Edge Functions Tidak Terpakai (~1.944 baris)**:
   - Folder `supabase/functions/` berisi 6 fungsi Deno (`admin-review-payment`, `create-registration`, `document-upload`, `submit-full-form`, `submit-payment-proof`, `verify-registration-access`) yang sudah digantikan oleh fungsi RPC SQL di PostgreSQL. Tidak ada satu pun kode frontend di `src/` yang memanggil `/functions/v1/*`.
2. **6 File Unit Test Menguji Edge Functions yang Sudah Mati**:
   - Enam file test di `src/features/**/__tests__/*.test.ts` mengimpor handler dari `supabase/functions/*/index.ts` yang sudah tidak dipakai, sedangkan `package.json` belum memiliki script `"test"`.
3. **11 File Halaman, Komponen, & Service Admin Tidak Terpakai (~2.320 baris)**:
   - Di `src/app/router.tsx`, route admin yang aktif hanya `/admin/login`, `/admin` (`AdminDashboardPage`), dan `/admin/pendaftar/:id` (`AdminRegistrantDetailPage`).
   - Sebanyak 11 file lain di `src/features/admin/` (`AdminPaymentListPage.tsx`, `AdminRegistrantListPage.tsx`, `AdminAuditLogPage.tsx`, `AdminConfigPage.tsx`, `AuditLogSection.tsx`, `DocumentViewer.tsx`, `PaymentReviewCard.tsx`, `RecentActivityTable.tsx`, `SummaryCard.tsx`, `adminAudit.ts`, `adminConfig.ts`) tidak pernah di-import oleh file aktif mana pun.
4. **3 File Lain & 5 Package NPM Tidak Terpakai (~375 baris)**:
   - File `src/components/ui/carousel.tsx`, `src/data/content.ts`, dan `src/types/database.ts` tidak pernah di-import di mana pun.
   - Package `cn`, `embla-carousel-react`, `@prisma/client`, `bcryptjs`, dan `@types/bcryptjs` di `package.json` tidak digunakan oleh aplikasi utama.
5. **Bug Input Angka Menjadi `0` Saat Dihapus & Typo `className` di Landing Page**:
   - Di `FullFormWizard.tsx` (baris 650, 747, 767), input `child_order`, `weight_kg`, dan `height_cm` menggunakan `Number(e.target.value)`. Di JavaScript, `Number("")` menghasilkan `0`, sehingga saat orang tua menghapus angka di kolom berat/tinggi badan untuk mengetik angka baru, nilai `0` tersimpan ke draf.
   - Di `src/features/landing/components/RegistrationRequirements.tsx` baris 152, terdapat typo `className="text-center mt-10 sm:mt-12 relativhttp://localhost:45447/daftare z-10"` karena URL tidak sengaja tertempel di tengah kata `relative`.
6. **Duplikasi Skema Validasi Ayah & Ibu di `formSchema.ts`**:
   - `fatherSchema` dan `motherSchema` menduplikasi 6 field yang sama persis (`full_name`, `nik`, `birth_place`, `birth_date`, `whatsapp_number`, `address`) sebanyak 3 kali (di `parentBaseSchema`, `fatherSchema`, dan `motherSchema`).

---

## Scope (Daftar Pekerjaan)
1. Hapus folder `supabase/functions/` beserta 6 file unit test lama yang mengimpor Edge Functions tersebut, lalu tambahkan script `"test"` di `package.json` untuk menjalankan unit test aktif (`form-schema.test.ts` & `whatsapp.test.ts`).
2. Hapus 11 file admin yang tidak terpakai dan hapus fungsi yang tidak terpakai di `adminDashboard.ts` (`getRecentAuditEvents`) serta `adminPayment.ts` (`getPendingPayments`, `getRegistrantDetail`, `createPaymentProofSignedUrl`).
3. Hapus `src/components/ui/carousel.tsx`, `src/data/content.ts`, dan `src/types/database.ts`, serta hapus 5 dependensi tidak terpakai dari `package.json`.
4. Perbaiki konversi input angka kosong di `src/features/registration/components/FullFormWizard.tsx` dan perbaiki typo `relative` di `src/features/landing/components/RegistrationRequirements.tsx`.
5. Refactor `parentBaseSchema`, `fatherSchema`, dan `motherSchema` di `src/features/registration/schemas/formSchema.ts` menggunakan satu fungsi pembuat skema `createParentSchema(label: "ayah" | "ibu")`.

## Out of Scope
- Mengubah tampilan atau fitur pada halaman yang sedang aktif digunakan.

---

## Step-by-Step Implementation Guide (Panduan Langkah demi Langkah)

### Langkah 1: Hapus File Dead Code (Edge Functions, Admin Dead Files, & Unused Files)
Jalankan perintah penghapusan file berikut dari root proyek:

```bash
# 1. Hapus 6 Supabase Edge Functions yang sudah digantikan SQL RPC
rm -rf supabase/functions

# 2. Hapus 6 unit test lama yang menguji Edge Functions di atas
rm -f src/features/admin/__tests__/admin-review-payment.test.ts \
      src/features/registration/__tests__/create-registration.test.ts \
      src/features/registration/__tests__/document-upload.test.ts \
      src/features/registration/__tests__/submit-full-form.test.ts \
      src/features/payments/__tests__/submit-payment-proof.test.ts \
      src/features/status/__tests__/verify-registration-access.test.ts

# 3. Hapus 11 file Admin yang tidak di-route / tidak terpakai
rm -f src/features/admin/pages/AdminPaymentListPage.tsx \
      src/features/admin/pages/AdminRegistrantListPage.tsx \
      src/features/admin/pages/AdminAuditLogPage.tsx \
      src/features/admin/pages/AdminConfigPage.tsx \
      src/features/admin/components/AuditLogSection.tsx \
      src/features/admin/components/DocumentViewer.tsx \
      src/features/admin/components/PaymentReviewCard.tsx \
      src/features/admin/components/RecentActivityTable.tsx \
      src/features/admin/components/SummaryCard.tsx \
      src/features/admin/services/adminAudit.ts \
      src/features/admin/services/adminConfig.ts

# 4. Hapus 3 file UI/data/type yang tidak pernah di-import
rm -f src/components/ui/carousel.tsx \
      src/data/content.ts \
      src/types/database.ts
```

---

### Langkah 2: Bersihkan Fungsi Tidak Terpakai di `adminDashboard.ts` dan `adminPayment.ts`

1. Di `src/features/admin/services/adminDashboard.ts`, hapus `AuditEventItem` dan fungsi `getRecentAuditEvents` (karena hanya menyisakan `DashboardStats` dan `getDashboardStats`).
2. Di `src/features/admin/services/adminPayment.ts`, hapus fungsi `getPendingPayments`, `getRegistrantDetail`, dan `createPaymentProofSignedUrl`, sehingga file `src/features/admin/services/adminPayment.ts` hanya berisi fungsi `reviewPayment`:

```typescript
import { supabase } from "@/lib/supabase/client";
import type { ReviewPaymentParams, ReviewPaymentResult } from "../types";

export async function reviewPayment({
  payment_id,
  approved,
  review_notes,
}: ReviewPaymentParams): Promise<ReviewPaymentResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("fn_review_payment", {
    p_payment_id: payment_id,
    p_approved: approved,
    p_admin_id: user?.id,
    p_review_notes: review_notes?.trim() || null,
  });

  const res = data as unknown as ReviewPaymentResult | null;
  if (error) {
    throw new Error(error.message || "Gagal memproses review pembayaran");
  }

  if (!res?.success) {
    throw new Error("Respon server tidak valid saat meninjau pembayaran");
  }

  return res;
}
```

---

### Langkah 3: Bersihkan Dependensi & Tambahkan Script `"test"` di `package.json`
1. Buka `package.json`:
   - Pada bagian `"scripts"`, ubah `"build": "prisma generate && tsc -b && vite build"` menjadi `"build": "tsc -b && vite build"`, dan tambahkan script `"test"`:
     ```json
     "scripts": {
       "dev": "vite",
       "build": "tsc -b && vite build",
       "lint": "eslint .",
       "preview": "vite preview",
       "test": "node --import tsx --test src/features/registration/__tests__/form-schema.test.ts src/features/registration/__tests__/whatsapp.test.ts",
       "db:seed": "tsx prisma/seed.ts"
     },
     ```
   - Hapus `"@prisma/client"`, `"bcryptjs"`, `"cn"`, dan `"embla-carousel-react"` dari `"dependencies"`.
   - Hapus `"@types/bcryptjs"` dari `"devDependencies"`.
2. Jalankan `npm install` agar `package-lock.json` ikut diperbarui.

---

### Langkah 4: Perbaiki Typo `className` di `src/features/landing/components/RegistrationRequirements.tsx`
Buka `src/features/landing/components/RegistrationRequirements.tsx` pada baris 152:
- **Sebelum:**
  ```tsx
  <div className="text-center mt-10 sm:mt-12 relativhttp://localhost:45447/daftare z-10">
  ```
- **Sesudah:**
  ```tsx
  <div className="text-center mt-10 sm:mt-12 relative z-10">
  ```

---

### Langkah 5: Perbaiki Input Angka Kosong di `src/features/registration/components/FullFormWizard.tsx`
Buka `src/features/registration/components/FullFormWizard.tsx`:
1. Pada input `child_order` (sekitar baris 649–651):
   ```tsx
   value={formData.child?.child_order ?? ""}
   onChange={(e) =>
     updateField(
       "child",
       "child_order",
       e.target.value === "" ? ("" as unknown as number) : Number(e.target.value),
     )
   }
   ```
2. Pada input `health_weight` (sekitar baris 744–747):
   ```tsx
   value={formData.health?.weight_kg ?? ""}
   onChange={(e) =>
     updateField(
       "health",
       "weight_kg",
       e.target.value === "" ? ("" as unknown as number) : Number(e.target.value),
     )
   }
   ```
3. Pada input `health_height` (sekitar baris 765–768):
   ```tsx
   value={formData.health?.height_cm ?? ""}
   onChange={(e) =>
     updateField(
       "health",
       "height_cm",
       e.target.value === "" ? ("" as unknown as number) : Number(e.target.value),
     )
   }
   ```

---

### Langkah 6: Sederhanakan `fatherSchema` & `motherSchema` di `src/features/registration/schemas/formSchema.ts`
Buka `src/features/registration/schemas/formSchema.ts` (baris 70–185) dan ganti `parentBaseSchema`, `fatherSchema`, dan `motherSchema` dengan fungsi helper `createParentSchema`:

```typescript
function createParentSchema(roleLabel: "ayah" | "ibu") {
  return z.object({
    full_name: z
      .string()
      .trim()
      .min(2, `Nama lengkap ${roleLabel} minimal 2 karakter`)
      .max(100, `Nama lengkap ${roleLabel} maksimal 100 karakter`),
    nik: z
      .string()
      .trim()
      .regex(NIK_REGEX, `NIK ${roleLabel} harus terdiri dari 16 digit angka`),
    birth_place: z
      .string()
      .trim()
      .min(2, `Tempat lahir ${roleLabel} minimal 2 karakter`)
      .max(100, `Tempat lahir ${roleLabel} maksimal 100 karakter`),
    birth_date: z
      .string()
      .trim()
      .regex(ISO_DATE_REGEX, `Format tanggal lahir ${roleLabel} harus YYYY-MM-DD`),
    last_education: z
      .string()
      .trim()
      .min(1, "Pendidikan terakhir wajib diisi")
      .max(50, "Pendidikan terakhir maksimal 50 karakter"),
    occupation: z
      .string()
      .trim()
      .min(1, "Pekerjaan wajib diisi")
      .max(100, "Pekerjaan maksimal 100 karakter"),
    monthly_income: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().trim().max(100, "Penghasilan maksimal 100 karakter").optional(),
    ),
    whatsapp_number: z
      .string()
      .trim()
      .regex(
        WHATSAPP_REGEX,
        `Format nomor WhatsApp ${roleLabel} tidak valid (contoh: 08123456789)`,
      ),
    address: z
      .string()
      .trim()
      .min(5, `Alamat ${roleLabel} minimal 5 karakter`)
      .max(500, `Alamat ${roleLabel} maksimal 500 karakter`),
  });
}

export const fatherSchema = createParentSchema("ayah");
export type FatherFormData = z.infer<typeof fatherSchema>;

export const motherSchema = createParentSchema("ibu");
export type MotherFormData = z.infer<typeof motherSchema>;

export type ParentFormData = FatherFormData;
```

---

## Files Expected to Change / Delete
- Dihapus: `supabase/functions/**` (6 file)
- Dihapus: 6 file test Edge Functions lama di `src/features/**/__tests__/`
- Dihapus: 11 file dead code di `src/features/admin/`
- Dihapus: `src/components/ui/carousel.tsx`, `src/data/content.ts`, `src/types/database.ts`
- Diubah: `src/features/admin/services/adminDashboard.ts`
- Diubah: `src/features/admin/services/adminPayment.ts`
- Diubah: `package.json`
- Diubah: `src/features/landing/components/RegistrationRequirements.tsx`
- Diubah: `src/features/registration/components/FullFormWizard.tsx`
- Diubah: `src/features/registration/schemas/formSchema.ts`

## Acceptance Criteria
- [ ] Seluruh file *dead code* (Edge Functions lama, 11 file Admin tidak terpakai, `carousel.tsx`, `content.ts`, `database.ts`) telah terhapus.
- [ ] Dependensi `cn`, `embla-carousel-react`, `@prisma/client`, `bcryptjs`, dan `@types/bcryptjs` telah dihapus dari `package.json`.
- [ ] Typo `relativhttp://localhost:45447/daftare` pada `RegistrationRequirements.tsx` sudah diperbaiki menjadi `relative`.
- [ ] Menghapus isi input angka pada `FullFormWizard.tsx` (`child_order`, `weight_kg`, `height_cm`) mengosongkan field tanpa mengubah nilainya menjadi `0`.
- [ ] `npm test`, `npx tsc -b --noEmit`, `npm run lint`, dan `npm run build` berjalan sukses dengan 0 error.

## Verification Commands
```bash
npm test
npx tsc -b --noEmit
npm run lint
npm run build
```
