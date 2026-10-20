# Task 019 — Edge Function: admin-review-payment

## Status
NOT_STARTED

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
- `supabase/migrations/YYYYMMDD_fn_review_payment.sql` (new — RPC function)

## Security Considerations
- Admin role check is server-side only — JWT alone is not sufficient, must verify `admin_profiles` table
- All status transitions validated in RPC — cannot skip `payment_submitted` status
- `review_notes` required for rejection — enforced in Edge Function before calling RPC
- Operations atomic — no partial state if DB error occurs

## Acceptance Criteria
- [ ] Non-admin caller receives 403
- [ ] Unauthenticated caller receives 401
- [ ] Approved payment sets `payment_verified` on both `payments` and `registrations.payment_status`
- [ ] Approved payment sets `registrations.status` → `awaiting_form`
- [ ] Rejected payment sets `payment_rejected` but does NOT change `registrations.status` (stays `awaiting_payment`)
- [ ] `payments.reviewed_at` and `payments.reviewed_by` set correctly
- [ ] Audit event recorded with correct actor, action, entity, and metadata
- [ ] Rejection without `review_notes` returns 400
- [ ] All DB updates are atomic (no partial update on error)

## Verification
```bash
# Deploy locally
supabase functions serve admin-review-payment

# Test approve (with valid admin JWT)
curl -X POST http://localhost:54321/functions/v1/admin-review-payment \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "<uuid>", "approved": true}'

# Test reject without notes (should return 400)
curl -X POST http://localhost:54321/functions/v1/admin-review-payment \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "<uuid>", "approved": false}'

# Test non-admin JWT (should return 403)
```

## Risks
- Supabase Edge Functions do not natively support multi-statement transactions — must use RPC function in PostgreSQL
- Admin JWT verification: need to handle token expiry gracefully
- Concurrent review attempts (two admins reviewing the same payment) — RPC should check current status before updating

## Deliverables
- `supabase/functions/admin-review-payment/index.ts`
- `supabase/migrations/YYYYMMDD_fn_review_payment.sql`

## Completion Notes
_Not started_
