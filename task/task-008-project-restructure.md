# Task 008 — Project Restructure

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 006
- Task 007

## Objective
Restructure the project from a flat components/ directory to a feature-oriented architecture, install React Router, set up routing, and scaffold all feature directories for future implementation.

## Context
The current flat structure (all components in src/components/) will not scale for a multi-page PPDB system. A feature-based structure (src/features/{landing,registration,payments,admin,...}) separates concerns cleanly. This task does NOT implement features — it only moves existing code and scaffolds empty directories with placeholder files.

## Scope
1. Install React Router: `npm install react-router-dom`
2. Create feature-based directory structure (see Implementation Plan)
3. Move all landing page components from src/components/ to src/features/landing/components/
4. Create src/features/landing/pages/LandingPage.tsx that composes all landing sections
5. Create src/app/router.tsx with React Router routes
6. Create src/app/providers.tsx (wraps app with BrowserRouter and future providers)
7. Update src/App.tsx to use router and providers
8. Update all import paths broken by file moves
9. Scaffold placeholder pages for all future routes (empty components with route comment)
10. Create src/lib/env.ts (typed environment variable accessor stubs)
11. Create vercel.json with SPA rewrite rule
12. Verify full build and manual visual check

## Out of Scope
- Implementing any PPDB feature (registration, payment, admin)
- Changing landing page content or visual design
- Supabase integration (Task 009)
- Authentication implementation (Task 012)

## Specifications
- specs/02-architecture.md

## Implementation Plan
1. `npm install react-router-dom`
2. Create directories:
   ```
   src/app/
   src/app/layouts/
   src/features/
   src/features/landing/
   src/features/landing/components/
   src/features/landing/pages/
   src/features/registration/
   src/features/registration/components/
   src/features/registration/pages/
   src/features/registration/schemas/
   src/features/registration/services/
   src/features/registration/types/
   src/features/payments/
   src/features/payments/components/
   src/features/payments/pages/
   src/features/payments/services/
   src/features/payments/types/
   src/features/status/
   src/features/status/components/
   src/features/status/pages/
   src/features/documents/
   src/features/documents/components/
   src/features/documents/pages/
   src/features/admin/
   src/features/admin/components/
   src/features/admin/pages/
   src/features/admin/layouts/
   src/lib/supabase/
   src/hooks/
   src/types/
   src/config/
   ```
3. Move all landing components (Navbar, Hero, Documentation, About, VissionMission, Programs, RegistrationRequirements, ContactInfo, Location, Footer, OutputStandards) from src/components/ to src/features/landing/components/
4. Create src/features/landing/pages/LandingPage.tsx composing all sections
5. Create src/app/router.tsx:
   - Route `/` → LandingPage
   - Route `/daftar` → RegistrationStartPage (placeholder)
   - Route `/bayar/:registrationNumber` → PaymentPage (placeholder)
   - Route `/status` → StatusPage (placeholder)
   - Route `/admin/login` → AdminLoginPage (placeholder)
   - Route `/admin/*` → AdminLayout > admin sub-routes (placeholder)
   - Route `*` → NotFoundPage (placeholder)
6. Create src/app/providers.tsx wrapping BrowserRouter
7. Update src/App.tsx to render `<Providers><Router /></Providers>`
8. Update all internal imports in moved components
9. Create src/lib/env.ts with typed accessors for VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
10. Create vercel.json:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```
11. `npm run build && npx tsc --noEmit`
12. `npm run dev` — verify `/` renders landing page identically to before

## Files Expected to Change
- package.json (react-router-dom added)
- package-lock.json
- src/App.tsx (updated to use router/providers)
- src/main.tsx (may need adjustment)
- All landing component files (moved + imports updated)
- All new files created (see directory list above)
- vercel.json (new)

**Document all moved files in Completion Notes.**

## Security Considerations
- vercel.json SPA rewrite must not expose server-side routes
- Admin routes will be protected by auth guard (implemented in Task 012, not here)
- Placeholder pages must not expose sensitive UI or data

## Acceptance Criteria
- [ ] react-router-dom installed
- [ ] Feature directory structure created as specified
- [ ] All landing components moved to src/features/landing/components/
- [ ] src/features/landing/pages/LandingPage.tsx created
- [ ] src/app/router.tsx created with all routes
- [ ] src/app/providers.tsx created
- [ ] Route `/` renders landing page — visually identical to before restructure
- [ ] Route `/daftar` renders placeholder (no 404 in browser)
- [ ] Route `/status` renders placeholder
- [ ] Route `/admin/login` renders placeholder
- [ ] src/lib/env.ts created
- [ ] vercel.json created with SPA rewrite
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` succeeds

## Verification
```bash
npm run build && npx tsc --noEmit

# Verify vercel.json
cat vercel.json

# Check no component files remain at old location (if src/components/ is fully migrated)
ls src/components/
```

## Risks
- Import path breakage after moves — fix incrementally, verify build after each batch
- If src/components/ui/ shadcn components are moved, all @/components/ui/* imports break — DO NOT move ui/ components; keep them at src/components/ui/
- React Router v6 vs v7 API differences — verify installed version and use correct API

## Deliverables
- Feature-based directory structure
- React Router configured with all planned routes
- Landing page rendering correctly at `/`
- Placeholder pages at all future routes
- vercel.json for SPA deployment
- Passing build and TypeScript check

## Completion Notes
_Not started_
