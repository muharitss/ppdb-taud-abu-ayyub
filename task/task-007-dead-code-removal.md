# Task 007 — Dead Code Removal

## Status
COMPLETED

## Priority
P1

## Dependencies
- Task 006

## Objective
Remove confirmed dead files (Vite boilerplate assets and CSS), delete or archive unused components, and fix the TypeScript error in OutputStandards.tsx.

## Context
The audit identified several files that are never imported or used: App.css (Vite boilerplate), react.svg, vite.svg, and four unused component files. Additionally, OutputStandards.tsx has a TypeScript strict-mode error (`const Icon = item.icon` declared but never used in JSX). These must be cleaned up before restructuring (Task 008) to avoid confusion.

## Scope
1. Delete src/App.css (Vite boilerplate, verified not imported anywhere)
2. Delete src/assets/react.svg (Vite boilerplate, not referenced)
3. Delete public/vite.svg (Vite boilerplate, not referenced in index.html or code)
4. Verify zero imports before deleting each unused component, then delete:
   - src/components/Contact.tsx
   - src/components/Header.tsx
   - src/components/ProgramMaterials.tsx
   - src/components/Requirements.tsx
5. Delete src/components/examples/ directory (reference files, not production code)
6. Fix OutputStandards.tsx line ~77: `const Icon = item.icon` — replace with actual JSX usage: `<Icon className="w-8 h-8 text-[var(--color-primary)]" />` (or remove if Icon is truly not meant to be rendered — confirm intent first)
7. Run `npx tsc --noEmit` — expect 0 errors
8. Run `npm run build` — expect success
9. Verify landing page visual appearance is unchanged

## Out of Scope
- Refactoring component content or design
- Changing landing page visuals
- Moving components to new directory structure (Task 008)
- Adding new features

## Specifications
- specs/00-project-overview.md

## Implementation Plan
1. Grep for imports of each file before deleting:
   ```bash
   grep -r "App.css" src/ --include="*.tsx" --include="*.ts" --include="*.css"
   grep -r "react.svg" src/ --include="*.tsx" --include="*.ts"
   grep -r "vite.svg" src/ public/ --include="*.tsx" --include="*.ts" --include="*.html"
   grep -r "Contact\b" src/ --include="*.tsx" --include="*.ts"
   grep -r "Header\b" src/ --include="*.tsx" --include="*.ts"
   grep -r "ProgramMaterials\b" src/ --include="*.tsx" --include="*.ts"
   grep -r "Requirements\b" src/ --include="*.tsx" --include="*.ts"
   ```
2. Confirm each grep returns no active imports
3. Delete confirmed dead files
4. Open OutputStandards.tsx, locate `const Icon = item.icon`
5. Check surrounding JSX — determine whether Icon was meant to render or was accidentally left unused
6. Fix: use `<Icon className="w-8 h-8 text-[var(--color-primary)]" />` where appropriate, or remove the variable if not needed
7. Run `npx tsc --noEmit` → must show 0 errors
8. Run `npm run build`
9. Run `npm run dev` and visually inspect landing page

## Files Expected to Change
- src/App.css (deleted)
- src/assets/react.svg (deleted)
- public/vite.svg (deleted)
- src/components/Contact.tsx (deleted after import verification)
- src/components/Header.tsx (deleted after import verification)
- src/components/ProgramMaterials.tsx (deleted after import verification)
- src/components/Requirements.tsx (deleted after import verification)
- src/components/examples/ (deleted)
- src/components/OutputStandards.tsx (TypeScript fix)

## Security Considerations
None.

## Acceptance Criteria
- [x] src/App.css deleted
- [x] src/assets/react.svg deleted
- [x] public/vite.svg deleted
- [x] src/components/Contact.tsx deleted (confirmed no active imports)
- [x] src/components/Header.tsx deleted (confirmed no active imports)
- [x] src/components/ProgramMaterials.tsx deleted (confirmed no active imports)
- [x] src/components/Requirements.tsx deleted (confirmed no active imports)
- [x] src/components/examples/ deleted
- [x] OutputStandards.tsx TypeScript error fixed
- [x] `npx tsc --noEmit` passes with 0 errors
- [x] `npm run build` succeeds
- [x] Landing page visual appearance unchanged (manual check)

## Verification
```bash
# Confirm dead files gone
ls src/App.css src/assets/react.svg public/vite.svg 2>&1
# Should: "No such file or directory" for all

# Confirm unused components gone
ls src/components/Contact.tsx src/components/Header.tsx \
   src/components/ProgramMaterials.tsx src/components/Requirements.tsx \
   src/components/examples/ 2>&1
# Should: "No such file or directory" for all

# TypeScript clean build
npx tsc --noEmit && npm run build
```

## Risks
- OutputStandards.tsx Icon fix may change visual rendering — verify the component renders icons correctly after fix
- grep may miss dynamic imports — carefully check for string-based imports or lazy() calls before deleting components

## Deliverables
- Clean src/ with no dead files
- OutputStandards.tsx with passing TypeScript
- Clean `tsc --noEmit` output (0 errors)

## Completion Notes
All dead files (`src/App.css`, `src/assets/react.svg`, `public/vite.svg`, `src/components/examples/`) and unused components (`Contact.tsx`, `Header.tsx`, `ProgramMaterials.tsx`, `Requirements.tsx`) were verified to have 0 references and deleted. `src/components/OutputStandards.tsx` was updated to render `<Icon className="w-8 h-8 text-[var(--color-primary)]" />`, resolving the commented-out variable. `npx tsc --noEmit` and `npm run build` succeed with 0 errors.
