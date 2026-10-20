# Task 017 — Edge Function: submit-payment-proof

## Status
NOT_STARTED

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
3. Verify access using the same access-code verification logic as `verify-registration-access`
4. Verify `registration_status` is `awaiting_payment` before accepting upload
5. Validate file server-side: MIME type (image/jpeg, image/png, application/pdf), size ≤ 5MB
6. Upload to private Supabase Storage bucket `payment-proofs` with path: `{registration_id}/{timestamp}-proof.{ext}`
7. Insert into `payments` table: `status=payment_submitted`, `proof_file_path`
8. Update registration `payment_status` to `payment_submitted`
9. Return success response with status
10. Log audit event: `action=payment_proof_submitted`, `entity_type=registration`, `entity_id=registration_id`

## Out of Scope
- Payment verification (handled by admin in task 019)
- Email/SMS notifications
- Multiple proof upload attempts management (handled by business rules)

## Specifications
- specs/05-business-workflows.md
- specs/04-data-model.md

## Implementation Plan
1. Scaffold Edge Function with Deno + TypeScript
2. Parse multipart form data (use `multipart/form-data` parsing)
3. Extract and validate `registration_number` + `access_code`
4. Look up registration; verify access code (bcrypt compare)
5. Check `registration_status === 'awaiting_payment'`
6. Validate file MIME type and size
7. Generate storage path: `{registration_id}/{Date.now()}-proof.{ext}`
8. Upload file to `payment-proofs` private bucket via Supabase Storage API
9. Insert `payments` record with `status='payment_submitted'` and `proof_file_path`
10. Update `registrations.payment_status = 'payment_submitted'`
11. Insert `audit_events` record
12. Return `{ success: true, status: 'payment_submitted' }`

## Files Expected to Change
- `supabase/functions/submit-payment-proof/index.ts` (new)
- `supabase/functions/submit-payment-proof/deno.json` (new, if needed)

## Security Considerations
- Private bucket: `payment-proofs` must have no public access policy
- Server-side file validation is the security boundary — MIME type sniffing (read file header bytes), not just Content-Type header
- Access code verified via bcrypt before accepting any file
- Status check prevents double-submission if already past `awaiting_payment`
- Service role key used for storage upload, never exposed to client

## Acceptance Criteria
- [ ] File stored in private `payment-proofs` bucket at correct path
- [ ] `payments` record created with `status=payment_submitted` and correct `proof_file_path`
- [ ] `registrations.payment_status` updated to `payment_submitted`
- [ ] Invalid file type (e.g., .exe, .zip) rejected with 400
- [ ] Files > 5MB rejected with 400 before upload attempt
- [ ] Invalid or expired access code rejected with 401
- [ ] Wrong `registration_status` (not `awaiting_payment`) rejected with 409
- [ ] Audit event logged with correct fields
- [ ] Edge Function returns correct CORS headers

## Verification
```bash
# Deploy to local Supabase
supabase functions serve submit-payment-proof

# Test with valid file
curl -X POST http://localhost:54321/functions/v1/submit-payment-proof \
  -F "registration_number=PPDB-2026-00001" \
  -F "access_code=ABCD1234" \
  -F "file=@/path/to/proof.jpg"

# Test file too large
# Test invalid file type
# Test wrong access code
```

## Risks
- Multipart parsing in Deno Edge Function environment may require a library — verify compatibility
- Large file uploads may hit Edge Function memory limits — enforce 5MB hard cap early
- Race condition if user submits twice concurrently — use DB constraint or idempotency check

## Deliverables
- `supabase/functions/submit-payment-proof/index.ts`
- Tested locally and deployed to staging Supabase

## Completion Notes
_Not started_
