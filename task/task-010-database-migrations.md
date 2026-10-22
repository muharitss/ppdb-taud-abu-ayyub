# Task 010 — Database Migrations

## Status
DONE

## Priority
P0

## Dependencies
- Task 005
- Task 009

## Objective
Create and apply the initial database migrations for all approved tables and enums based on the confirmed schema from specs/04-data-model.md.

## Context
With Supabase configured (Task 009) and schema approved (Task 005), database migrations are managed via **Prisma** (`prisma/schema.prisma` + `prisma/migrations/`). Prisma models the core tables, enums, and indexes, while PostgreSQL-specific objects (`generate_registration_number`, `set_updated_at` triggers, sequences, and default `ppdb_config` seed) are appended in the initial Prisma migration SQL. This task creates the foundational schema; RLS policies are in a separate migration (Task 011).

## Scope
1. Define `prisma/schema.prisma` with `RegistrationStatus` and `PaymentStatus` enums and all 6 core models (`Registration`, `RegistrationAccess`, `Payment`, `AdminProfile`, `AuditEvent`, `PpdbConfig`) and their indexes
2. Create initial Prisma migration `prisma/migrations/20261023000000_init/migration.sql` including sequences, triggers, `generate_registration_number`, and default `ppdb_config` seed
3. Apply migrations to remote Supabase database (`npx prisma migrate deploy`) and generate Prisma Client (`npx prisma generate`)
4. Defer `registration_documents` and `registration_form_data` models to Task 021

## Out of Scope
- RLS policies (Task 011)
- Edge Functions
- registration_form_data table (Phase 6 — BLOCKED on school requirements)
- Seed data

## Specifications
- specs/04-data-model.md

## Implementation Plan
1. Run `npx supabase migration new 001_enums`
2. Write 001_enums.sql:
   ```sql
   CREATE TYPE registration_status AS ENUM (
     'draft',
     'awaiting_payment',
     'awaiting_form',
     'submitted',
     'under_review',
     'accepted',
     'rejected'
   );

   CREATE TYPE payment_status AS ENUM (
     'payment_pending',
     'payment_submitted',
     'payment_verified',
     'payment_rejected'
   );
   ```
3. Run `npx supabase migration new 002_tables`
4. Write 002_tables.sql with all tables:
   - registrations (id, registration_number UNIQUE, child_name, parent_name, whatsapp_number, registration_status, payment_status, created_at, updated_at, submitted_at)
   - registration_access (id, registration_id FK, access_code_hash, attempts, last_attempt_at, created_at)
   - payments (id, registration_id FK, payment_method, amount, payment_proof_url, submitted_at, verified_at, verified_by FK, rejected_reason, payment_status, created_at, updated_at)
   - admin_profiles (id FK auth.users, full_name, email, role, created_at)
   - audit_events (id, registration_id FK nullable, admin_id FK nullable, action, old_value jsonb, new_value jsonb, created_at)
   - ppdb_config (key PK, value jsonb, updated_at, updated_by FK nullable)
5. Run `npx supabase migration new 003_indexes`
6. Write 003_indexes.sql — indexes on frequently queried columns
7. Run `npx supabase migration new 004_registration_documents_placeholder`
8. Write placeholder with comment: -- registration_documents table TBD pending document requirements
9. Apply locally: `npx supabase db push`
10. Verify tables in Supabase Studio (local)
11. Apply to remote: `npx supabase db push --db-url <remote-db-url>` or via dashboard
12. Verify in remote Supabase Studio

## Files Expected to Change
- `prisma/schema.prisma` (new)
- `prisma.config.ts` (new)
- `prisma/migrations/migration_lock.toml` (new)
- `prisma/migrations/20261023000000_init/migration.sql` (new)

## Security Considerations
- Do NOT enable RLS in this migration — that is Task 011.
- Do NOT insert seed data with real applicant information in migrations
- Verify UNIQUE constraint on `registration_number` prevents duplicates

## Acceptance Criteria
- [x] Enums created (`registration_status`, `payment_status`)
- [x] All 6 tables created with correct columns, types, and constraints (`registrations`, `registration_access`, `payments`, `admin_profiles`, `audit_events`, `ppdb_config`)
- [x] Performance and lookup indexes created
- [x] `registration_documents` and `registration_form_data` deferred cleanly to Task 021
- [x] UNIQUE constraint on `registrations.registration_number` verified
- [x] Migration applied to Supabase database via Prisma (`npx prisma migrate deploy`) and client generated (`npx prisma generate`)

## Verification
```bash
npx prisma migrate status
npx prisma generate
```

## Risks
- Schema will require additive changes in Phase 6 (`registration_form_data` & `registration_documents` in Task 021)
- Migration ordering is critical — enums must be created before tables that reference them
- Cross-schema FKs to `auth.users` are omitted so Prisma only manages the `public` schema without introspecting Supabase internal `auth` tables

## Deliverables
- `prisma/schema.prisma` and `prisma/migrations/20261023000000_init/migration.sql`

## Completion Notes
Completed 2026-10-21 (Migrated to Prisma on 2026-10-23). Schema and initial migration adhere to `specs/04-data-model.md`:
1. `prisma/schema.prisma`: Models `Registration`, `RegistrationAccess`, `Payment`, `AdminProfile`, `AuditEvent`, `PpdbConfig` and enums `RegistrationStatus`, `PaymentStatus`.
2. `prisma/migrations/20261023000000_init/migration.sql`: Core DDL, indexes, `ppdb_registration_seq`, `generate_registration_number`, `set_updated_at` triggers, and default `ppdb_config` seed.
3. Applied to remote Supabase PostgreSQL and verified with `npx prisma generate`.
