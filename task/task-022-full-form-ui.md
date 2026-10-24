# Task 022 — Full Form UI

## Status
DONE

## Priority
P1

## Dependencies
- Task 021 — Form Schema & Migration (**DONE**)
- Task 015 — Registration UI (**DONE**)

## Objective
Build the full registration form UI at `/daftar/formulir` where registrants who have uploaded payment proof (`payment_submitted` or `payment_verified`) immediately fill in all official registration details and upload required documents (Kartu Keluarga and Akte Kelahiran).

## Context
As soon as payment proof is uploaded (`payment_status = payment_submitted`), registrants can immediately complete their full registration without waiting for admin verification. If payment proof has NOT been uploaded yet (`payment_pending` or `payment_rejected`), the page displays payment instructions, admin WhatsApp help contact, and inline payment proof upload that unlocks the form immediately upon upload.

## Scope
- **Gating page** at `/daftar/formulir` entry: if `payment_status = payment_pending` or `payment_rejected`, show bank BSI transfer instructions (Rp 300.000), direct WhatsApp link to Admin for help & questions, and inline payment proof upload; once uploaded (`payment_submitted`), immediately show the form wizard.
- **5-step wizard** (step indicator at top):
  - Step 1: Data Calon Peserta Didik (10 fields incl. program dropdown: 1 tahun / 2 tahun)
  - Step 2: Data Ayah (8 fields)
  - Step 3: Data Ibu (8 fields)
  - Step 4: Data Kesehatan Anak (5 fields)
  - Step 5: Upload Dokumen (2 file inputs: Foto Kartu Keluarga & Foto Akte Kelahiran; JPEG/PNG/PDF; max 5 MB; both required)
- Each step saves draft to DB before advancing (calls `submit-full-form` with `action: 'save_draft'`)
- Final submit → calls `submit-full-form` with `action: 'submit'` → status → `submitted`
- **Post-submit:** WA Group link button "Gabung Grup WhatsApp" → `https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh`
- Form fields use Zod schema from task-021; validation errors in Bahasa Indonesia
- Once `submitted`, all fields read-only

## Implementation Details
1. Created `/daftar/formulir` and `/daftar/formulir/:registrationNumber` in `src/app/router.tsx`.
2. Built gating and credential screen in `src/features/registration/pages/FullFormPage.tsx`:
   - Unauthenticated: prompt nomor pendaftaran dan kode akses (auto-loaded if navigated from payment page).
   - `payment_pending` / `payment_rejected`: instruksi BSI Rp 300.000 + bantuan WhatsApp Admin + upload foto bukti pembayaran inline -> langsung membuka form wizard setelah diunggah.
   - `payment_submitted` / `payment_verified` (`awaiting_form`): formulir wizard langsung aktif tanpa menunggu verifikasi admin.
   - `submitted`: tampilan read-only + tombol WhatsApp Group resmi.
3. Built 5-step wizard in `src/features/registration/components/FullFormWizard.tsx`:
   - Step indicator visual (Calon Santri, Data Ayah, Data Ibu, Kesehatan, Dokumen).
   - Validasi bertahap menggunakan skema Zod `childSchema`, `fatherSchema`, `motherSchema`, `healthSchema`.
   - Penyimpanan draf otomatis saat klik "Selanjutnya" maupun manual tombol "Simpan Draf".
   - Integrasi upload dokumen real-time (Foto Kartu Keluarga dan Foto Akte Kelahiran) ke Edge Function `document-upload` dengan indikator status terunggah.
   - Validasi kelengkapan kedua berkas persyaratan sebelum final submit.
4. Built frontend service methods in `src/features/registration/services/formService.ts`.

## Acceptance Criteria
- [x] Gating: wali murid dengan `payment_pending` melihat instruksi transfer BSI, kontak bantuan WA Admin, dan upload bukti TF — begitu bukti diunggah, formulir langsung terbuka
- [x] 4-section data + 1-section document wizard renders all confirmed fields with correct validation
- [x] Program pembelajaran dropdown: "1 Tahun" / "2 Tahun"
- [x] Both document uploads work (Kartu Keluarga & Akte Kelahiran); format/size validation shown in UI
- [x] "Gabung Grup WhatsApp" button appears after successful submission
- [x] Draft saves per step — refreshing page restores last saved step
- [x] Validation errors shown in Bahasa Indonesia
- [x] Form cannot be submitted with missing required fields or documents
- [x] After submit: fields are read-only, success state shown

## Verification
```bash
npx tsc -b --noEmit
npm run lint
npm run build
```

## Completion Notes
Diselesaikan pada 2026-10-23. Seluruh alur form wizard, gating pembayaran, penyimpanan draf, upload dokumen persyaratannya, proteksi read-only, dan integrasi tombol WhatsApp grup telah diverifikasi dengan 0 error TypeScript, ESLint, dan build Vite produksi berhasil.
