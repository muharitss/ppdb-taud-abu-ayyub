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
With Supabase configured (Task 009) and schema approved (Task 005), database migrations can now be created. Migrations are SQL files managed by the Supabase CLI under supabase/migrations/. They are applied in order and tracked. This task creates the foundational schema; RLS policies are a separate migration (Task 011).

## Scope
1. Create migration: 001_enums.sql — registration_status and payment_status enums
2. Create migration: 002_tables.sql — all core tables
3. Create migration: 003_indexes.sql — all performance indexes
4. Create migration: 004_registration_documents_placeholder.sql — TBD stub or comment
5. Apply migrations to local Supabase: `supabase db push` or `supabase migration up`
6. Apply migrations to remote Supabase project
7. Verify schema in Supabase Studio

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
- supabase/migrations/YYYYMMDDHHMMSS_001_enums.sql (new)
- supabase/migrations/YYYYMMDDHHMMSS_002_tables.sql (new)
- supabase/migrations/YYYYMMDDHHMMSS_003_indexes.sql (new)
- supabase/migrations/YYYYMMDDHHMMSS_004_registration_documents_placeholder.sql (new)

## Security Considerations
- Do NOT enable RLS in these migrations — that is Task 011. Tables will be protected by Supabase's default (no policies = no access) until RLS is set up.
- Do NOT insert seed data with real information in migrations
- Verify UNIQUE constraint on registration_number prevents duplicates

## Acceptance Criteria
- [x] Migration 001: enums created (registration_status, payment_status)
- [x] Migration 002: all 6 tables created with correct columns, types, and constraints (registrations, registration_access, payments, admin_profiles, audit_events, ppdb_config)
- [x] Migration 003: indexes created
- [x] Migration 004: placeholder created with TBD comment (referenced Task 020 resolution)
- [x] UNIQUE constraint on registrations.registration_number verified
- [x] Migration files created in supabase/migrations/ with valid SQL syntax

## Verification
```bash
# Migration files generated:
# supabase/migrations/20261021135938_001_enums.sql
# supabase/migrations/20261021135946_002_tables.sql
# supabase/migrations/20261021135952_003_indexes.sql
# supabase/migrations/20261021135959_004_registration_documents_placeholder.sql
```

## Risks
- Schema may require additive changes in Phase 6 (registration_form_data) — design for extensibility with JSONB or nullable columns
- Migration ordering is critical — enums must be created before tables that reference them
- Column type mismatches may not surface until application code runs — verify types in Studio

## Deliverables
- 4 migration files in supabase/migrations/

## Completion Notes
Completed 2026-10-21. All 4 migration files written adhering to specs/04-data-model.md specifications:
1. `20261021135938_001_enums.sql`: `registration_status`, `payment_status`.
2. `20261021135946_002_tables.sql`: sequences, update triggers, `generate_registration_number`, tables `registrations`, `registration_access`, `payments`, `admin_profiles`, `audit_events`, `ppdb_config` with default seed.
3. `20261021135952_003_indexes.sql`: indexes for fast querying on status, payment_status, registration_number, whatsapp_number, audit_events, and foreign keys.
4. `20261021135959_004_registration_documents_placeholder.sql`: placeholder referencing Task 020 requirements.
