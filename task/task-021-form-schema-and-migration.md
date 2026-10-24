# Task 021 — Form Schema and Migration

## Status
DONE

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
3. Create migration `supabase/migrations/YYYYMMDD_document_type_enum.sql` — `CREATE TYPE document_type AS ENUM ('kartu_keluarga','akte_kelahiran')`
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
- [x] Zod schema covers all 4 confirmed sections with correct validation rules (NIK 16 digit, date ISO-8601, enums, optional fields)
- [x] `document_type` enum created in DB
- [x] `registration_form_data` migration applies cleanly (UNIQUE on registration_id, `updated_at` trigger)
- [x] `registration_documents` migration applies cleanly (UNIQUE on registration_id + document_type)
- [x] RLS applied to both new tables
- [x] TypeScript types exported from Zod schemas
- [x] Migration tested: `npx prisma generate` and unit test pass

## Verification
```bash
node --experimental-strip-types src/features/registration/__tests__/form-schema.test.ts
npx prisma generate
npx tsc -b --noEmit
npm run lint
npm run build
```

## Risks
- Schema may need revision if school requirements change after confirmation

## Deliverables
- Zod schema file: `src/features/registration/schemas/formSchema.ts`
- Database migration file: `prisma/migrations/20261023000300_registration_form_and_documents/migration.sql`
- Updated Prisma schema: `prisma/schema.prisma`
- Unit tests: `src/features/registration/__tests__/form-schema.test.ts`

## Completion Notes
Completed 2026-10-23.
1. Implemented Zod schema in `src/features/registration/schemas/formSchema.ts` covering `childSchema`, `fatherSchema`, `motherSchema`, `healthSchema`, and `registrationFormSchema`, as well as `documentTypeSchema`.
2. Exported TypeScript types (`ChildFormData`, `ParentFormData`, `FatherFormData`, `MotherFormData`, `HealthFormData`, `RegistrationFormData`, `DocumentType`).
3. Added `DocumentType` enum, `RegistrationDocument` model, and `RegistrationFormData` model to `prisma/schema.prisma`.
4. Created migration `prisma/migrations/20261023000300_registration_form_and_documents/migration.sql` with enum, tables, constraints, updated_at trigger, and admin SELECT RLS policies.
5. Re-generated Prisma client (`npx prisma generate`).
6. Verified with unit tests (`src/features/registration/__tests__/form-schema.test.ts`), strict TypeScript check (`npx tsc -b --noEmit`), linter (`npm run lint`), and production build (`npm run build`). Tasks 022 and 023 are unblocked.
