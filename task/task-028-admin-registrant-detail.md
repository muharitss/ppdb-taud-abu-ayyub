# Task 028 — Admin Registrant Detail

## Status
NOT_STARTED

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
2. Show uploaded documents with signed URLs (short-lived, e.g. 1 hour)
3. Status management: `under_review` → `accepted` or `rejected` with required notes
4. Payment history (list of payment attempts and their statuses)
5. Audit log for this specific registration (all events with this `entity_id`)

## Out of Scope
- Editing registrant-submitted data
- Payment review (handled by task 018)

## Specifications
- specs/05-business-workflows.md
- specs/04-data-model.md

## Implementation Plan
1. Fetch full registration record by ID
2. Display all form fields in a read-only layout
3. Fetch documents; generate signed URLs for each
4. Render documents: images with `<img>`, PDFs with link/iframe
5. Build status management UI: shadcn `Select` or buttons for status change, shadcn `Dialog` for confirmation and notes
6. Fetch and display payment history table
7. Fetch and display audit events for this registration

## Files Expected to Change
- `src/features/admin/pages/AdminRegistrantDetailPage.tsx` (new or extend from task 018)
- `src/features/admin/components/DocumentViewer.tsx` (new)
- `src/features/admin/components/AuditLogSection.tsx` (new)
- `src/lib/api/admin.ts` (extend)

## Security Considerations
- Admin auth guard
- Signed URLs for all documents (never permanent URLs)
- Status transitions validated server-side

## Acceptance Criteria
- [ ] All form fields displayed correctly (read-only)
- [ ] Uploaded documents accessible via signed URLs
- [ ] Status change (accept/reject with notes) works and is logged
- [ ] Payment history shown correctly
- [ ] Audit log for this registration shown in chronological order

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Signed URL generation for many documents may slow page load — generate lazily on demand
- Form fields layout depends on confirmed schema from task 020 — coordinate with task 022

## Deliverables
- Admin registrant detail page at `/admin/pendaftar/:id`

## Completion Notes
_Not started_
