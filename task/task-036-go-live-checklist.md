# Task 036 — Go-Live Checklist & Verification

## Status
NOT_STARTED

## Priority
P0

## Dependencies
- Task 033 — End-to-End Tests
- Task 034 — Production Supabase Setup
- Task 035 — Vercel Deployment

## Objective
Execute the full comprehensive go-live verification checklist before announcing the PPDB system to prospective parents and school stakeholders.

## Context
Before opening registrations to the public, every aspect of security, user flow, admin operations, and backup readiness must be explicitly verified in the live production environment.

## Scope
1. **Security & Data Isolation Audit**:
   - [ ] Confirm RLS is enabled and active on all tables in production
   - [ ] Confirm anon requests cannot query `registrations`, `payments`, or `audit_events`
   - [ ] Confirm storage buckets (`payment-proofs`, `registration-documents`) are strictly private
   - [ ] Verify that no `SUPABASE_SERVICE_ROLE_KEY` is present in any client bundle or git commit
   - [ ] Verify rate limiting on status check endpoint
2. **End-to-End Live User Flow Test**:
   - [ ] Initial registration creates registration number and access code
   - [ ] Access code displayed once; user alerted to save it
   - [ ] Upload payment proof image works cleanly
   - [ ] Status page reflects `payment_submitted`
   - [ ] WhatsApp button generates correct `https://wa.me/...` URL with encoded parameters
   - [ ] Admin dashboard receives new registrant and payment proof
   - [ ] Admin reviews and approves payment
   - [ ] Status page updates to `awaiting_form` or `payment_verified`
   - [ ] Fill full form and submit documents (when unblocked)
   - [ ] Final status page reflects `submitted`
3. **Admin Operations Verification**:
   - [ ] Admin login functions securely
   - [ ] Public signup is impossible / disabled
   - [ ] Audit logs capture approval/rejection actions with timestamps
4. **Resilience & Backup**:
   - [ ] Supabase automatic backup verified or manual backup exported
   - [ ] Documented rollback procedure ready
   - [ ] Contact details for technical emergency on standby

## Out of Scope
- Marketing campaigns or school social media announcements

## Specifications
- specs/08-deployment.md
- specs/03-security.md
- specs/07-testing-strategy.md

## Implementation Plan
1. Run pre-flight checklist against production deployment.
2. Execute a simulated end-to-end registration using test parent account.
3. Verify all status transitions in database and UI.
4. Clean up test registration data or mark as test account.
5. Sign off on production readiness with school management.

## Files Expected to Change
- None (operational sign-off task)

## Security Considerations
- Test registrant data must be cleaned up or clearly isolated from legitimate parent submissions.
- Ensure test files in storage buckets are purged if necessary.

## Acceptance Criteria
- [ ] All checklist items in `specs/08-deployment.md` pass
- [ ] Live test registration completes from start to finish
- [ ] Admin successfully verifies test payment
- [ ] No errors in browser console or Supabase logs
- [ ] System declared ready for public launch

## Verification
```bash
# Verify no secrets in git history or dist bundle
grep -rn "service_role" dist/ || echo "Clean"
git log -p | grep "service_role" || echo "Clean"
```

## Risks
- Unexpected traffic spike or storage quota exhaustion on free tier.
  *Mitigation:* Monitor Supabase dashboard metrics daily during active registration period.

## Deliverables
- Completed and signed off Go-Live Verification Report.

## Completion Notes
_Not started_
