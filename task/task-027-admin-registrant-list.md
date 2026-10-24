# Task 027 — Admin Registrant List

## Status
DONE

## Priority
P2

## Dependencies
- Task 026 — Admin Dashboard Overview

## Objective
Build the admin registrant list page with filtering and search capabilities.

## Context
Admins need to browse all registrations, filter by status, and search for specific registrants to manage the PPDB process efficiently.

## Scope
1. Table of all registrations with columns: `registration_number`, `child_name`, `parent_name`, `whatsapp_number`, `status`, `payment_status`, `created_at`
2. Filter by status (shadcn/native select with URL query param sync)
3. Debounced search by `registration_number`, `child_name`, or `parent_name`
4. Link to detail page (`/admin/pendaftar/:id`) from each row
5. Database-level pagination (`range` query with page controls)

## Out of Scope
- Bulk actions
- Export to CSV/Excel
- Detailed form data (task 028)

## Specifications
- specs/06-ui-conventions.md

## Implementation Plan
1. Create route `/admin/pendaftar`
2. Fetch registrations with database-level pagination, search (`ilike`), and status filter
3. Build responsive table with status badges and quick WhatsApp link
4. Implement client-side debounce and URL param synchronization for filter presets
5. Add pagination controls with item range counters
6. Link action button to `/admin/pendaftar/:id`

## Files Changed
- `src/features/admin/services/adminRegistrants.ts` (new)
- `src/features/admin/pages/AdminRegistrantListPage.tsx` (new)
- `src/app/router.tsx` (route `/admin/pendaftar`)

## Security Considerations
- Admin auth guard enforced via AdminLayout
- Search query and filters executed via Supabase authenticated admin policies

## Acceptance Criteria
- [x] All registrations listed with correct columns
- [x] Filter by status works correctly
- [x] Search by registration number and child name works
- [x] Clicking a row navigates to detail page
- [x] Pagination works correctly

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Search performance on very large datasets: indexed columns `registration_number`, `whatsapp_number`, and `created_at` are used.

## Deliverables
- Admin registrant list page at `/admin/pendaftar`

## Completion Notes
Completed with debounced search, status filter synced with URL query params, database-level pagination, responsive table, and direct link to WhatsApp.
