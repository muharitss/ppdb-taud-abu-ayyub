# Task 022 — Full Form UI

## Status
BLOCKED

## Priority
P1

## Dependencies
- Task 021 — Form Schema & Migration (BLOCKED)
- Task 015 — Registration UI

## Objective
Build the full registration form UI at `/daftar/formulir` where confirmed registrants (payment verified) fill in all official registration details and upload required documents.

## Context
After payment is verified (`payment_verified` status), registrants complete their full registration by filling in all required form fields and uploading required documents. This is the main data collection step of the PPDB process.

## Scope
After tasks 020 and 021 complete:
- Multi-step or single-page form (decision depends on number of confirmed fields)
- All confirmed form fields from task 020 with Zod validation from task 021
- Document uploads for all required documents
- Draft/save feature (if confirmed as needed in task 020)
- Submit → call document-upload Edge Function and form submission logic
- Progress indicator if multi-step

## Out of Scope
- Form field definitions (determined by task 020)
- Schema (task 021)
- Edge Function (task 023)

## Specifications
- specs/01-requirements.md (confirmed by task 020)
- specs/06-ui-conventions.md

## Implementation Plan
_To be detailed after tasks 020 and 021 complete._

## Files Expected to Change
_TBD after task 020 confirms fields._

## Security Considerations
- Access code required to access this page (same verification as other protected pages)
- File uploads go through Edge Function, not direct to Storage
- Draft data (if implemented) stored securely, not in localStorage

## Acceptance Criteria
- [ ] All confirmed form fields present with correct validation
- [ ] All required documents can be uploaded
- [ ] Validation errors shown clearly in Indonesian
- [ ] Form cannot be submitted with missing required fields
- [ ] Success state shown after submission
- [ ] If draft save: draft persisted and restores on revisit

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Number of fields may make form complex — multi-step may be needed
- Mobile UX for multi-document upload needs careful testing

## Deliverables
- Full registration form page at `/daftar/formulir`
- All field and document upload components

## Completion Notes
BLOCKED pending task-020 (WAITING_FOR_REQUIREMENTS) and task-021. Full implementation plan will be written once requirements are confirmed.
