# Task 022 — Full Form UI

## Status
DONE

## Priority
P1

## Dependencies
- Task 021 — Form Schema & Migration (**DONE**)
- Task 015 — Registration UI (**DONE**)

## Objective
Build the full registration form UI at `/daftar/formulir` where confirmed registrants (payment verified) fill in all official registration details and upload required documents.

## Context
After payment proof is uploaded (`payment_status = payment_submitted`), registrants complete their full registration via a 4-section wizard. If payment proof has NOT been uploaded yet, a gating page shows payment instructions first.

## Scope
- **Gating page** at `/daftar/formulir` entry: if `payment_status = payment_pending`, show bank BSI transfer instructions (Rp 300.000, No.Rek 7216959997 a.n. TAUD SaQu Abu Ayyub) with payment upload button/link; if `payment_submitted`, show review queue notice; block wizard access.
- **4-section wizard** (step indicator at top):
  - Step 1: Data Calon Peserta Didik (10 fields incl. program dropdown: 1 tahun / 2 tahun)
  - Step 2: Data Ayah (8 fields)
  - Step 3: Data Ibu (8 fields)
  - Step 4: Data Kesehatan Anak (5 fields)
- **Step 5: Upload Dokumen** (3 file inputs: KK, Akta Kelahiran, Pas Foto 3×4; JPEG/PNG/PDF; max 5 MB; all required)
- Each step saves draft to DB before advancing (calls `submit-full-form` with `action: 'save_draft'`)
- Final submit → calls `submit-full-form` with `action: 'submit'` → status → `submitted`
- **Step 6 / Post-submit:** WA Group link button "Gabung Grup WhatsApp" → `https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh`
- Form fields use Zod schema from task-021; validation errors in Bahasa Indonesia
- Once `submitted`, all fields read-only

## Implementation Details
1. Created `/daftar/formulir` and `/daftar/formulir/:registrationNumber` in `src/app/router.tsx`.
2. Built gating and credential screen in `src/features/registration/pages/FullFormPage.tsx`:
   - Unauthenticated: prompt nomor pendaftaran dan kode akses.
   - `payment_pending`: instruksi BSI Rp 300.000 + tombol upload bukti bayar.
   - `payment_submitted`: notifikasi status verifikasi pembayaran oleh panitia admin.
   - `awaiting_form`: formulir wizard aktif.
   - `submitted`: tampilan read-only + tombol WhatsApp Group resmi.
3. Built 5-step wizard in `src/features/registration/components/FullFormWizard.tsx`:
   - Step indicator visual (Calon Santri, Data Ayah, Data Ibu, Kesehatan, Dokumen).
   - Validasi bertahap menggunakan skema Zod `childSchema`, `fatherSchema`, `motherSchema`, `healthSchema`.
   - Penyimpanan draf otomatis saat klik "Selanjutnya" maupun manual tombol "Simpan Draf".
   - Integrasi upload dokumen real-time ke Edge Function `document-upload` dengan indikator status terunggah.
   - Validasi kelengkapan ketiga berkas persyaratan sebelum final submit.
4. Built frontend service methods in `src/features/registration/services/formService.ts`.

## Acceptance Criteria
- [x] Gating: wali murid dengan `payment_pending` melihat instruksi transfer BSI dan kolom upload bukti TF — formulir tidak bisa diakses sebelum upload
- [x] 4-section wizard renders all confirmed fields with correct validation
- [x] Program pembelajaran dropdown: "1 Tahun" / "2 Tahun"
- [x] All 3 document uploads work (KK, Akta, Pas Foto); format/size validation shown in UI
- [x] "Gabung Grup WhatsApp" button appears after successful document upload / submission
- [x] Draft saves per step — refreshing page restores last saved step
- [x] Validation errors shown in Bahasa Indonesia
- [x] Form cannot be submitted with missing required fields
- [x] After submit: fields are read-only, success state shown

## Verification
```bash
npx tsc -b --noEmit
npm run lint
npm run build
```

## Completion Notes
Diselesaikan pada 2026-10-23. Seluruh alur form wizard, gating pembayaran, penyimpanan draf, upload dokumen persyaratannya, proteksi read-only, dan integrasi tombol WhatsApp grup telah diverifikasi dengan 0 error TypeScript, ESLint, dan build Vite produksi berhasil.
