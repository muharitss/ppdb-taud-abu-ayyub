# Task 016 — Payment Page UI

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 015 — Registration UI

## Objective
Build payment information and proof upload page (`/daftar/pembayaran`).

## Context
After completing the initial registration step, users must pay the registration fee of Rp300.000 via manual bank transfer and then upload proof of payment. This page handles displaying bank account info and accepting the proof upload.

## Scope
1. Show bank account info (bank name, account number, account holder — from `ppdb_config` or hardcoded initially)
2. Show amount: **Rp300.000**
3. Upload field for payment proof (shadcn `Input type=file` or custom upload with validation)
4. File validation: JPEG/PNG/PDF only, max 5MB (client-side pre-check)
5. Submit → call Edge Function `submit-payment-proof`
6. On success: show status (`payment_submitted`), instructions to wait for admin verification
7. Error handling with shadcn `Alert` / `Sonner`

## Out of Scope
- Payment gateway integration
- Automatic payment verification
- Email/SMS notifications

## Specifications
- specs/05-business-workflows.md
- specs/06-ui-conventions.md

## Implementation Plan
1. Create route `/daftar/pembayaran` in React Router
2. Fetch bank account info from `ppdb_config` (or use hardcoded constants as fallback)
3. Build UI layout: bank info card, amount display, file upload section
4. Implement client-side file validation (type + size check before upload)
5. Wire up form submission to `submit-payment-proof` Edge Function
6. Handle success state: show `payment_submitted` message + instructions
7. Handle error states with shadcn `Alert` or `Sonner` toast

## Files Expected to Change
- `src/features/registration/pages/PaymentPage.tsx` (new)
- `src/features/registration/components/BankInfoCard.tsx` (new)
- `src/features/registration/components/PaymentProofUpload.tsx` (new)
- `src/router.tsx` (add route)
- `src/lib/api/payment.ts` (new — API call to Edge Function)

## Security Considerations
File type and size MUST be validated client-side AND server-side in the Edge Function. Client-side validation is UX only; server-side validation is the security boundary. Never trust client-reported file types.

## Acceptance Criteria
- [ ] Bank info displayed clearly (bank name, account number, account holder)
- [ ] Registration fee amount (Rp300.000) clearly shown
- [ ] File upload accepts only JPEG/PNG/PDF (client-side validation)
- [ ] Files larger than 5MB are rejected before upload with a clear error message
- [ ] On successful upload, success state is shown with instructions to wait
- [ ] Payment status transitions to `payment_submitted` after successful upload
- [ ] Error states handled gracefully with shadcn Alert or Sonner

## Verification
```bash
npx tsc --noEmit
npm run build
npm run lint
```

## Risks
- `ppdb_config` may not be set up in time; may need hardcoded bank details initially
- File upload UX on mobile browsers can be inconsistent — test on Android/iOS

## Deliverables
- Payment page component at `/daftar/pembayaran`
- File upload with client-side validation
- Integration with `submit-payment-proof` Edge Function

## Completion Notes
_Not started_
