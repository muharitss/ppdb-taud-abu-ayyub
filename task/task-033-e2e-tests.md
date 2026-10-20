# Task 033 — End-to-End Tests

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 025 — Status Page
- Task 018 — Admin Payment Dashboard

## Objective
Write Playwright end-to-end tests for all critical user flows.

## Context
E2E tests verify the application works correctly from the user's perspective across the full stack (frontend → Edge Functions → database). These tests run against a local Supabase + dev server environment.

## Scope
1. Install Playwright: `npm install -D @playwright/test`
2. E2E: Complete registration flow (registration → payment upload → status check)
3. E2E: Admin login and payment approval workflow
4. E2E: Status page shows correct status after admin approval
5. E2E: Invalid access code shows opaque error on status page

## Out of Scope
- Visual regression testing
- Performance testing
- Cross-browser testing (Chromium only for CI; optional multi-browser locally)

## Specifications
- specs/07-testing-strategy.md

## Implementation Plan
1. Install `@playwright/test`: `npm install -D @playwright/test`
2. Run `npx playwright install chromium`
3. Create `playwright.config.ts` with base URL pointing to local dev server
4. Create `e2e/` directory
5. Write test: `e2e/registration-flow.spec.ts`
   - Navigate to landing page
   - Fill registration form → submit
   - Verify redirect to payment page with bank info
   - Upload mock payment proof file
   - Verify success state (payment_submitted)
   - Navigate to status page → check status shows payment_submitted
6. Write test: `e2e/admin-approval.spec.ts`
   - Login as admin
   - Find pending payment in dashboard
   - View payment proof
   - Click approve
   - Verify status updates to payment_verified
7. Write test: `e2e/status-page.spec.ts`
   - Test invalid credentials → opaque error
   - Test valid credentials after approval → shows payment_verified
8. Add `"test:e2e": "playwright test"` to `package.json`

## Files Expected to Change
- `package.json` (add devDependency and test:e2e script)
- `playwright.config.ts` (new)
- `e2e/registration-flow.spec.ts` (new)
- `e2e/admin-approval.spec.ts` (new)
- `e2e/status-page.spec.ts` (new)

## Security Considerations
- E2E tests use local Supabase — never run against production
- Test credentials (admin login) stored in `.env.test`, not committed to repo
- Mock payment proof file should be a real but minimal JPEG for file type validation to pass

## Acceptance Criteria
- [ ] Playwright installed and configured
- [ ] Registration flow E2E test passes
- [ ] Admin login and payment approval E2E test passes
- [ ] Status page shows correct status after approval (E2E test passes)
- [ ] Invalid access code shows opaque error (E2E test passes)
- [ ] `npm run test:e2e` runs all E2E tests

## Verification
```bash
# Start local Supabase and dev server
supabase start
npm run dev &
npm run test:e2e
```

## Risks
- E2E tests are brittle — use data-testid attributes for selectors, not CSS classes
- File upload testing in Playwright requires `page.setInputFiles()` — verify this works with the upload component
- Admin test depends on a seeded admin user in local Supabase

## Deliverables
- Playwright configured and running
- E2E tests for 3 critical flows passing

## Completion Notes
_Not started_
