# Task 025 — Status Page

## Status
DONE

## Priority
P1

## Dependencies
- Task 014 — Edge Function: verify-registration-access

## Objective
Build the registration status check page at `/status` where registrants can look up their registration status using their registration number and access code.

## Context
Registrants receive their `registration_number` and `access_code` after initial registration. They can use these to check their status at any time without logging in. This page must be secure — it must never expose another registrant's data, and error messages must be opaque.

## Scope
1. Form: `registration_number` input, `access_code` input
2. Submit → call `verify-registration-access` Edge Function
3. Show status display: `registration_status` (with human-readable labels in Indonesian), `payment_status`, form completeness, `submitted_at` if available
4. Status badges using shadcn `Badge` component
5. Error: same opaque message for not-found and wrong code: _"Nomor pendaftaran atau kode akses tidak valid"_
6. Rate limit error: show _"Terlalu banyak percobaan. Coba lagi nanti."_
7. Link to WhatsApp admin for questions

## Out of Scope
- Allowing status update from this page (read-only)
- Showing other registrants' data

## Specifications
- specs/05-business-workflows.md
- specs/06-ui-conventions.md

## Implementation Plan
1. Create route `/status` in React Router
2. Build form with shadcn `Input` components and submit button
3. On submit: call `verify-registration-access` Edge Function with credentials
4. Map API response statuses to human-readable Indonesian labels
5. Render status display using shadcn `Badge` components with appropriate color coding
6. Show `submitted_at`, `payment_status`, `form_completeness` if available
7. Error states:
   - 401/404 → opaque message "Nomor pendaftaran atau kode akses tidak valid"
   - 429 → "Terlalu banyak percobaan. Coba lagi nanti."
8. Add WhatsApp admin link for further questions

## Files Expected to Change
- `src/features/status/pages/StatusPage.tsx` (new)
- `src/features/status/components/StatusDisplay.tsx` (new)
- `src/lib/api/status.ts` (new — API call to Edge Function)
- `src/lib/constants/statusLabels.ts` (new — Indonesian status label mapping)
- `src/router.tsx` (add route)

## Security Considerations
- Never show another registrant's data — Edge Function enforces this
- Error messages are opaque — do not distinguish "not found" from "wrong code"
- Rate limiting enforced by Edge Function — show friendly error on 429
- Page is public (no auth required) but shows only data for verified credentials

## Acceptance Criteria
- [x] Valid credentials show correct registration status, payment status, and submitted_at
- [x] Invalid credentials (wrong number or wrong code) show opaque error message
- [x] Rate limit (429) shows friendly error in Indonesian
- [x] No other registrant's data is shown under any circumstances
- [x] All status labels displayed in Indonesian
- [x] WhatsApp admin link present and opens correctly

## Verification
```bash
npx tsc --noEmit
npm run build
# Manual: test with valid credentials, invalid registration number, wrong access code, rate limit
```

## Risks
- If `verify-registration-access` response changes shape, status display breaks — keep schema aligned
- Rate limit message must not include retry-after timing (don't hint at attack timing)

## Deliverables
- Status page at `/status`
- Indonesian status label mapping
- Integration with `verify-registration-access` Edge Function

## Completion Notes
_Not started_
