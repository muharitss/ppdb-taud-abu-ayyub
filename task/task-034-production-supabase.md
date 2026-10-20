# Task 034 — Production Supabase Setup

## Status
NOT_STARTED

## Priority
P0

## Dependencies
- Task 010 — Database Migrations
- Task 011 — RLS Policies
- Task 013 — Edge Function: create-registration
- Task 014 — Edge Function: verify-registration-access
- Task 017 — Edge Function: submit-payment-proof
- Task 019 — Edge Function: admin-review-payment

## Objective
Apply all database migrations and deploy all Edge Functions to the production Supabase project.

## Context
Before going live, all database schema, RLS policies, and Edge Functions must be deployed to the production Supabase project. Storage buckets must be created with private access. An initial admin user must be created.

## Scope
1. Create production Supabase project (if not already created)
2. Link project: `supabase link --project-ref <ref>`
3. Apply all migrations: `supabase db push --linked`
4. Deploy all Edge Functions: `supabase functions deploy`
5. Create storage buckets in production:
   - `payment-proofs` — private
   - `registration-documents` — private
6. Verify RLS is enabled on all tables
7. Create initial admin user via Supabase Auth invite (email invite)
8. Insert `admin_profiles` record for the initial admin
9. Smoke test: verify tables exist, Edge Functions respond, storage buckets created

## Out of Scope
- Frontend deployment (task 035)
- Go-live announcement

## Specifications
- specs/08-deployment.md
- specs/03-security.md

## Implementation Plan
1. Create production Supabase project via dashboard
2. Run `supabase link --project-ref <production-ref>`
3. Run `supabase db push --linked` — verify all migrations applied
4. Run `supabase functions deploy --project-ref <production-ref>` for each function:
   - `create-registration`
   - `verify-registration-access`
   - `submit-payment-proof`
   - `admin-review-payment`
   - `document-upload` (after task 023)
5. Create `payment-proofs` bucket: private, no public access
6. Create `registration-documents` bucket: private, no public access
7. Go to Supabase dashboard → Authentication → Invite admin user
8. Run SQL to insert `admin_profiles` record for invited user
9. Smoke test each Edge Function with a test request
10. Verify RLS enabled on all tables in Supabase dashboard

## Files Expected to Change
- `supabase/.temp/` (Supabase CLI state — not committed)
- Production Supabase configuration (no file changes — done via CLI/dashboard)

## Security Considerations
- **CRITICAL**: Verify no table has RLS disabled in production
- **CRITICAL**: Verify storage buckets are private (no public URL access)
- **CRITICAL**: Service role key must NEVER be in frontend code or `.env` committed to repo
- `VITE_SUPABASE_ANON_KEY` for frontend (safe), `SUPABASE_SERVICE_ROLE_KEY` for Edge Functions only
- Admin user created via invite (not direct password set) for security

## Acceptance Criteria
- [ ] All migrations applied — `supabase migration list` shows all as applied
- [ ] All Edge Functions deployed and responding to health checks
- [ ] `payment-proofs` bucket exists and is private
- [ ] `registration-documents` bucket exists and is private
- [ ] RLS enabled on all tables (verify via dashboard or `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`)
- [ ] Initial admin user created and can log in
- [ ] `admin_profiles` record exists for admin user

## Verification
```bash
# Link and push
supabase link --project-ref <ref>
supabase db push --linked

# Deploy functions
supabase functions deploy

# Check RLS
supabase db inspect

# Health check Edge Functions
curl https://<project-ref>.supabase.co/functions/v1/create-registration \
  -X POST -H "Content-Type: application/json" -d '{}'
# Expect 400 (validation error), not 500 or network error
```

## Risks
- Free tier Supabase limits: 500MB DB, 1GB storage, 500K Edge Function invocations/month — confirm tier before go-live
- Migration conflicts if local dev diverged from migrations — test `supabase db push` on staging first
- Admin user email delivery — confirm Supabase email is configured or use custom SMTP

## Deliverables
- Production Supabase project with all migrations applied
- All Edge Functions deployed
- Private storage buckets created
- Initial admin user provisioned

## Completion Notes
_Not started_
