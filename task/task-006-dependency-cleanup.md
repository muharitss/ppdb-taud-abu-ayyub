# Task 006 — Dependency Cleanup

## Status
DONE

## Priority
P1

## Dependencies
- Task 001

## Objective
Remove unused dependencies from package.json and fix the import bug in shadcn/ui components that causes them to import from the `cn` npm package instead of `@/lib/utils`.

## Context
The audit (Task 001) identified three unused packages and a critical import bug. The `cn` npm package is mistakenly installed and imported in button.tsx and card.tsx — these should import the `cn` utility function from `@/lib/utils`. Additionally, `keen-slider` and the `radix-ui` barrel package are installed but unused, adding unnecessary bloat.

## Scope
1. Remove `keen-slider` from package.json dependencies
2. Remove `cn` npm package from package.json (the npm package, NOT the `cn()` utility function in lib/utils)
3. Remove `radix-ui` barrel package from package.json (keep `@radix-ui/react-slot` — required by shadcn button)
4. Fix src/components/ui/button.tsx: change `import { cn } from "cn"` → `import { cn } from "@/lib/utils"`
5. Fix src/components/ui/card.tsx: same import fix
6. Run `npm install` to update package-lock.json
7. Run `tsc --noEmit` to verify no new TypeScript errors introduced
8. Run `npm run build` to verify build succeeds

## Out of Scope
- Adding any new dependencies
- Changing component logic or JSX
- Fixing the OutputStandards.tsx TypeScript error (that is Task 007)
- Removing unused components (Task 007)

## Specifications
- specs/00-project-overview.md (audit findings)

## Implementation Plan
1. Open package.json
2. Remove from dependencies: `keen-slider`, `cn`, `radix-ui`
3. Verify `@radix-ui/react-slot` remains (do NOT remove)
4. Save package.json
5. Open src/components/ui/button.tsx
6. Find: `import { cn } from "cn"` → replace with: `import { cn } from "@/lib/utils"`
7. Open src/components/ui/card.tsx
8. Find: `import { cn } from "cn"` → replace with: `import { cn } from "@/lib/utils"`
9. Run `npm install`
10. Run `npx tsc --noEmit` — expect only the OutputStandards Icon warning
11. Run `npm run build` — expect success
12. Manually verify landing page renders correctly in browser (`npm run dev`)

## Files Expected to Change
- package.json
- package-lock.json (auto-updated by npm install)
- src/components/ui/button.tsx
- src/components/ui/card.tsx

## Security Considerations
None — this is dependency cleanup. No secrets involved. Removing unused packages reduces attack surface.

## Acceptance Criteria
- [x] `keen-slider` removed from package.json
- [x] `cn` npm package removed from package.json
- [x] `radix-ui` barrel package removed from package.json
- [x] `@radix-ui/react-slot` still present in package.json
- [x] src/components/ui/button.tsx imports `cn` from `"@/lib/utils"`
- [x] src/components/ui/card.tsx imports `cn` from `"@/lib/utils"`
- [x] `npm install` completes without errors
- [x] `npx tsc --noEmit` passes (only pre-existing OutputStandards error allowed)
- [x] `npm run build` succeeds
- [x] Landing page renders correctly in browser (visual regression check)

## Verification
```bash
# Confirm removed packages are gone
grep -E '"keen-slider"|"^cn":|"radix-ui"' package.json
# Should return nothing

# Confirm import fix
grep 'from "cn"' src/components/ui/button.tsx src/components/ui/card.tsx
# Should return nothing

# Full build check
npm run build && npx tsc --noEmit
```

## Risks
- If any code still imports from `cn` npm package after removal, build will fail — grep to verify
- Removing wrong radix-ui package (must keep @radix-ui/react-slot) — double-check package.json after

## Deliverables
- Clean package.json with only needed dependencies
- button.tsx and card.tsx with correct import paths
- Passing build

## Completion Notes
- **Completed Date:** 2026-10-21
- **Changes Applied:**
  1. Removed `keen-slider`, `cn`, and `radix-ui` from `package.json`. Preserved `@radix-ui/react-slot`.
  2. Fixed `cn` imports in `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/carousel.tsx`, `src/components/Documentation.tsx`, and `src/components/examples/c-carousel-11.tsx` to point to `@/lib/utils`.
  3. Fixed `Slot` import in `src/components/ui/button.tsx` to import directly from `@radix-ui/react-slot`.
  4. Executed `npm install` (pruned 73 unused transitive packages).
  5. Verified `npx tsc --noEmit` (0 errors) and `npm run build` (build succeeds, client bundle size reduced).

