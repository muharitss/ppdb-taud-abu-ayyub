# Task 017 — Edge Function: submit-payment-proof

## Status
DONE

## Priority
P0

## Dependencies
- Task 010 — Database Migrations
- Task 013 — Edge Function: create-registration

## Objective
Create Edge Function `submit-payment-proof` for payment proof upload.

## Context
When a registrant uploads their bank transfer proof, this Edge Function securely receives the file, validates it server-side, stores it in a private Supabase Storage bucket, and records the payment submission in the database.

## Scope
1. Create `supabase/functions/submit-payment-proof/index.ts`
2. Input: `registration_number`, `access_code` (verify access), `file` (multipart form data)
3. Verify access using bcrypt compare against `registration_access` with dummy hash timing attack protection
4. Verify `registration_status` is `awaiting_payment` and `payment_status` is pending/rejected before accepting upload
5. Validate file server-side: MIME type magic bytes (JPEG: FF D8 FF, PNG: 89 50 4E 47, PDF: 25 50 44 46), size ≤ 5MB
6. Upload to private Supabase Storage bucket `payment-proofs` with path: `{registration_id}/{timestamp}-proof.{ext}`
7. Insert into `payments` table: `status=payment_submitted`, `proof_file_path`
8. Update registration `payment_status` to `payment_submitted`
9. Return success response with status
10. Log audit event: `action=payment_proof_submitted`, `entity_type=registration`, `entity_id=registration_id`

## Out of Scope
- Payment verification (handled by admin in task 019)
- Email/SMS notifications

## Specifications
- specs/05-business-workflows.md
- specs/04-data-model.md
- specs/03-security.md

## Implementation Plan
1. Scaffold Edge Function with Deno + TypeScript
2. Parse multipart form data (`req.formData()`)
3. Extract and validate `registration_number` + `access_code`
4. Look up registration; verify access code (bcrypt compare with timing side-channel mitigation)
5. Check registration status and payment status (`awaiting_payment`, conflict if `payment_verified` or `payment_submitted`)
6. Validate file magic bytes and size (≤ 5MB)
7. Generate storage path: `{registration_id}/{Date.now()}-proof.{ext}`
8. Upload file to `payment-proofs` private bucket via Supabase Storage API
9. Insert `payments` record with `status='payment_submitted'` and `proof_file_path`
10. Update `registrations.payment_status = 'payment_submitted'`
11. Insert `audit_events` record
12. Return `{ success: true, status: 'payment_submitted', message: '...' }`

## Files Changed
- `supabase/functions/submit-payment-proof/index.ts`
- `supabase/functions/submit-payment-proof/deno.json`
- `src/features/payments/__tests__/submit-payment-proof.test.ts`

## Security Considerations
- Private bucket: `payment-proofs` has no public access policy
- Server-side file validation inspects file magic bytes (JPEG `FF D8 FF`, PNG `89 50 4E 47`, PDF `%PDF`), not just the client Content-Type header
- Access code verified via bcrypt compare with dummy hash timing attack mitigation
- Status check prevents double-submission if already verified or submitted
- Service role key used on server, never exposed to client

## Acceptance Criteria
- [x] File stored in private `payment-proofs` bucket at correct path
- [x] `payments` record created with `status=payment_submitted` and correct `proof_file_path`
- [x] `registrations.payment_status` updated to `payment_submitted`
- [x] Invalid file type (magic bytes mismatch) rejected with 400
- [x] Files > 5MB rejected with 400 before upload attempt
- [x] Invalid or non-existent credentials rejected with 401 opaque message
- [x] Wrong `payment_status` (already verified/submitted) rejected with 409
- [x] Audit event logged with correct fields
- [x] Edge Function returns correct CORS headers

## Verification
```bash
node --experimental-strip-types src/features/payments/__tests__/submit-payment-proof.test.ts
npx tsc -b --noEmit
npm run lint
npm run build
```

## Risks
- Supabase storage bucket `payment-proofs` must exist in remote/staging project (already documented in migration/deployment specs).

## Deliverables
- `supabase/functions/submit-payment-proof/index.ts`
- Test suite in `src/features/payments/__tests__/submit-payment-proof.test.ts`

## Completion Notes
Completed 2026-10-23. Implemented Deno Edge Function with multipart/form-data parsing, magic bytes verification (JPEG/PNG/PDF), 5MB size limit, timing side-channel mitigation with dummy bcrypt compare, status checks, upload to `payment-proofs` bucket, insert to `payments`, update to `registrations`, audit logging, and 100% test coverage.
