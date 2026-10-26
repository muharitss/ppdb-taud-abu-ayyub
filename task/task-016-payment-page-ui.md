# Task 016 — Payment Page UI

## Status

DONE

## Priority

P1

## Dependencies

- Task 015 — Registration UI

## Objective

Build payment information and proof upload page (`/daftar/pembayaran` and `/bayar/:registrationNumber`).

## Context

After completing the initial registration step, users must pay the registration fee of Rp300.000 via manual bank transfer and then upload proof of payment. This page handles displaying bank account info and accepting the proof upload.

## Scope

1. Show bank account info (bank name, account number, account holder — BSI 7327913322 a.n. TAUD SaQu Abu Ayyub)
2. Show amount: **Rp300.000**
3. Provide direct WhatsApp link to Admin (`6282169599979`) for help and questions on the payment page
4. Upload field for payment proof photo with drag & drop and file picker
5. File validation: JPEG/PNG/PDF only, max 5MB (client-side pre-check)
6. Submit → call Edge Function `submit-payment-proof`
7. On success: immediately allow user to access the full registration form (`/daftar/formulir`) with credentials passed in router state
8. Error handling with Sonner toast and alert banner

## Out of Scope

- Payment gateway integration
- Automatic payment verification
- Email/SMS notifications

## Specifications

- specs/05-business-workflows.md
- specs/06-ui-conventions.md

## Implementation Plan

1. Create route `/daftar/pembayaran` & `/bayar/:registrationNumber` in React Router
2. Display bank account info card with copy-to-clipboard for account number & amount
3. Build UI layout: bank info card, amount display, file upload section with thumbnail/PDF preview
4. Implement client-side file validation (type + size check before upload)
5. Wire up form submission to `submit-payment-proof` Edge Function
6. Handle success state: show `payment_submitted` message + instructions
7. Handle error states with inline banner and Sonner toast

## Files Changed

- `src/features/payments/pages/PaymentPage.tsx`
- `src/features/payments/components/BankInfoCard.tsx`
- `src/features/payments/components/PaymentProofUpload.tsx`
- `src/features/payments/services/payment.ts`
- `src/features/payments/types/index.ts`
- `src/app/router.tsx`

## Security Considerations

File type and size are validated client-side AND server-side in the Edge Function via magic bytes. Access code is passed in-memory from registration step or inputted securely.

## Acceptance Criteria

- [x] Bank info displayed clearly (bank name, account number, account holder)
- [x] Registration fee amount (Rp300.000) clearly shown
- [x] File upload accepts only JPEG/PNG/PDF (client-side validation)
- [x] Files larger than 5MB are rejected before upload with a clear error message
- [x] On successful upload, success state is shown with instructions to wait
- [x] Payment status transitions to `payment_submitted` after successful upload
- [x] Error states handled gracefully with inline alert and Sonner

## Verification

```bash
npx tsc -b --noEmit
npm run lint
npm run build
```

## Risks

- File upload UX on mobile browsers: tested standard file picker and touch-friendly controls.

## Deliverables

- Payment page component at `/daftar/pembayaran` and `/bayar/:registrationNumber`
- File upload with client-side validation
- Integration with `submit-payment-proof` Edge Function

## Completion Notes

Completed 2026-10-23. Implemented `BankInfoCard` with clipboard actions for account and nominal, `PaymentProofUpload` with drag-and-drop, client-side validation (5MB max, JPG/PNG/PDF), image/PDF previews, `submitPaymentProof` API integration calling `submit-payment-proof` Edge Function, and responsive UI with breadcrumbs and WhatsApp confirmation link.
