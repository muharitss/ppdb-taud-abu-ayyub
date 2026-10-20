# Task 011 — RLS Policies

## Status
NOT_STARTED

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
3. registration_access policies: service role only (no client access); admin: no direct access
4. payments policies: admin SELECT + UPDATE (for verification); service role: all; anon: none
5. admin_profiles policies: authenticated user can SELECT own profile; admin role can SELECT all; service role: all
6. audit_events policies: admin SELECT; service role INSERT; no UPDATE/DELETE for anyone
7. ppdb_config policies: admin SELECT + UPDATE; authenticated SELECT (allowed keys only or all — confirm); anon: none
8. Test each table from anon, authenticated (non-admin), and admin perspectives
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
2. Write 005_rls_policies.sql:
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE registration_access ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ppdb_config ENABLE ROW LEVEL SECURITY;

   -- registrations: admin only
   CREATE POLICY "admins_all_registrations" ON registrations
     FOR ALL TO authenticated
     USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

   -- registration_access: service role only (no policies = no client access)

   -- payments: admin select/update
   CREATE POLICY "admins_select_payments" ON payments
     FOR SELECT TO authenticated
     USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));
   CREATE POLICY "admins_update_payments" ON payments
     FOR UPDATE TO authenticated
     USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

   -- admin_profiles: own row
   CREATE POLICY "own_admin_profile" ON admin_profiles
     FOR SELECT TO authenticated
     USING (id = auth.uid());

   -- audit_events: admin select, service role insert
   CREATE POLICY "admins_select_audit" ON audit_events
     FOR SELECT TO authenticated
     USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));

   -- ppdb_config: admin all, authenticated select
   CREATE POLICY "admins_all_config" ON ppdb_config
     FOR ALL TO authenticated
     USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));
   CREATE POLICY "authenticated_select_config" ON ppdb_config
     FOR SELECT TO authenticated
     USING (NOT EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid()));
   ```
3. Apply migration: `npx supabase db push`
4. Test from anon client: attempt SELECT on registrations → expect permission denied
5. Test from authenticated non-admin: attempt SELECT on registrations → expect denied
6. Test from admin user: SELECT registrations → expect success
7. Document test results in Completion Notes
8. Apply to remote Supabase
9. Update specs/03-security.md with final policy set

## Files Expected to Change
- supabase/migrations/YYYYMMDDHHMMSS_005_rls_policies.sql (new)
- specs/03-security.md (updated with final policies)

## Security Considerations
- **Anon access to registrations must be blocked** — verify this test passes
- Edge Functions use service_role key → bypass all RLS → ensure Edge Functions validate inputs and never over-return data
- audit_events must be append-only — no UPDATE/DELETE policies for any role
- Admin role check uses admin_profiles existence — do not rely on JWT claims alone
- Test with actual Supabase client calls, not just SQL — JWT context differs from SQL editor (which runs as postgres superuser)

## Acceptance Criteria
- [ ] RLS enabled on all 6 tables
- [ ] Anon cannot SELECT from registrations (verified)
- [ ] Anon cannot SELECT from payments (verified)
- [ ] Anon cannot SELECT from registration_access (verified)
- [ ] Authenticated non-admin cannot SELECT registrations (verified)
- [ ] Admin authenticated user can SELECT all registrations (verified)
- [ ] Admin can SELECT and UPDATE payments (verified)
- [ ] Authenticated user can SELECT own admin_profiles row only (verified)
- [ ] Audit events: admin can SELECT; no UPDATE/DELETE policy exists (verified)
- [ ] ppdb_config accessible per policy (verified)
- [ ] Migration applies cleanly to local and remote
- [ ] specs/03-security.md updated with final policies

## Verification
```bash
# Apply migration
npx supabase db push

# Test via Supabase client (anon key) — should fail
# Run a quick test script:
# node -e "
#   const { createClient } = require('@supabase/supabase-js');
#   const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
#   client.from('registrations').select('*').then(console.log);
# "
# Expected: { data: [], error: null } (empty, RLS filters all) or error
```

## Risks
- Recursive policy issue: admin_profiles policy checking admin_profiles could cause infinite recursion — use a security definer function if needed
- Service role always bypasses RLS — Edge Functions must implement their own input validation
- Overly permissive policy accidentally — test each scenario explicitly

## Deliverables
- 005_rls_policies.sql migration
- RLS enabled and tested on all 6 tables
- Updated specs/03-security.md

## Completion Notes
_Not started_
