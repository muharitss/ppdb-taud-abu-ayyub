# Task 029 — Admin PPDB Configuration

## Status
DONE

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
   - Registration period: open date, close date, open/close status, period name
   - Admin WhatsApp numbers (primary & secondary)
   - Registration fee amount
2. Form editor with shadcn `Card`, `Input`, and saving state
3. All config changes logged to `audit_events`

## Out of Scope
- Managing admin user accounts (separate concern)
- Modifying RLS policies or database schema

## Specifications
- specs/04-data-model.md

## Implementation Plan
1. Create route `/admin/pengaturan`
2. Fetch all `ppdb_config` rows with safe fallbacks from `schoolInfo.ts`
3. Build form sections (Status & Periode, Rekening Pembayaran, Kontak WhatsApp)
4. On save: update `ppdb_config` via authenticated Supabase client
5. Log change to `audit_events`: `action=config_updated`
6. Show Sonner toast on success/failure

## Files Changed
- `src/features/admin/services/adminConfig.ts` (new)
- `src/features/admin/pages/AdminConfigPage.tsx` (new)
- `src/app/router.tsx` (route `/admin/pengaturan`)

## Security Considerations
- Admin auth guard enforced
- Config updates permitted via admin-authenticated session only (RLS: `admins_all_ppdb_config`)
- Changes logged to `audit_events`

## Acceptance Criteria
- [x] All `ppdb_config` values displayed and editable
- [x] Bank account info editable and saved correctly
- [x] Registration dates editable and saved correctly
- [x] Config changes logged to `audit_events`
- [x] Only admin can access this page

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Config changes take effect immediately on public pages. Handled cleanly with immediate reactive sync.

## Deliverables
- Admin config page at `/admin/pengaturan`

## Completion Notes
Completed with grouped cards for registration status/period, bank account details, and WhatsApp contact numbers, integrated with toast feedback and audit logging.
