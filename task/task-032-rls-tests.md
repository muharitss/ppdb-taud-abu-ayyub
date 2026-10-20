# Task 032 — RLS Policy Tests

## Status
NOT_STARTED

## Priority
P0

## Dependencies
- Task 011 — RLS Policies

## Objective
Write and run Row-Level Security (RLS) policy tests to verify that data access controls are correctly enforced at the database level.

## Context
RLS policies are the database-level security boundary for all Supabase tables. They must be rigorously tested to ensure that anonymous users, authenticated non-admin users, and admin users have exactly the right access — no more, no less.

## Scope
1. Test: anon user cannot `SELECT` from `registrations`
2. Test: anon user cannot `INSERT` into `payments`
3. Test: admin user can `SELECT` all `registrations`
4. Test: authenticated non-admin user cannot access another registrant's data
5. Test: Edge Function service role can write to all tables (verify service role bypass)
6. Use Supabase test utilities or pgTAP

## Out of Scope
- Application-level auth testing (task 033)
- Edge Function input validation testing

## Specifications
- specs/03-security.md
- specs/07-testing-strategy.md

## Implementation Plan
1. Choose test approach: pgTAP (PostgreSQL testing framework) or Supabase CLI test runner
2. Install pgTAP if using pgTAP: available via `supabase test` framework
3. Write test file: `supabase/tests/rls_policies_test.sql`
4. Test cases:
   - Connect as `anon`, attempt `SELECT * FROM registrations` — expect 0 rows
   - Connect as `anon`, attempt `INSERT INTO payments` — expect permission denied
   - Connect as admin user, `SELECT * FROM registrations` — expect all rows
   - Connect as user A, attempt `SELECT * FROM registrations WHERE id = user_B_registration_id` — expect 0 rows
5. Run: `supabase test db`
6. Integrate into CI (if applicable)

## Files Expected to Change
- `supabase/tests/rls_policies_test.sql` (new)

## Security Considerations
This task IS the security verification. Failing tests mean a real security vulnerability. All tests must pass before production deployment (task 034).

## Acceptance Criteria
- [ ] Anon cannot `SELECT` from `registrations` — test passes
- [ ] Anon cannot `INSERT` into `payments` — test passes
- [ ] Admin can `SELECT` all `registrations` — test passes
- [ ] Authenticated non-admin cannot see other registrants' data — test passes
- [ ] All RLS tests pass via `supabase test db`
- [ ] Tests run against local Supabase (not production)

## Verification
```bash
supabase start
supabase test db
```

## Risks
- **CRITICAL**: If RLS tests are skipped and policies are misconfigured, production data could be exposed
- pgTAP setup may require additional configuration — document setup steps
- Tests must be re-run after any migration that alters RLS policies

## Deliverables
- `supabase/tests/rls_policies_test.sql`
- All tests passing

## Completion Notes
_Not started_
