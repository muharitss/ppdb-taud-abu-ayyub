# Task 029 — Admin PPDB Configuration

## Status
NOT_STARTED

## Priority
P2

## Dependencies
- Task 012 — Admin Authentication

## Objective
Build the admin PPDB configuration management page where administrators can view and edit key configuration values such as bank account info and registration period dates.

## Context
The `ppdb_config` table stores operational settings (bank account details, registration open/close dates, WhatsApp admin number). Admins need a UI to manage these without direct database access.

## Scope
1. View/edit `ppdb_config` values:
   - Bank account info: bank name, account number, account holder name
   - Registration period: open date, close date
   - Admin WhatsApp number
2. Simple key-value editor with shadcn `Form`, `Input`, `DatePicker` (if available) or date input
3. All config changes logged to `audit_events`

## Out of Scope
- Managing admin user accounts (separate concern)
- Modifying RLS policies or database schema

## Specifications
- specs/04-data-model.md

## Implementation Plan
1. Create route `/admin/config`
2. Fetch all `ppdb_config` rows
3. Build form with shadcn `Form` and `Input` for each config key
4. On save: call an Edge Function or authenticated Supabase client update
5. Log change to `audit_events`: `action=config_updated`, `metadata={key, old_value, new_value}`
6. Show Sonner toast on success/failure

## Files Expected to Change
- `src/features/admin/pages/AdminConfigPage.tsx` (new)
- `src/lib/api/admin.ts` (extend with config read/write)
- `supabase/functions/update-ppdb-config/index.ts` (new, optional — or use RLS admin update)

## Security Considerations
- Admin auth guard
- Config updates via admin-authenticated session only
- All changes logged with actor ID for audit trail

## Acceptance Criteria
- [ ] All `ppdb_config` values displayed and editable
- [ ] Bank account info editable and saved correctly
- [ ] Registration dates editable and saved correctly
- [ ] Config changes logged to `audit_events`
- [ ] Only admin can access this page

## Verification
```bash
npx tsc --noEmit
# Manual: update a config value, verify it persists and appears in audit log
```

## Risks
- Config changes take effect immediately — changing bank account while registrants are viewing payment page may cause confusion
- Date format handling (timezone) needs care for registration open/close dates

## Deliverables
- Admin config page at `/admin/config`

## Completion Notes
_Not started_
