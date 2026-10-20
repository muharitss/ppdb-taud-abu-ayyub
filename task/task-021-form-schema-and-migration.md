# Task 021 — Form Schema and Migration

## Status
BLOCKED

## Priority
P1

## Dependencies
- Task 020 — Form Requirements Confirmation (WAITING_FOR_REQUIREMENTS)
- Task 010 — Database Migrations

## Objective
Create Zod schema and database migration for the full registration form, based on confirmed requirements from task 020.

## Context
After task 020 confirms the official form fields and document requirements from the school, this task creates the data layer: Zod validation schemas for client-side and Edge Function use, and database migrations for storing form data and document references.

## Scope
After task 020 confirms requirements:
- Create Zod schema for `registration_form_data` (all confirmed fields with validation rules)
- Create Zod schema for document upload requests
- Write database migration for `registration_form_data` (JSONB column or separate table, TBD after task 020)
- Write database migration for `registration_documents` table (document_type enum, file_path, status)
- Update RLS policies if new tables introduced
- Export types from Zod schemas for TypeScript use

## Out of Scope
- Form UI (task 022)
- Document upload Edge Function (task 023)

## Specifications
- specs/04-data-model.md (confirmed by task 020)
- specs/01-requirements.md (confirmed by task 020)

## Implementation Plan
_To be detailed after task 020 completes._

1. Read confirmed specs from task 020
2. Define Zod schema with all form fields and validation rules
3. Write migration: create/alter tables for form data storage
4. Write migration: `registration_documents` table with document_type enum
5. Apply RLS to new tables
6. Export TypeScript types

## Files Expected to Change
- `src/features/registration/schemas/formSchema.ts` (new)
- `supabase/migrations/YYYYMMDD_registration_form_data.sql` (new)
- `supabase/migrations/YYYYMMDD_registration_documents.sql` (new)

## Security Considerations
- RLS must cover new tables before they are used
- JSONB schema should be validated at the Edge Function layer, not just client-side

## Acceptance Criteria
- [ ] Zod schema covers all confirmed form fields with correct validation rules
- [ ] Database migration for form data applies cleanly
- [ ] `registration_documents` table created with correct enum values
- [ ] RLS applied to new tables
- [ ] TypeScript types exported from Zod schemas
- [ ] Migration tested against local Supabase

## Verification
```bash
supabase db reset
npx tsc --noEmit
```

## Risks
- Schema may need revision if school requirements change after confirmation

## Deliverables
- Zod schema file(s)
- Database migration files

## Completion Notes
BLOCKED pending task-020 (WAITING_FOR_REQUIREMENTS). Implementation plan will be detailed once school requirements are confirmed.
