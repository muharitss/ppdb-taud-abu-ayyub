# Task 028 — Admin Registrant Detail

## Status
DONE

## Priority
P2

## Dependencies
- Task 027 — Admin Registrant List
- Task 022 — Full Form UI

## Objective
Build the admin registrant detail page showing full registration form data, uploaded documents, payment history, and audit log for an individual registrant.

## Context
Admins reviewing a specific registrant need access to all their information in one place: submitted form data, uploaded documents (with signed URLs), payment history, and the full audit trail for that registration.

## Scope
1. Show all registration fields (read-only display)
2. Show uploaded documents with signed URLs (short-lived, 1 hour)
3. Status management: `under_review` → `accepted` or `rejected` with required notes
4. Payment history (list of payment attempts, review status, and review dialog)
5. Audit log for this specific registration (all events with this `entity_id`)

## Out of Scope
- Editing registrant-submitted data

## Specifications
- specs/05-business-workflows.md
- specs/04-data-model.md

## Implementation Plan
1. Fetch full registration record, form data, documents, payments, and audit events in parallel
2. Display all form fields (child, father, mother, health) in a read-only layout
3. Generate signed URLs for documents (`registration-documents`) and render images/PDFs
4. Build status management UI with confirmation dialog and mandatory rejection notes
5. Fetch and display audit events in chronological order

## Files Changed
- `src/features/admin/services/adminDetail.ts` (new)
- `src/features/admin/components/DocumentViewer.tsx` (new)
- `src/features/admin/components/AuditLogSection.tsx` (new)
- `src/features/admin/pages/AdminRegistrantDetailPage.tsx` (updated)

## Security Considerations
- Admin auth guard enforced
- Short-lived signed URLs for documents and payment proofs (1 hour TTL)
- Audit logging for all status change decisions

## Acceptance Criteria
- [x] All form fields displayed correctly (read-only)
- [x] Uploaded documents accessible via signed URLs
- [x] Status change (accept/reject with notes) works and is logged
- [x] Payment history shown correctly
- [x] Audit log for this registration shown in chronological order

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Expired signed URLs: short-lived URLs (1 hour) generated fresh on page load.

## Deliverables
- Admin registrant detail page at `/admin/pendaftar/:id`

## Completion Notes
Completed with full multi-section read-only form breakdown, secure signed URL document preview (images & PDF), admin decision workflow modal with required rejection reason, and registrant audit log section.
