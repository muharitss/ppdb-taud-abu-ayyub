# Task 039 — Access Code Session Retention & Anti-Lockout

## Status
DONE

## Priority
P1

## Dependencies
- Task 015 — Registration UI
- Task 016 — Payment Page UI
- Task 022 — Full Form UI

## Objective
Prevent prospective parents (~20 users) from being locked out of their registration if their mobile browser reloads or if they switch apps to make a bank transfer.

## Context
Currently, `access_code` is strictly stored in React Router navigation state in memory. If a parent on a smartphone switches apps to their mobile banking, takes a screenshot of the transfer receipt, and returns to the browser, mobile Safari/Chrome often refreshes the tab. With the in-memory state wiped, the parent is immediately met with a modal demanding their 8-character CSPRNG access code. If they didn't copy it beforehand, they are locked out. For 20 kindergarten parents, this creates severe friction and unnecessary admin support workload.

## Scope
1. Implement a safe `sessionStorage` fallback helper for active registration credentials:
   - Key: `ppdb_active_credentials`
   - Content: `{ registrationNumber: string, accessCode: string, timestamp: number }`
2. Update `RegistrationStartPage.tsx`:
   - Upon successful registration creation, save active credentials to `sessionStorage`.
3. Update `PaymentPage.tsx`:
   - If router state is empty upon reload, check `sessionStorage` fallback to auto-populate `registrationNumber` and `accessCode`.
   - Update `sessionStorage` upon payment submission.
4. Update `FullFormPage.tsx`:
   - If router state is empty, auto-populate from `sessionStorage` so the parent does not have to re-type the 8-character code.
5. Provide a simple WhatsApp recovery helper button on the access prompt modal ("Lupa / Kehilangan Kode Akses? Hubungi Admin").
6. Clear session credentials only when the full form is successfully submitted (`submitted`).

## Out of Scope
- Storing access codes permanently in unencrypted `localStorage` (sessionStorage is scoped to the active browser tab session)
- Modifying backend password hashing in Edge Functions

## Specifications
- `specs/03-security.md`
- `specs/05-business-workflows.md` (Workflow D & F)

## Implementation Plan
1. Create a utility `src/lib/sessionCredentials.ts` with methods:
   - `saveSessionCredentials(registrationNumber, accessCode)`
   - `getSessionCredentials()`
   - `clearSessionCredentials()`
2. Wire up `RegistrationStartPage.tsx` to store credentials on submission.
3. Wire up `PaymentPage.tsx` and `FullFormPage.tsx` to read credentials if `location.state` is empty.
4. Add clear session trigger on final submit in `FullFormWizard.tsx`.
5. Verify behavior on page reload (credentials persist across refresh within the same session).

## Files Expected to Change
- `src/lib/sessionCredentials.ts` (new)
- `src/features/registration/pages/RegistrationStartPage.tsx`
- `src/features/payments/pages/PaymentPage.tsx`
- `src/features/registration/pages/FullFormPage.tsx`
- `src/features/registration/components/FullFormWizard.tsx`

## Acceptance Criteria
- [x] Refreshing `/bayar/:registrationNumber` retains `accessCode` without manual re-entry
- [x] Refreshing `/daftar/formulir` restores registration data without locking the user out
- [x] Credentials expire when the browser tab is closed (session storage boundary)
- [x] Final form submission clears the session storage entry
- [x] Access modal includes a direct WhatsApp link to Admin for assistance
