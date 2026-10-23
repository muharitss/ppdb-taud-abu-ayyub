# Task 023 — Edge Function: document-upload

## Status
DONE

## Priority
P0

## Dependencies
- Task 021 — Form Schema & Migration (**DONE**)
- Task 010 — Database Migrations (**DONE**)

## Objective
Create Edge Function for document upload to private Supabase Storage bucket `registration-documents`.

## Context
When registrants submit the full registration form (task 022), their required documents are uploaded through this Edge Function. The function validates, stores, and records each document securely in a private bucket.

## Scope
- Create `supabase/functions/document-upload/index.ts`
- Input: `registration_number`, `access_code`, `document_type` (`kartu_keluarga`, `akte_kelahiran`, `pas_foto`), `file` (multipart)
- Verify access code with timing attack protection (dummy bcrypt hash)
- Verify registration is in `awaiting_form` status
- Validate file server-side (magic bytes MIME check: JPEG, PNG, PDF; size max 5 MB)
- Upload to private `registration-documents` bucket with path: `{registration_id}/{document_type}-{timestamp}.{ext}`
- Upsert `registration_documents` record (cleans up previous file in storage if re-uploading same document type)
- Log audit event to `audit_events`

## Implementation Details
1. Created `supabase/functions/document-upload/index.ts`:
   - Validasi multipart form data, deteksi MIME header bytes (`image/jpeg`, `image/png`, `application/pdf`).
   - Mitigasi timing attack (dummy hash bcrypt).
   - Validasi status pendaftaran (`awaiting_form`).
   - Penggantian berkas lama di bucket privat `registration-documents`.
   - Upsert ke tabel `registration_documents` dengan trigger update dan audit log.
2. Created `supabase/functions/submit-full-form/index.ts`:
   - Penanganan `action: 'get'` untuk me-restore draf formulir dan daftar dokumen terunggah.
   - Penanganan `action: 'save_draft'` untuk menyimpan kemajuan per-step ke tabel `registration_form_data`.
   - Penanganan `action: 'submit'` yang memvalidasi Zod `registrationFormSchema`, kelengkapan 3 berkas dokumen wajib, update status `submitted`, dan audit log.
3. Created test suites:
   - `src/features/registration/__tests__/document-upload.test.ts`
   - `src/features/registration/__tests__/submit-full-form.test.ts`

## Acceptance Criteria
- [x] File stored in private `registration-documents` bucket
- [x] `registration_documents` record upserted correctly
- [x] Invalid file type rejected
- [x] File size limit enforced (5 MB)
- [x] Invalid access code rejected with 401
- [x] Wrong registration status rejected with 409
- [x] Audit event logged

## Verification
```bash
node --input-type=module -e "import('./src/features/registration/__tests__/document-upload.test.ts')"
node --input-type=module -e "import('./src/features/registration/__tests__/submit-full-form.test.ts')"
npx tsc -b --noEmit
```

## Completion Notes
Diselesaikan pada 2026-10-23. Seluruh acceptance criteria lolos 100% dan teruji dengan mock Supabase client mencakup validasi magic bytes, CORS, opaque error timing mitigation, status checks, dan happy path upload.
