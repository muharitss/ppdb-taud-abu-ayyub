# Task 038 — Bank Information & Contact Consistency

## Status

DONE

## Priority

P0

## Dependencies

- Task 016 — Payment Page UI
- Task 020 — Form Requirements Confirmation

## Objective

Reconcile and ensure 100% consistency of official bank account details and admin WhatsApp contacts across code constants, UI components, and technical specifications.

## Context

During the audit, an inconsistency was identified in the school's BSI account number:

- `src/features/payments/services/payment.ts` specifies `7327913322 a.n. TAUD SaQu Abu Ayyub`.
- `task-020` and `specs/01-requirements.md` noted `7327913322 a.n. TAUD Abu Ayyub`.
  Because transfer proof is verified against mutasi rekening, this mismatch could lead to parents transferring registration fees to an incorrect account.

## Scope

1. Confirm the single official BSI account number and account holder name with the school administration:
   - Account Number (e.g. `7327913322` vs `7327913322`)
   - Account Holder Name (`TAUD SaQu Abu Ayyub` vs `TAUD Abu Ayyub`)
   - Registration fee amount (`Rp 300.000`)
2. Consolidate bank configuration into a single source of truth in `src/config/schoolInfo.ts` or `src/features/payments/services/payment.ts`.
3. Update `DEFAULT_BANK_INFO` and ensure `BankInfoCard.tsx` consumes this configuration consistently.
4. Align WhatsApp numbers (`6282169599979` Ummu Rumi, `6281367074138` Admin) across all CTA and help links:
   - Hero / Contact Info
   - Payment Page WhatsApp Help button
   - Full Form gating help card
5. Synchronize all specification files (`specs/01-requirements.md`, `specs/05-business-workflows.md`, `task-020`) with the verified account.

## Out of Scope

- Adding payment gateways or third-party bank APIs
- Modifying Edge Function file validation logic

## Specifications

- `specs/01-requirements.md` (Phase C & Section 5)
- `specs/05-business-workflows.md` (Workflow C)

## Implementation Plan

1. Establish verified bank account info in application configuration.
2. Update references in `src/features/payments/services/payment.ts` and `src/features/payments/components/BankInfoCard.tsx`.
3. Verify WhatsApp deep link query parameters (`wa.me/6282169599979?text=...`) for consistency.
4. Update specification documentation files.
5. Run test suite and build verification: `npm run build`.

## Files Expected to Change

- `src/features/payments/services/payment.ts`
- `src/features/payments/components/BankInfoCard.tsx`
- `specs/01-requirements.md`
- `specs/05-business-workflows.md`
- `task/task-020-form-requirements-confirmation.md`

## Acceptance Criteria

- [x] Single verified BSI account number used everywhere across code and specs
- [x] BankInfoCard displays verified account number with working "Salin Rekening" button
- [x] Admin WhatsApp help links use standard format and verified admin number
- [x] No conflicting bank details remain in specs or source code
