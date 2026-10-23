# Task 019 — Edge Function: admin-review-payment

## Status
DONE

## Priority
P0

## Dependencies
- Task 010 — Database Migrations
- Task 011 — RLS Policies
- Task 012 — Admin Authentication

## Objective
Create Edge Function `admin-review-payment` for admin payment approval and rejection decisions.

## Context
After an admin reviews payment proof in the dashboard (task 018), this Edge Function executes the approval or rejection atomically, updating the relevant statuses and recording the audit trail.

## Scope
1. Create `supabase/functions/admin-review-payment/index.ts`
2. Input: `payment_id` (UUID), `approved` (boolean), `review_notes` (string, required if rejected)
3. Verify caller is authenticated admin (check `auth.users` + `admin_profiles`)
4. **If approved:**
   - Update `payments.status` → `payment_verified`
   - Update `registrations.payment_status` → `payment_verified`
   - Update `registrations.status` → `awaiting_form`
   - Set `payments.reviewed_at = now()`, `payments.reviewed_by = admin_id`
5. **If rejected:**
   - Update `payments.status` → `payment_rejected`
   - Update `registrations.payment_status` → `payment_rejected`
   - Registration `status` stays as `awaiting_payment` so user can re-upload
   - Set `payments.reviewed_at = now()`, `payments.reviewed_by = admin_id`, `payments.review_notes = notes`
6. Log audit event: `actor=admin_id`, `action=payment_approved` or `payment_rejected`, `entity_type=payment`, `entity_id=payment_id`, `metadata={notes}`
7. All DB operations must be atomic (use Supabase RPC / database transaction)

## Out of Scope
- Notifying the registrant (no email/WA API)
- Processing refunds
- Partial approvals

## Specifications
- specs/05-business-workflows.md
- specs/04-data-model.md

## Implementation Plan
1. Scaffold Edge Function
2. Extract JWT from `Authorization` header; verify with Supabase Admin auth
3. Fetch `admin_profiles` record for caller's `user_id` — reject 403 if not found
4. Validate inputs: `payment_id` (valid UUID), `approved` (boolean), `review_notes` (required if `approved=false`)
5. Fetch payment record; verify it exists and is in `payment_submitted` status
6. Create a PostgreSQL RPC function (e.g., `fn_review_payment`) that wraps all DB updates in a transaction
7. Call the RPC from Edge Function with `payment_id`, `approved`, `admin_id`, `review_notes`
8. RPC handles all status updates atomically and inserts `audit_events` record
9. Return `{ success: true, new_status: 'payment_verified' | 'payment_rejected' }`

## Files Expected to Change
- `supabase/functions/admin-review-payment/index.ts` (new)
- `prisma/migrations/20261023000200_fn_review_payment/migration.sql` (new — RPC function)
- `src/features/admin/__tests__/admin-review-payment.test.ts` (new)

## Security Considerations
- Admin role check is server-side only — JWT alone is not sufficient, must verify `admin_profiles` table
- All status transitions validated in RPC — cannot skip `payment_submitted` status
- `review_notes` required for rejection — enforced in Edge Function before calling RPC
- Operations atomic — no partial state if DB error occurs

## Acceptance Criteria
- [x] Non-admin caller receives 403
- [x] Unauthenticated caller receives 401
- [x] Approved payment sets `payment_verified` on both `payments` and `registrations.payment_status`
- [x] Approved payment sets `registrations.status` → `awaiting_form`
- [x] Rejected payment sets `payment_rejected` but does NOT change `registrations.status` (stays `awaiting_payment`)
- [x] `payments.reviewed_at` and `payments.reviewed_by` set correctly
- [x] Audit event recorded with correct actor, action, entity, and metadata
- [x] Rejection without `review_notes` returns 400
- [x] All DB updates are atomic (no partial update on error)

## Verification
```bash
node --experimental-strip-types src/features/admin/__tests__/admin-review-payment.test.ts
npx tsc -b --noEmit
npm run lint
npm run build
```

## Risks
- Supabase Edge Functions do not natively support multi-statement transactions — resolved via PostgreSQL RPC `fn_review_payment`
- Admin JWT verification: handles token expiration and missing auth headers gracefully
- Concurrent review attempts: RPC locks row with `FOR UPDATE` and verifies current status is `payment_submitted`

## Deliverables
- `supabase/functions/admin-review-payment/index.ts`
- `prisma/migrations/20261023000200_fn_review_payment/migration.sql`
- `src/features/admin/__tests__/admin-review-payment.test.ts`

## Completion Notes
Completed 2026-10-23. Implemented Edge Function `admin-review-payment` and atomic PostgreSQL migration `fn_review_payment` with row locking (`FOR UPDATE`), role verification via `admin_profiles`, mandatory rejection notes validation, transition checks (preventing double review via 409), audit log emission, and complete test suite with 100% scenario coverage.
