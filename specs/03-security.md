# PPDB TAUD Abu Ayyub — Security Specification

## 1. Access Code Generation and Storage

### Requirements
- Access codes are generated **server-side only** inside the `create-registration` Edge Function.
- Generation uses the Deno runtime's `crypto.getRandomValues()` (CSPRNG) — never `Math.random()`.
- Code format: **8 uppercase alphanumeric characters** (charset: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, ambiguous chars `0O1I` excluded for readability).
- **Entropy:** 32 characters × 8 positions ≥ 40 bits — adequate for a rate-limited, non-public access system.
- The plaintext access code is returned to the client **exactly once** in the HTTP response of `create-registration`. It is never stored in plaintext anywhere.
- The plaintext code is **never** logged (no application log, no Supabase log, no console.log).
- The code is hashed using **bcrypt** (cost factor ≥ 10) or **argon2id** before being stored in `registration_access.access_code_hash`.
- The `registration_access` table is accessible only to Edge Functions via service role; no RLS policy grants anon or authenticated users direct read access.

### Lifecycle
1. Edge Function generates plaintext code.
2. Edge Function hashes the code and writes hash to `registration_access`.
3. Edge Function returns plaintext code in HTTP response (TLS-encrypted in transit).
4. Frontend displays the code once; parent copies/notes it.
5. **Plaintext code is now gone forever.** No recovery path exists.
6. Future verifications compare user-supplied plaintext against the stored hash.

---

## 2. Registration Number Strategy

- Format: `PPDB-YYYY-XXXXX` (year + 5-digit zero-padded sequence, e.g., `PPDB-2026-00001`).
- Generated server-side using a PostgreSQL sequence to guarantee uniqueness.
- Registration numbers are **public identifiers** — they are not secret. A registration number alone grants no access to any data.
- Access to registration data always requires **both** registration number and the corresponding access code.
- Registration numbers should not be sequential-guessable in a meaningful way (the 5-digit range across one PPDB period is small, but the access code requirement neutralizes enumeration attacks).

---

## 3. Status Page and Form Gate Access

### Verification Flow
1. User submits `{ registration_number, access_code }` to the `verify-registration-access` Edge Function.
2. Edge Function looks up the registration by `registration_number`.
3. Edge Function compares `access_code` against `registration_access.access_code_hash` using constant-time comparison (bcrypt/argon2 `verify`).
4. Response is **always one of:**
   - `{ valid: true, registration_id, status, payment_status }` — success
   - `{ valid: false }` — failure, **no further detail** (does not indicate whether the registration number exists)

### Rate Limiting
- Maximum **5 failed verification attempts** per IP address per 15-minute window.
- Counter stored in `audit_events` or a Redis-compatible store (Upstash Redis via Edge Function if needed).
- After 5 failures, subsequent attempts return HTTP 429 with a generic message and a `Retry-After` header.
- Successful verification resets the failure counter for that IP.

### Session Token
- After successful verification, the Edge Function returns a short-lived **JWT** (signed with a secret known only to Edge Functions) encoding `{ registration_id, registration_number }`.
- The frontend stores this JWT in `sessionStorage` (not `localStorage`) and attaches it to subsequent Phase D and Phase F requests.
- JWT lifetime: 2 hours.
- JWTs are verified by Edge Functions on every sensitive request; they are not trusted by PostgREST directly.

---

## 4. Row-Level Security (RLS) Policies

RLS is **enabled on every table.** The default is deny-all.

### `registrations`

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ❌ | ❌ | ❌ | ❌ |
| `authenticated` (parent) | ❌ (via Edge Fn only) | ❌ (via Edge Fn only) | ❌ (via Edge Fn only) | ❌ |
| `service_role` (Edge Fn) | ✅ | ✅ | ✅ | ❌ |
| `admin` (via custom claim) | ✅ (all rows) | ❌ | ✅ | ❌ |

> Parents never have a Supabase Auth session. All parent operations go through Edge Functions using the service role key (which is never exposed to the frontend).

### `registration_access`

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ❌ | ❌ | ❌ | ❌ |
| `service_role` (Edge Fn) | ✅ | ✅ | ❌ | ❌ |
| `admin` | ❌ | ❌ | ❌ | ❌ |

> Even admins cannot read access code hashes. The hash is exclusively used by Edge Functions for verification.

### `payments`

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ❌ | ❌ | ❌ | ❌ |
| `service_role` (Edge Fn) | ✅ | ✅ | ✅ | ❌ |
| `admin` | ✅ (own rows of managed registrations) | ❌ | ✅ (review fields only) | ❌ |

### `registration_form_data` / `registration_documents`

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ❌ | ❌ | ❌ | ❌ |
| `service_role` | ✅ | ✅ | ✅ | ❌ |
| `admin` | ✅ | ❌ | ❌ | ❌ |

### `admin_profiles`

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ❌ | ❌ | ❌ | ❌ |
| `authenticated` (admin) | ✅ (own row only) | ❌ | ❌ | ❌ |
| `service_role` | ✅ | ✅ | ✅ | ✅ |

### `audit_events`

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ❌ | ❌ | ❌ | ❌ |
| `authenticated` (admin) | ✅ (all) | ❌ | ❌ | ❌ |
| `service_role` | ✅ | ✅ | ❌ | ❌ |

> Nobody can UPDATE or DELETE audit events — the log is append-only.

### `ppdb_config`

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `anon` | ✅ (non-sensitive keys only, via policy filter) | ❌ | ❌ | ❌ |
| `authenticated` (admin) | ✅ | ❌ | ✅ | ❌ |
| `service_role` | ✅ | ✅ | ✅ | ✅ |

---

## 5. Storage Security

### Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `payment-proofs` | **Private** | Parent-uploaded payment screenshots; admin-only view |
| `registration-documents` | **Private** | Uploaded document scans (Akte, KK, foto); admin-only view |

### Rules
- Both buckets are created with `public = false` in Supabase.
- Direct browser access to any file URL is denied (no public bucket policy).
- Files are accessed via **signed URLs** generated by Edge Functions or admin-authorized requests. Signed URL lifetime: 15 minutes (read-only).
- File validation in `submit-payment-proof` Edge Function:
  - Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`
  - Maximum file size: **5 MB**
  - MIME type is verified from file magic bytes, not only from the `Content-Type` header.
- File paths follow the pattern `{registration_id}/{timestamp}.{ext}` to prevent path traversal.
- No executable file types (`.js`, `.php`, `.exe`, etc.) can be stored — MIME whitelist enforces this.

---

## 6. Payment Security

- Payment proof upload is gated behind a valid (registration number + access code) verification.
- Payment approval is an **admin-only** operation performed through the `admin-review-payment` Edge Function.
- Approval requires:
  1. A valid Supabase Auth JWT belonging to an admin.
  2. A corresponding row in `admin_profiles` (checked via service role inside Edge Function).
- Payment status transitions are one-way (cannot be un-verified except by another admin action, which is also logged).
- Every payment decision (approve/reject) is written to `audit_events` with:
  - `actor_id` (admin's `auth.users.id`)
  - `action` (`payment_approved` | `payment_rejected`)
  - `entity_type` (`payments`)
  - `entity_id` (payment row UUID)
  - `metadata` (review notes, decision timestamp)
- Admin cannot alter `payments.proof_file_path` — upload and review are separate, non-overlapping operations.

---

## 7. Admin Security

### Account Creation
- Admin accounts are created **manually** by the project owner directly in Supabase Auth dashboard.
- There is **no `/admin/register` route** and no Edge Function that creates admin accounts.
- After creating a Supabase Auth user, the project owner must also insert a row into `admin_profiles` with the appropriate `role`.

### Authentication
- Supabase Auth email + password. MFA (TOTP) is strongly recommended and should be enabled for all admin accounts via Supabase dashboard.
- Session management is handled by the Supabase JS client (`supabase.auth.getSession()`, `onAuthStateChange`).

### Authorization
- Frontend admin route guards are a **UX convenience** only — they prevent navigation to admin pages but are not a security boundary.
- All authorization decisions that matter happen in:
  1. **RLS policies** (table-level, DB-enforced)
  2. **Edge Functions** (check `admin_profiles` via service role before executing sensitive operations)
- A frontend bypass (e.g., modifying JavaScript) cannot grant actual data access because the DB enforces roles independently.

### Admin Role Claim
- `admin_profiles.role` is the source of truth for admin identity.
- Edge Functions use the service role key to read `admin_profiles` and verify the caller's `auth.uid()` has a record before proceeding.

---

## 8. Secrets Management

### Rules

| Rule | Detail |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` never in `VITE_*` | Vite embeds `VITE_*` vars in the JS bundle — service role key must never appear there |
| Service role key set via Supabase secrets | `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...` — available to Edge Functions only |
| `.env.local` is git-ignored | Contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only |
| `.env.example` is committed | Shows the structure without real values |
| No secrets in code | No hardcoded keys, passwords, or tokens in source files |
| Secret rotation | If a key is accidentally committed, rotate it immediately in Supabase dashboard; treat old key as compromised |

### What Is Safe to Expose
- `VITE_SUPABASE_URL`: Public project endpoint — safe; access is gated by RLS.
- `VITE_SUPABASE_ANON_KEY`: The anon key is designed to be public; it only grants access allowed by RLS policies.

### What Must Never Be Exposed
- `SUPABASE_SERVICE_ROLE_KEY`: Bypasses RLS — must stay server-side only (Edge Functions).
- Any future API keys for third-party services must follow the same rule.

---

## 9. Data Privacy

### Principles
- **Minimal collection:** Collect only data required for the registration process. Do not collect data not explicitly needed.
- **Children's data:** The application stores data about children under 13. This data must be:
  - Accessible only to authorized school administrators.
  - Protected by RLS with no anon or broad authenticated access.
  - Not shared with third parties (no analytics SDKs that transmit PII, no third-party error trackers with PII).

### Retention
- **TBD** — The school must define a data retention policy. Recommended starting point:
  - Rejected applicants: Delete personal data 90 days after rejection.
  - Accepted students: Retain for duration of enrollment + 1 year, then archive or delete.
  - Audit logs: Retain for 3 years minimum.
- A `ppdb_config` key `data_retention_policy` can hold the agreed policy as a JSON document.

### No Third-Party Analytics
- No Google Analytics, Mixpanel, Hotjar, or similar tools that would transmit parent/child PII to third-party servers.
- If analytics are needed in the future, use a self-hosted or privacy-first solution (e.g., Plausible, Umami).

### HTTPS Only
- The application must be served exclusively over HTTPS. HTTP must redirect to HTTPS. Vercel enforces this by default.
