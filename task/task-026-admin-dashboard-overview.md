# Task 026 — Admin Dashboard Overview

## Status
DONE

## Priority
P2

## Dependencies
- Task 012 — Admin Authentication
- Task 018 — Admin Payment Dashboard

## Objective
Build the admin dashboard overview page with summary statistics and recent activity.

## Context
Provides the admin with a bird's-eye view of the PPDB process: how many registrations, how many are pending review, how many are complete, and what happened recently.

## Scope
1. Summary cards: total registrations, pending payment review, awaiting form, submitted, accepted, rejected
2. Recent activity list (last 10 `audit_events`)
3. Quick links to payment review queue
4. shadcn `Card`, `Badge`, `Table` components
5. Auto-refresh (30s interval)

## Out of Scope
- Detailed registrant management (task 027, 028)
- Config management (task 029)
- Full audit log (task 030)

## Specifications
- specs/05-business-workflows.md
- specs/06-ui-conventions.md

## Implementation Plan
1. Create admin overview page at `/admin`
2. Query registration counts grouped by status
3. Query last 10 `audit_events` ordered by `created_at DESC`
4. Build summary cards with shadcn `Card`
5. Build recent activity table with shadcn `Table`
6. Set up auto-refresh interval with 30s timer
7. Add quick link button to payment review queue

## Files Expected to Change
- `src/features/admin/pages/AdminDashboardPage.tsx` (updated)
- `src/features/admin/components/SummaryCard.tsx` (new)
- `src/features/admin/components/RecentActivityTable.tsx` (new)
- `src/features/admin/services/adminDashboard.ts` (new)
- `src/features/admin/layouts/AdminLayout.tsx` (updated with navigation bar)

## Security Considerations
- Admin auth guard on all dashboard routes
- Summary counts and audit events fetched via admin-authenticated API calls

## Acceptance Criteria
- [x] Summary cards show correct counts for each status
- [x] Recent activity shows last 10 audit events with correct actor, action, and timestamp
- [x] Quick link to payment review queue works
- [x] Data auto-refreshes every ~30 seconds
- [x] Only admin can access this page

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Real-time counts may be slightly stale between refreshes — handled with 30s auto-refresh + manual refresh button.
- Large number of audit events may make queries slow — limited to last 10.

## Deliverables
- Admin dashboard overview page at `/admin` with summary cards, pending payment alerts, recent audit activity table, and top navigation bar.

## Completion Notes
Completed with zero extra dependencies: standard interval auto-refresh, efficient single-query status counting, responsive cards, and clean Indonesian activity formatting.
