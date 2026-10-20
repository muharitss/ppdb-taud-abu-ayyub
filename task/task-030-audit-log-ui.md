# Task 030 — Audit Log UI

## Status
NOT_STARTED

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
2. Filter by `action` type (shadcn `Select` with all action enum values)
3. Filter by date range (date picker inputs for start and end date)
4. Pagination (offset-based or cursor-based)
5. Show: `created_at`, `actor` (admin ID or "system"), `action`, `entity_type`, `entity_id`, `metadata` summary

## Out of Scope
- Deleting or editing audit events (immutable by design)
- Real-time log streaming

## Specifications
- specs/04-data-model.md

## Implementation Plan
1. Create route `/admin/audit-log`
2. Fetch `audit_events` with TanStack Query (paginated)
3. Build shadcn `Table` with all columns
4. Implement filter by action type using shadcn `Select`
5. Implement date range filter
6. Pagination controls
7. Make `entity_id` linkable to registrant detail page where applicable

## Files Expected to Change
- `src/features/admin/pages/AdminAuditLogPage.tsx` (new)
- `src/lib/api/admin.ts` (extend with audit log query)
- `src/router.tsx` (add route)

## Security Considerations
- Admin auth guard
- `audit_events` readable by admin only (RLS enforced)

## Acceptance Criteria
- [ ] All audit events listed in reverse chronological order
- [ ] Filter by action type works
- [ ] Filter by date range works
- [ ] Pagination works
- [ ] Entity IDs link to relevant pages where possible

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Audit log can grow large — ensure pagination and date filter use DB indexes
- `metadata` JSONB display needs to be human-readable (format as JSON string or key-value)

## Deliverables
- Admin audit log page at `/admin/audit-log`

## Completion Notes
_Not started_
