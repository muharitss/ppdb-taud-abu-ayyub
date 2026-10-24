# Task 024 — Success Page and WhatsApp Link

## Status
DONE

## Priority
P1

## Dependencies
- Task 022 — Full Form UI

## Objective
Build the registration success page at `/daftar/berhasil` with a pre-filled WhatsApp link so registrants can notify the school.

## Context
After completing the full registration form, registrants are directed to a success page. Because the system uses no WhatsApp API, registrants must manually send a WhatsApp message to the school. This page constructs a pre-filled `wa.me` link to make this as frictionless as possible.

## Scope
1. Page `/daftar/berhasil` — shows `registration_number`, `access_code`, link to status page
2. Build `wa.me` link: `https://wa.me/{whatsapp_number}?text={encodeURIComponent(message)}`
3. Message template fills: `child_name`, `registration_number`, PPDB period `TP.2027/2028`, status URL
4. "Kirim via WhatsApp" button opens `wa.me` link in new tab
5. "Salin Informasi" button copies `registration_number` + `access_code` to clipboard
6. Clear disclaimer: _"Pastikan pesan sudah terkirim — sistem tidak dapat memastikan pengiriman"_
7. **WA Group join button:** "Gabung Grup WhatsApp PPDB" → `https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh` (opens in new tab); sourced from `ppdb_config.wa_group_link` constant
8. Link to status page
8. WhatsApp number sourced from initial registration form (`whatsapp_number` field)

## Out of Scope
- WhatsApp API or automatic message sending
- Confirmation that WhatsApp message was sent

## Specifications
- specs/05-business-workflows.md
- specs/06-ui-conventions.md

## Implementation Plan
1. Create route `/daftar/berhasil` in React Router (receives registration data via state or query params)
2. Build message template function: interpolate `child_name`, `registration_number`, `access_code`, status URL
3. Encode message with `encodeURIComponent`
4. Construct `wa.me` link using school WhatsApp number (from `ppdb_config` or constant)
5. Render success page with all info clearly displayed
6. Implement "Kirim via WhatsApp" button: `window.open(waLink, '_blank')`
7. Implement "Salin Informasi" button: `navigator.clipboard.writeText(...)`
8. Show prominent disclaimer about manual send requirement
9. Add link to `/status` page

## Files Expected to Change
- `src/features/registration/pages/SuccessPage.tsx` (new)
- `src/features/registration/utils/whatsapp.ts` (new — `buildWaLink()` and `buildWaMessage()`)
- `src/router.tsx` (add route)

## Security Considerations
- `wa.me` link is constructed client-side from known-safe fields (no user-controlled URLs)
- `registration_number` and `access_code` are shown — ensure page is not cached or accessible without completing registration flow
- No API calls to WhatsApp

## Acceptance Criteria
- [x] `wa.me` link opens WhatsApp with correct pre-filled message mentioning TP.2027/2028
- [x] Message contains correct `child_name`, `registration_number`, and status URL
- [x] "Gabung Grup WhatsApp PPDB" button links to `https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh` (new tab)
- [x] "Salin Informasi" button copies correct text to clipboard
- [x] Disclaimer about manual send is clearly visible
- [x] Link to `/status` page works

## Verification
```bash
npx tsc --noEmit
npm run build
# Manual: complete registration flow, verify wa.me link opens WhatsApp with correct pre-filled text
```

## Risks
- WhatsApp number in `ppdb_config` may not be set — need fallback or clear error
- Clipboard API requires HTTPS in production — verify this works on Vercel (HTTPS enforced)
- `wa.me` link format must use country code without `+` (e.g., `628xxx` not `+628xxx`)

## Deliverables
- Success page at `/daftar/berhasil`
- `buildWaLink()` and `buildWaMessage()` utility functions (testable — task 031)

## Completion Notes
_Not started_
