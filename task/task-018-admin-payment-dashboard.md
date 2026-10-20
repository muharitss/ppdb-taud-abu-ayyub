# Task 018 — Admin Payment Dashboard

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 012 — Admin Authentication
- Task 017 — Edge Function: submit-payment-proof

## Objective
Build admin payment review dashboard where administrators can view pending payment submissions, review proof images, and approve or reject payments.

## Context
After a registrant uploads payment proof, an admin must verify it manually. This dashboard provides the interface for that review workflow. Payment proofs are stored in a private bucket and accessed via short-lived signed URLs.

## Scope
1. Admin page `/admin` — list of pending payments (`payment_submitted` status)
2. Payment detail page `/admin/pendaftar/:id` — show registration info + payment proof image/PDF
3. Signed URL generation for viewing payment proof (short-lived, e.g. 1 hour)
4. Approve button → calls `admin-review-payment` Edge Function with `approved=true`
5. Reject button with required notes field → calls Edge Function with `approved=false` + reason
6. Status update reflected in UI (invalidate TanStack Query cache after action)
7. Use shadcn components: `Table`, `Badge`, `Dialog`, `Button`, `Textarea`

## Out of Scope
- Bulk approve/reject
- Email notifications to registrant
- Payment amount verification (manual process, admin's responsibility)

## Specifications
- specs/05-business-workflows.md
- specs/07-testing-strategy.md

## Implementation Plan
1. Create admin route layout with auth guard (redirect to `/admin/login` if not authenticated)
2. Build `/admin` pending payments list: fetch registrations with `payment_status=payment_submitted`
3. Display list with shadcn `Table`: registration_number, child_name, submitted_at, status `Badge`
4. Build `/admin/pendaftar/:id` detail page
5. Fetch registration details + payment record
6. Generate signed URL for `proof_file_path` via Supabase Storage (1h expiry)
7. Render proof: `<img>` for JPEG/PNG, `<iframe>` or link for PDF
8. Approve button: calls `admin-review-payment` with `approved=true`
9. Reject flow: open shadcn `Dialog` with `Textarea` for notes (required), then call Edge Function
10. On success: invalidate TanStack Query cache, show Sonner toast, update UI

## Files Expected to Change
- `src/features/admin/pages/AdminPaymentListPage.tsx` (new)
- `src/features/admin/pages/AdminRegistrantDetailPage.tsx` (new or extend)
- `src/features/admin/components/PaymentReviewCard.tsx` (new)
- `src/features/admin/components/RejectDialog.tsx` (new)
- `src/lib/api/admin.ts` (extend with payment review calls)
- `src/router.tsx` (add admin routes)

## Security Considerations
- Admin auth guard on all `/admin/*` routes — redirect if not authenticated
- Signed URLs expire in 1 hour — never expose permanent storage URLs
- Payment proof files must not be publicly accessible (private bucket)
- Reject action requires notes — enforced both client-side and server-side (task 019)

## Acceptance Criteria
- [ ] Only authenticated admin can access dashboard (non-admin redirected to login)
- [ ] Pending payment list shows all `payment_submitted` registrations
- [ ] Payment proof visible via signed URL (image or PDF)
- [ ] Approve button calls Edge Function and updates UI
- [ ] Reject button requires notes — cannot submit without them
- [ ] Registration status updates correctly in UI after approve/reject
- [ ] Audit event logged for each decision (verified via task 019)
- [ ] Signed URL used (not permanent URL)

## Verification
```bash
npx tsc --noEmit
npm run build
npm run lint
# Manual: log in as admin, upload a test payment, approve/reject via dashboard
```

## Risks
- PDF preview in iframe may not work on all browsers — provide download link as fallback
- Signed URL generation requires service role or authenticated admin — ensure Supabase client is initialized with correct session
- If admin session expires during review, actions may fail silently — handle 401 responses

## Deliverables
- Admin payment list page at `/admin`
- Registrant detail page at `/admin/pendaftar/:id`
- Approve/reject workflow with notes

## Completion Notes
_Not started_
