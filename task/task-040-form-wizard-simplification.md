# Task 040 — Full Form Wizard Simplification & Component Refactor

## Status
DONE

## Priority
P2

## Dependencies
- Task 021 — Form Schema & Migration
- Task 022 — Full Form UI

## Objective
Refactor and simplify `FullFormWizard.tsx` (currently over 1,000 lines) by extracting repetitive parent form sections and auto-detecting the wizard step from saved draft data.

## Context
The codebase audit identified that `FullFormWizard.tsx` is 1,018 lines long and contains extensive duplicate JSX. Step 2 (Data Ayah) and Step 3 (Data Ibu) render 8 nearly identical form fields (Nama, NIK, Tempat/Tgl Lahir, Pendidikan, Pekerjaan, Penghasilan, WA, Alamat). Furthermore, when a user refreshes the page, `currentStep` always resets to Step 1 despite earlier sections being saved in the draft. Simplifying this component will reduce ~300 lines of code and improve the user experience for our 20 applicants.

## Scope
1. Create a reusable component `src/features/registration/components/ParentFormSection.tsx`:
   - Accepts role type (`"father"` or `"mother"`), label (`"Ayah"` or `"Ibu"`), field values, errors, and change handler.
   - Replaces the ~260 lines of duplicate JSX between Step 2 and Step 3.
2. Implement smart step detection in `FullFormWizard.tsx`:
   - Inspect `initialData` upon mount:
     - If Step 1 (Child) is valid/complete → proceed to check Step 2.
     - Advance `currentStep` automatically to the first incomplete step, so users reloading the page do not have to click "Selanjutnya" repeatedly.
3. Clean up validation helper functions:
   - Use dynamic schema dispatch or cleaner helper for section-level validation.
4. Maintain strict backward compatibility:
   - Preserve all Zod validation rules (`NIK_REGEX`, `WHATSAPP_REGEX`, etc.).
   - Preserve draft auto-save behavior and document upload logic (Kartu Keluarga and Akte Kelahiran).

## Out of Scope
- Altering form database schema or Prisma models
- Changing the 5-step wizard structure or required fields

## Specifications
- `specs/01-requirements.md` (Phase D)
- `specs/06-ui-conventions.md`

## Implementation Plan
1. Extract `ParentFormSection.tsx` from existing Step 2 and Step 3 markup in `FullFormWizard.tsx`.
2. Replace Step 2 and Step 3 JSX with `<ParentFormSection role="father" ... />` and `<ParentFormSection role="mother" ... />`.
3. Add initial step detection logic in `FullFormWizard` using `childSchema`, `fatherSchema`, `motherSchema`, and `healthSchema`.
4. Run typecheck and existing unit tests:
   - `node --experimental-strip-types src/features/registration/__tests__/form-schema.test.ts`
   - `npx tsc -b --noEmit`
   - `npm run build`

## Files Expected to Change
- `src/features/registration/components/ParentFormSection.tsx` (new)
- `src/features/registration/components/FullFormWizard.tsx`

## Acceptance Criteria
- [x] `FullFormWizard.tsx` line count reduced by 220+ lines
- [x] Data Ayah and Data Ibu render identical, clean UI using `ParentFormSection`
- [x] Reloading a partially completed form auto-advances to the first incomplete step
- [x] Saving draft and final submission continue to work seamlessly
- [x] TypeScript check and build pass with 0 errors
