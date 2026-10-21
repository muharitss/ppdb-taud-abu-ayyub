# Task 021 — Form Schema and Migration

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 020 — Form Requirements Confirmation (**DONE**)
- Task 010 — Database Migrations

## Objective
Create Zod schema and database migration for the full registration form, based on confirmed requirements from task 020.

## Context
After task 020 confirms the official form fields and document requirements from the school, this task creates the data layer: Zod validation schemas for client-side and Edge Function use, and database migrations for storing form data and document references.

## Scope
- Create Zod schema `registrationFormSchema` covering all 4 sections: child, father, mother, health (see task-020 for full field list and `specs/04-data-model.md` for JSON shape)
- Add `document_type` enum to Zod and DB
- Write migration: `registration_form_data` table (JSONB) + `registration_documents` table + `document_type` enum
- Update RLS policies for both new tables
- Export TypeScript types from Zod schemas

## Implementation Plan
1. Create `src/features/registration/schemas/formSchema.ts` — define `registrationFormSchema` (4 sub-schemas: `childSchema`, `fatherSchema`, `motherSchema`, `healthSchema`) using field list in task-020
2. Export `RegistrationFormData` TypeScript type from Zod inference
3. Create migration `supabase/migrations/YYYYMMDD_document_type_enum.sql` — `CREATE TYPE document_type AS ENUM ('kartu_keluarga','akte_kelahiran','pas_foto')`
4. Create migration `supabase/migrations/YYYYMMDD_registration_form_data.sql` — table + `updated_at` trigger
5. Create migration `supabase/migrations/YYYYMMDD_registration_documents.sql` — table with UNIQUE(registration_id, document_type)
6. Add RLS policies: service role only insert/update; admin SELECT
7. Run `supabase db reset` locally to verify

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
- `supabase/migrations/YYYYMMDD_document_type_enum.sql` (new)
- `supabase/migrations/YYYYMMDD_registration_form_data.sql` (new)
- `supabase/migrations/YYYYMMDD_registration_documents.sql` (new)
- `supabase/migrations/YYYYMMDD_rls_form_tables.sql` (new)

## Security Considerations
- RLS must cover new tables before they are used
- JSONB schema should be validated at the Edge Function layer, not just client-side

## Acceptance Criteria
- [ ] Zod schema covers all 4 confirmed sections with correct validation rules (NIK 16 digit, date ISO-8601, enums, optional fields)
- [ ] `document_type` enum created in DB
- [ ] `registration_form_data` migration applies cleanly (UNIQUE on registration_id, `updated_at` trigger)
- [ ] `registration_documents` migration applies cleanly (UNIQUE on registration_id + document_type)
- [ ] RLS applied to both new tables
- [ ] TypeScript types exported from Zod schemas
- [ ] Migration tested: `supabase db reset` passes

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
Unblocked 2026-10-21. Requirements confirmed in task-020. Ready to implement.
