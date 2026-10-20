# 07 — Testing Strategy

## 1. Test Scope by Layer

### 1.1 Unit Tests

Target: fast, isolated, no I/O, no Supabase connection.

| Subject | What to test |
|---|---|
| **Zod schemas** | Valid input passes; each invalid input fails with the correct Indonesian error message; edge cases (empty string, null, boundary lengths) |
| **Utility functions** | `cn()`, date formatters, currency formatters (`formatRupiah`), string helpers |
| **Business logic helpers** | Registration number format generator, access code generator (correct length, correct charset, uniqueness guarantee via mock), WA message builder (correct interpolation, correct URI encoding) |
| **State helpers** | Status label maps (`registration_status` → human-readable Indonesian string), status badge color maps |

---

### 1.2 Integration Tests

Target: validate that Supabase Edge Functions and RLS policies behave correctly end-to-end against a real (local) Supabase instance.

| Subject | What to test |
|---|---|
| **Edge Functions** | `create-registration`, `submit-payment-proof`, `verify-registration-access`, `submit-full-form` — happy path and error paths |
| **RLS policies** | Each policy rule for each role: `anon`, `authenticated` (registrant), `admin` |

Run against **local Supabase** (`supabase start`) to avoid hitting production data.

---

### 1.3 E2E Tests

Target: critical user journeys from browser through frontend to backend.

| Flow | Scope |
|---|---|
| **Registration → Payment Upload → Status Check** | Full happy path |
| **Admin Payment Approval** | Admin login → approve payment → confirm status updated |
| **Payment Rejection + Re-upload** | Admin rejects → user re-uploads → admin re-reviews |
| **Status check with wrong credentials** | Rate limiting behaviour, opaque error message |

---

### 1.4 Manual Tests

These are not automated and must be performed before each production deploy:

- Visual regression of the landing page (`/`) across Chrome, Firefox, Safari (desktop + mobile widths).
- Responsive layout checks for PPDB pages at 375px, 768px, 1280px breakpoints.
- wa.me link opens correctly on Android (WhatsApp app) and desktop (WhatsApp Web).
- File upload works on mobile browsers (iOS Safari, Android Chrome).

---

## 2. Tools

### 2.1 Unit and Integration — Vitest

Vitest is the test runner for all unit and integration tests. It integrates natively with Vite and TypeScript without additional configuration overhead.

**Install as dev dependency:**

```bash
npm install --save-dev vitest @vitest/coverage-v8
```

**`vite.config.ts` addition:**

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
})
```

**`package.json` scripts:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

> **Not yet installed.** Add Vitest before writing any tests.

---

### 2.2 E2E — Playwright

Playwright drives a real browser against the running dev server or a staging deployment.

**Install:**

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**`playwright.config.ts` (minimal):**

```ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
})
```

> **Not yet installed.** Add Playwright before writing E2E tests.

---

### 2.3 RLS Testing — Supabase Test Utilities / Direct SQL

Test RLS policies by connecting to the local Supabase instance with different role contexts:

- **anon role:** Use the anon key (public Supabase client, no auth).
- **authenticated role:** Sign in a test user via `supabase.auth.signInWithPassword()` in the test setup.
- **admin role:** Use service role key (server-side only, in Edge Function tests) or a test user with an `admin` flag in the `user_roles` table.

RLS tests can be written as Vitest integration tests using `@supabase/supabase-js`, or as raw SQL test scripts run via `supabase db execute`.

Store SQL-based RLS tests in `supabase/tests/rls/`.

---

## 3. Critical Test Cases (Acceptance Criteria)

### 3.1 RLS Policies

- [ ] **anon cannot SELECT from `registrations` directly** — direct table query as anon returns empty result or permission denied.
- [ ] **anon cannot INSERT into `registrations` directly** — insert as anon is rejected (only Edge Functions with service role may insert).
- [ ] **anon cannot UPDATE `payment_status`** — update as anon is rejected.
- [ ] **authenticated user cannot SELECT another registrant's data** — row-level filter ensures user only sees their own rows.
- [ ] **authenticated user cannot UPDATE another registrant's `payment_status`** — rejected.
- [ ] **admin can SELECT all registrations** — admin role (via `user_roles` or custom claim) sees all rows.
- [ ] **admin can UPDATE `registration_status`** — admin role can transition statuses.

### 3.2 Edge Function: `verify-registration-access`

- [ ] Returns `{ registration_status, payment_status }` for correct credentials.
- [ ] Returns `{ form_completeness_indicator }` (bool or %) for correct credentials.
- [ ] Returns `{ payment_rejection_reason }` only when `payment_status = payment_rejected`.
- [ ] Does **not** return raw form data, documents, proof URLs, or `access_code` hash.
- [ ] Returns **identical opaque error** (`401`) for wrong `access_code`.
- [ ] Returns **identical opaque error** (`401`) for non-existent `registration_number`.
- [ ] Error message text is identical in both failure cases: *"Nomor pendaftaran atau kode akses tidak valid."*

### 3.3 Edge Function: `create-registration`

- [ ] Generates a unique `registration_number` on every call.
- [ ] `registration_number` format matches `PPDB-YYYY-NNNN` (or defined format).
- [ ] Returns `access_code` (plain text) exactly once in the response.
- [ ] Subsequent calls (e.g., status check) do **not** return `access_code`.
- [ ] Stored `access_code` in DB is a hash, not plain text.

### 3.4 Database Constraints

- [ ] `registration_number` has a `UNIQUE` constraint — duplicate insert is rejected at DB level.
- [ ] `registration_status` column only accepts defined enum values.
- [ ] `payment_status` column only accepts defined enum values.

### 3.5 Rate Limiting

- [ ] After 5 failed `verify-registration-access` attempts within 15 minutes (same IP or same `registration_number`), the next attempt returns `429 Too Many Requests` with `Retry-After` header.
- [ ] Rate limit resets after the window expires.
- [ ] Successful attempt does not decrement or reset the counter (to prevent timing attacks).

### 3.6 Business Logic Helpers

- [ ] `generateRegistrationNumber(year, sequence)` returns correctly formatted string.
- [ ] `generateAccessCode()` returns 8-character alphanumeric string.
- [ ] `buildWhatsAppMessage({ childName, registrationNumber, accessCode, statusPageUrl })` returns exact template with all variables substituted.
- [ ] `buildWaMeLink(message, adminNumber)` returns correctly URI-encoded wa.me URL.

---

## 4. Test File Organization

```
src/
  features/
    registration/
      __tests__/
        initial-registration.schema.test.ts
        full-form.schema.test.ts
        registration-number.test.ts
        access-code.test.ts
        wa-message-builder.test.ts
    payment/
      __tests__/
        payment-proof.schema.test.ts
    status/
      __tests__/
        status-check.schema.test.ts
    admin/
      __tests__/
        payment-review.schema.test.ts
  lib/
    __tests__/
      utils.test.ts

supabase/
  tests/
    rls/
      registrations.rls.test.ts
      payment_status.rls.test.ts
      audit_log.rls.test.ts
    functions/
      create-registration.test.ts
      verify-registration-access.test.ts
      submit-payment-proof.test.ts
      submit-full-form.test.ts

e2e/
  registration-flow.spec.ts
  admin-payment-approval.spec.ts
  status-check.spec.ts
  payment-rejection-reupload.spec.ts
```

---

## 5. CI Considerations

> **CI setup is out of scope for Phase 0.**

The following is documented for future implementation:

- Tests should be run automatically on every pull request before merge.
- Recommended CI: GitHub Actions.
- Suggested jobs:
  - `unit-tests`: `npm run test:run` (Vitest, no Supabase needed)
  - `e2e-tests`: `npx playwright test` (requires running dev server or staging URL)
  - `rls-tests`: requires a Supabase local instance spun up in CI (`supabase start`)
- Secrets needed in CI: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (for integration/E2E against staging), `SUPABASE_SERVICE_ROLE_KEY` (for RLS tests — **never expose in VITE_ prefix**).
- Coverage thresholds can be enforced via `--coverage --coverage.thresholds.lines=80` once baseline is established.
