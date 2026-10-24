# Task 037 — Landing Page CTA & Navigation Routing Fix

## Status
DONE

## Priority
P1

## Dependencies
- Task 015 — Registration UI
- Task 022 — Full Form UI

## Objective
Connect landing page call-to-actions directly to the web application registration route (`/daftar`), re-enable the navbar CTA button, and remove unused placeholder pages.

## Context
The recent audit discovered that the main CTA buttons on the landing page still link to an external Google Form (`https://bit.ly/PPDB-TAUDSaqu-A4`). Prospective parents clicking "Daftar Sekarang" from the hero or requirements section are directed outside the web application instead of `/daftar`. Additionally, the navbar CTA is commented out, and an unused placeholder `DocumentUploadPage.tsx` remains in the tree.

## Scope
1. Update `src/features/landing/components/Hero.tsx`:
   - Change "Daftar Sekarang" button `href` to `/daftar` using client-side navigation (`Link` or relative path `/daftar`).
2. Update `src/features/landing/components/RegistrationRequirements.tsx`:
   - Change "Daftar Sekarang" button `href` from `https://bit.ly/PPDB-TAUDSaqu-A4` to `/daftar`.
3. Update `src/features/landing/components/Navbar.tsx`:
   - Uncomment and enable the "Daftar Sekarang" button, routing to `/daftar`.
4. Delete dead code placeholder:
   - Remove `src/features/documents/pages/DocumentUploadPage.tsx` (verified unused, since document uploads are integrated directly into step 5 of the full form wizard).
5. Verify responsive layout and click navigation on mobile & desktop views.

## Out of Scope
- Redesigning landing page visual styles or color palette
- Modifying backend Edge Functions

## Specifications
- `specs/01-requirements.md` (Requirement A-07 & A-09)
- `specs/06-ui-conventions.md`

## Implementation Plan
1. In `Hero.tsx`, replace external `<a>` tag with `<Link to="/daftar">` from `react-router-dom`.
2. In `RegistrationRequirements.tsx`, replace external `<a>` tag with `<Link to="/daftar">`.
3. In `Navbar.tsx`, uncomment the "Daftar Sekarang" button and link to `/daftar`.
4. Delete `src/features/documents/pages/DocumentUploadPage.tsx`.
5. Run TypeScript check and production build: `npx tsc -b --noEmit && npm run build`.

## Files Expected to Change
- `src/features/landing/components/Hero.tsx`
- `src/features/landing/components/RegistrationRequirements.tsx`
- `src/features/landing/components/Navbar.tsx`
- `src/features/documents/pages/DocumentUploadPage.tsx` (deleted)

## Acceptance Criteria
- [x] Clicking "Daftar Sekarang" in Hero navigates to `/daftar`
- [x] Clicking "Daftar Sekarang" in Syarat Pendaftaran navigates to `/daftar`
- [x] Navbar displays active "Daftar Sekarang" button navigating to `/daftar`
- [x] `DocumentUploadPage.tsx` removed from repository
- [x] `npx tsc -b --noEmit` and `npm run build` pass with 0 errors
