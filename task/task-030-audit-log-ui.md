# Task 030 — Audit Log UI

## Status
DONE

## Priority
P2

## Dependencies
- Task 026 — Admin Dashboard Overview

## Objective
Build the admin audit log viewer page showing all system events with filtering by action type and date range.

## Context
The `audit_events` table records all significant system actions (payment submitted, payment approved/rejected, admin login, config changes, etc.). Admins need a searchable, filterable view of this log for accountability and debugging.

## Scope
1. Table of `audit_events` ordered by `created_at DESC`
2. Filter by `action` type (select with all action enum values)
3. Filter by date range (start date and end date)
4. Pagination (offset-based, 20 items per page)
5. Show: `created_at`, `actor` (admin ID or "system"), `action`, `entity_type`, `entity_id`, `metadata` summary
6. Entity IDs link to relevant pages where applicable

## Out of Scope
- Deleting or editing audit events (immutable by design)
- Real-time log streaming

## Specifications
- specs/04-data-model.md

## Implementation Plan
1. Create route `/admin/audit`
2. Fetch `audit_events` via Supabase client with database range pagination and filters
3. Build responsive table with badge action styles and human-readable time format
4. Implement filter by action type and start/end dates with reset button
5. Make `entity_id` linkable to `/admin/pendaftar/:id` for registrations
6. Add pagination controls

## Files Changed
- `src/features/admin/services/adminAudit.ts` (new)
- `src/features/admin/pages/AdminAuditLogPage.tsx` (new)
- `src/app/router.tsx` (route `/admin/audit`)

## Security Considerations
- Admin auth guard enforced
- `audit_events` readable by admin only (RLS: `admins_select_audit_events`)

## Acceptance Criteria
- [x] All audit events listed in reverse chronological order
- [x] Filter by action type works
- [x] Filter by date range works
- [x] Pagination works
- [x] Entity IDs link to relevant pages where possible

## Verification
```bash
npx tsc --noEmit
npm run build
npm run lint
```

## Deliverables
- Admin audit log page at `/admin/audit`

## Completion Notes
Completed with comprehensive action filtering, ISO date range filters, entity linking to registrant details, Indonesian human-readable time formatting, and database pagination.
