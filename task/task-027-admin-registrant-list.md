# Task 027 — Admin Registrant List

## Status
NOT_STARTED

## Priority
P2

## Dependencies
- Task 026 — Admin Dashboard Overview

## Objective
Build the admin registrant list page with filtering and search capabilities.

## Context
Admins need to browse all registrations, filter by status, and search for specific registrants to manage the PPDB process efficiently.

## Scope
1. Table of all registrations with columns: `registration_number`, `child_name`, `status`, `payment_status`, `created_at`
2. Filter by status (shadcn `Select`)
3. Search by `registration_number` or `child_name`
4. Link to detail page (`/admin/pendaftar/:id`) from each row
5. Pagination (shadcn or manual offset-based)

## Out of Scope
- Bulk actions
- Export to CSV/Excel
- Detailed form data (task 028)

## Specifications
- specs/06-ui-conventions.md

## Implementation Plan
1. Create route `/admin/registrants`
2. Fetch all registrations with TanStack Query (paginated)
3. Build shadcn `Table` with columns
4. Implement client-side or server-side filter by status using shadcn `Select`
5. Implement search input with debounce
6. Add pagination controls
7. Make each row clickable → navigate to `/admin/pendaftar/:id`

## Files Expected to Change
- `src/features/admin/pages/AdminRegistrantListPage.tsx` (new)
- `src/lib/api/admin.ts` (extend with registrant list query)
- `src/router.tsx` (add route)

## Security Considerations
- Admin auth guard
- Search query sanitized before sending to API

## Acceptance Criteria
- [ ] All registrations listed with correct columns
- [ ] Filter by status works correctly
- [ ] Search by registration number and child name works
- [ ] Clicking a row navigates to detail page
- [ ] Pagination works correctly

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Search may be slow on large dataset without DB index — ensure `child_name` and `registration_number` are indexed

## Deliverables
- Admin registrant list page at `/admin/registrants`

## Completion Notes
_Not started_
