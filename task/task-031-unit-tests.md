# Task 031 — Unit Tests

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 013 — Edge Function: create-registration
- Task 014 — Edge Function: verify-registration-access
- Task 022 — Full Form UI

## Objective
Write unit tests for Zod schemas, utility functions, and business logic using Vitest.

## Context
Core business logic — schema validation, WhatsApp message construction, registration number format, etc. — needs automated test coverage to catch regressions and verify correctness.

## Scope
1. Install Vitest: `npm install -D vitest @testing-library/react @testing-library/user-event`
2. Configure Vitest in `vite.config.ts`
3. Test: Zod schemas (valid inputs pass, invalid inputs fail with correct messages)
4. Test: WhatsApp message builder (correct encoding, correct wa.me URL construction)
5. Test: `registration_number` format validation (PPDB-YYYY-XXXXX)
6. Test: `wa.me` URL construction (correct phone format, correct encoding)

## Out of Scope
- Integration tests (task 033)
- RLS policy tests (task 032)
- Component rendering tests (can be added later)

## Specifications
- specs/07-testing-strategy.md

## Implementation Plan
1. Install Vitest and testing libraries
2. Add Vitest config to `vite.config.ts`:
   ```ts
   test: {
     environment: 'jsdom',
     globals: true,
   }
   ```
3. Add `"test": "vitest"` to `package.json` scripts
4. Create `src/__tests__/` directory
5. Write schema tests: `registrationSchema.test.ts`, `formSchema.test.ts` (after task 021)
6. Write utility tests: `whatsapp.test.ts` — `buildWaMessage()`, `buildWaLink()`
7. Write format tests: `registrationNumber.test.ts`
8. Ensure `npm test` runs all tests

## Files Expected to Change
- `package.json` (add devDependencies and test script)
- `vite.config.ts` (add test config)
- `src/__tests__/registrationSchema.test.ts` (new)
- `src/__tests__/whatsapp.test.ts` (new)
- `src/__tests__/registrationNumber.test.ts` (new)
- `src/__tests__/formSchema.test.ts` (new — after task 021)

## Security Considerations
N/A — test files should not contain real credentials or production data.

## Acceptance Criteria
- [ ] Vitest installed and configured
- [ ] `npm test` runs successfully
- [ ] Zod schema tests: valid input passes, invalid input fails with correct error
- [ ] `buildWaMessage()` test: correct interpolation and encoding
- [ ] `buildWaLink()` test: correct `wa.me` URL format
- [ ] `registration_number` format test: valid format passes, invalid fails

## Verification
```bash
npm install
npm test
```

## Risks
- `formSchema.test.ts` depends on task 021 (BLOCKED) — write other tests first
- `@testing-library/react` version must be compatible with React 19

## Deliverables
- Vitest configured and running
- Unit tests for schemas and utilities

## Completion Notes
_Not started_
