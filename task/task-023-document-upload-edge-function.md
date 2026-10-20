# Task 023 — Edge Function: document-upload

## Status
BLOCKED

## Priority
P0

## Dependencies
- Task 021 — Form Schema & Migration (BLOCKED)
- Task 010 — Database Migrations

## Objective
Create Edge Function for document upload to private Supabase Storage bucket `registration-documents`.

## Context
When registrants submit the full registration form (task 022), their required documents are uploaded through this Edge Function. The function validates, stores, and records each document securely in a private bucket.

## Scope
After task 021 confirms document types:
- Create `supabase/functions/document-upload/index.ts`
- Input: `registration_number`, `access_code`, `document_type` (enum from task 021), `file` (multipart)
- Verify access code
- Verify registration is in `awaiting_form` status
- Validate file server-side (MIME type, size — specs TBD by task 020)
- Upload to private `registration-documents` bucket with path: `{registration_id}/{document_type}-{timestamp}.{ext}`
- Upsert `registration_documents` record (replace if re-uploading same document type)
- Log audit event

## Out of Scope
- Document verification (admin responsibility)
- Serving documents (signed URLs generated in admin views)

## Specifications
- specs/05-business-workflows.md
- specs/04-data-model.md (confirmed by task 020)

## Implementation Plan
_To be detailed after task 021 completes._

## Files Expected to Change
- `supabase/functions/document-upload/index.ts` (new)

## Security Considerations
- Private bucket — no public access
- Server-side MIME validation (read file header bytes)
- Access code verified before accepting any file
- Document type validated against confirmed enum

## Acceptance Criteria
- [ ] File stored in private `registration-documents` bucket
- [ ] `registration_documents` record upserted correctly
- [ ] Invalid file type rejected
- [ ] File size limit enforced
- [ ] Invalid access code rejected with 401
- [ ] Wrong registration status rejected with 409
- [ ] Audit event logged

## Verification
```bash
supabase functions serve document-upload
# Test with each document type
# Test with invalid file type
# Test with wrong access code
```

## Risks
- Document type enum may be large — validate against DB or hardcoded list
- Re-upload scenario: upsert must replace previous file in storage too (delete old file before uploading new)

## Deliverables
- `supabase/functions/document-upload/index.ts`

## Completion Notes
BLOCKED pending task-020 (WAITING_FOR_REQUIREMENTS) and task-021. Implementation plan will be detailed once document types are confirmed.
