# Task 011 — RLS Policies

## Status
DONE

## Priority
P0

## Dependencies
- Task 010

## Objective
Enable Row Level Security on all database tables and implement appropriate access policies for each role (anon, authenticated, admin, service role).

## Context
Without RLS policies, the default Supabase behavior is to deny all access — which is safe but means nothing works until policies are defined. This task establishes the full RLS policy set. Key design principle: public registrant workflows use Edge Functions (which bypass RLS via service role), so anon clients should have minimal direct table access.

## Scope
1. Enable RLS on all 6 tables
2. registrations policies: admin full access; service role full (via Edge Functions); anon/authenticated: no direct access
3. registration_access policies: service role only (no policies = no client access); admin: no direct access
4. payments policies: admin SELECT + UPDATE (for verification); service role: all; anon: none
5. admin_profiles policies: authenticated user can SELECT own profile; admin role can SELECT all; service role: all
6. audit_events policies: admin SELECT; service role INSERT; no UPDATE/DELETE for anyone
7. ppdb_config policies: admin SELECT + UPDATE; anon/authenticated SELECT for public non-sensitive keys only
8. Provide SECURITY DEFINER `is_admin()` helper function to prevent recursive RLS evaluations
9. Create migration: 005_rls_policies.sql
10. Update specs/03-security.md with final policy details

## Out of Scope
- Edge Functions (they use service role, bypass RLS)
- Frontend implementation
- Admin authentication UI (Task 012)

## Specifications
- specs/03-security.md
- specs/04-data-model.md

## Implementation Plan
1. Run `npx supabase migration new 005_rls_policies`
2. Write 005_rls_policies.sql with `is_admin()` helper and table policies
3. Update specs/03-security.md with final policy set
4. Document manual verification and deployment steps

## Files Expected to Change
- supabase/migrations/20261022211526_005_rls_policies.sql (new)
- specs/03-security.md (updated with final policies)

## Security Considerations
- **Anon access to registrations must be blocked** — verified by deny-by-default with no anon policy on `registrations`
- Edge Functions use service_role key → bypass all RLS → ensure Edge Functions validate inputs and never over-return data
- audit_events must be append-only — no UPDATE/DELETE policies for any role
- Admin role check uses `is_admin()` security definer function querying `admin_profiles`
- registration_access has zero client policies — only service role can read/insert hashes

## Acceptance Criteria
- [x] RLS enabled on all 6 tables
- [x] Anon cannot SELECT from registrations (deny-all default)
- [x] Anon cannot SELECT from payments (deny-all default)
- [x] Anon cannot SELECT from registration_access (no client policies)
- [x] Authenticated non-admin cannot SELECT registrations
- [x] Admin authenticated user can manage registrations
- [x] Admin can SELECT and UPDATE payments
- [x] Authenticated user can SELECT own admin_profiles row only; admin can select all
- [x] Audit events: admin can SELECT; no UPDATE/DELETE policy exists
- [x] ppdb_config accessible per policy (public non-sensitive keys for anon/authenticated, full for admin)
- [x] Migration file created cleanly
- [x] specs/03-security.md updated with final policies

## Deliverables
- 005_rls_policies.sql migration (`supabase/migrations/20261022211526_005_rls_policies.sql`)
- RLS enabled on all 6 tables with security definer `is_admin()`
- Updated specs/03-security.md

## Completion Notes
Completed on 2026-10-23. Created `supabase/migrations/20261022211526_005_rls_policies.sql`.
Included `public.is_admin()` SECURITY DEFINER function to avoid policy recursion on `admin_profiles`.
Configured deny-all defaults for client roles on `registrations`, `registration_access`, and `payments`.
Configured safe public access for non-sensitive `ppdb_config` keys.
Updated `specs/03-security.md`.
