# Task 018 — Admin Payment Dashboard

## Status
DONE

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
- `src/features/admin/pages/AdminRegistrantDetailPage.tsx` (new)
- `src/features/admin/components/PaymentReviewCard.tsx` (new)
- `src/features/admin/components/RejectDialog.tsx` (new)
- `src/features/admin/services/adminPayment.ts` (new)
- `src/app/router.tsx` (add admin routes)

## Security Considerations
- Admin auth guard on all `/admin/*` routes — redirect if not authenticated
- Signed URLs expire in 1 hour — never expose permanent storage URLs
- Payment proof files must not be publicly accessible (private bucket)
- Reject action requires notes — enforced both client-side and server-side (task 019)

## Acceptance Criteria
- [x] Only authenticated admin can access dashboard (non-admin redirected to login)
- [x] Pending payment list shows all `payment_submitted` registrations
- [x] Payment proof visible via signed URL (image or PDF)
- [x] Approve button calls Edge Function and updates UI
- [x] Reject button requires notes — cannot submit without them
- [x] Registration status updates correctly in UI after approve/reject
- [x] Audit event logged for each decision (verified via task 019)
- [x] Signed URL used (not permanent URL)

## Verification
```bash
npx tsc -b --noEmit
npm run build
npm run lint
```

## Risks
- PDF preview in iframe may not work on all browsers — provided direct tab link as fallback
- Signed URL generation requires authenticated admin — handled via Supabase storage client with active admin session

## Deliverables
- Admin payment list component at `/admin` (`AdminPaymentListPage.tsx`)
- Registrant detail review page at `/admin/pendaftar/:id` (`AdminRegistrantDetailPage.tsx`)
- Approve/reject workflow with required notes (`RejectDialog.tsx`, `PaymentReviewCard.tsx`)
- Integration with `admin-review-payment` Edge Function

## Completion Notes
Completed 2026-10-23. Built admin payment review dashboard with pending submission queue, live stats, 1-hour secure signed URL generation for images/PDFs, approval flow advancing applicant status to `awaiting_form`, rejection modal enforcing detailed reviewer notes, and full Sonner notifications. Phase 5 complete!
