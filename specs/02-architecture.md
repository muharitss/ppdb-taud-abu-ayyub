# PPDB TAUD Abu Ayyub — Architecture

## 1. Architecture Overview

```
┌──────────────────────────────────────────┐
│              Browser (SPA)               │
│  React 19 + TypeScript + Vite            │
│  Tailwind CSS v4 + shadcn/ui             │
│  React Router v6 (client-side)           │
│  TanStack Query (server state)           │
│  React Hook Form + Zod (forms)           │
└────────────────────┬─────────────────────┘
                     │ HTTPS / REST / Realtime
                     ▼
┌──────────────────────────────────────────┐
│              Supabase                    │
│  ┌─────────────┐  ┌────────────────────┐│
│  │  PostgREST  │  │   Edge Functions   ││
│  │  (auto API) │  │  (sensitive ops)   ││
│  └──────┬──────┘  └────────┬───────────┘│
│         │                  │             │
│  ┌──────▼──────────────────▼──────────┐ │
│  │         PostgreSQL (RLS enabled)   │ │
│  └────────────────────────────────────┘ │
│  ┌─────────────┐  ┌────────────────────┐│
│  │  Auth       │  │  Storage           ││
│  │  (email+pw) │  │  (private buckets) ││
│  └─────────────┘  └────────────────────┘│
└──────────────────────────────────────────┘
```

**No separate backend server.** All server-side logic runs in Supabase Edge Functions (Deno runtime). The Supabase PostgREST API is used for safe read operations that are guarded by RLS; writes that require server-side secrets or business logic go through Edge Functions.

### Why No Express/NestJS Server?

| Concern | Decision |
|---|---|
| Access code generation | Edge Function (CSPRNG, server-side, no secret leak) |
| Payment proof upload | Edge Function (validates file, writes to private bucket) |
| Status verification | Edge Function (rate limiting, hash comparison) |
| Admin payment review | Edge Function (role check + audit log) |
| Deployment ops | Zero — Supabase hosts Edge Functions |
| Cold start | Acceptable for low-volume school registration |

---

## 2. Frontend Architecture

### Feature-Oriented Directory Structure

```
src/
├── assets/                        # Static assets (images, fonts if any)
├── components/
│   └── ui/                        # shadcn/ui generated components only
│       ├── button.tsx
│       ├── card.tsx
│       └── carousel.tsx
├── data/
│   └── content.ts                 # Static landing-page copy and config
├── features/
│   ├── landing/                   # Phase A — public marketing site
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── VisionMission.tsx
│   │   │   ├── Programs.tsx
│   │   │   ├── OutputStandards.tsx
│   │   │   ├── RegistrationRequirements.tsx
│   │   │   ├── Documentation.tsx
│   │   │   ├── ContactInfo.tsx
│   │   │   ├── Location.tsx
│   │   │   └── Footer.tsx
│   │   └── index.tsx              # Landing page route component
│   ├── registration/              # Phase B — initial registration form
│   │   ├── components/
│   │   │   ├── RegistrationForm.tsx
│   │   │   └── AccessCodeReveal.tsx
│   │   ├── hooks/
│   │   │   └── useCreateRegistration.ts
│   │   └── index.tsx
│   ├── payment/                   # Phase C — payment upload
│   │   ├── components/
│   │   │   ├── PaymentInstructions.tsx
│   │   │   └── PaymentProofUpload.tsx
│   │   ├── hooks/
│   │   │   └── useSubmitPaymentProof.ts
│   │   └── index.tsx
│   ├── documents/                 # Phase D — full form + document upload
│   │   ├── components/            # TBD — awaiting school requirements
│   │   ├── hooks/
│   │   └── index.tsx
│   ├── status/                    # Phase F — registration status page
│   │   ├── components/
│   │   │   ├── StatusLookupForm.tsx
│   │   │   └── StatusDisplay.tsx
│   │   ├── hooks/
│   │   │   └── useVerifyAccess.ts
│   │   └── index.tsx
│   └── admin/                     # Phase G — admin dashboard
│       ├── components/
│       │   ├── AdminLayout.tsx
│       │   ├── DashboardSummary.tsx
│       │   ├── RegistrationList.tsx
│       │   ├── RegistrationDetail.tsx
│       │   └── PaymentReviewPanel.tsx
│       ├── hooks/
│       │   ├── useAdminRegistrations.ts
│       │   └── useAdminReviewPayment.ts
│       └── index.tsx
├── lib/
│   ├── utils.ts                   # cn() helper (clsx + tailwind-merge)
│   ├── supabase.ts                # Supabase client (anon key only)
│   └── validations/               # Shared Zod schemas
│       ├── registration.ts
│       └── payment.ts
├── hooks/                         # Shared hooks
│   └── useMediaQuery.ts
├── router/
│   └── index.tsx                  # React Router route definitions
├── types/
│   └── database.ts                # Generated Supabase types (supabase gen types)
├── App.tsx
├── main.tsx
└── index.css
```

### Supabase Edge Functions

```
supabase/
├── functions/
│   ├── create-registration/
│   │   └── index.ts
│   ├── verify-registration-access/
│   │   └── index.ts
│   ├── submit-payment-proof/
│   │   └── index.ts
│   ├── admin-review-payment/
│   │   └── index.ts
│   └── document-upload/           # Phase D (deferred until Task 020 requirements confirmed)
└── migrations/
    ├── 0001_initial_schema.sql
    └── 0002_rls_policies.sql
```

---

## 3. Routing Strategy

React Router v6 is used with `createBrowserRouter`. The app is a client-side SPA; the hosting platform (Vercel) must be configured with an SPA fallback rule to serve `index.html` for all non-asset paths.

### Route Map

```
/                          → Landing page (Phase A)
/daftar                    → Initial registration form (Phase B)
/daftar/berhasil           → Access code reveal + next steps (Phase B confirmation)
/daftar/pembayaran/:id     → Payment instructions + upload (Phase C) [:id = registration UUID]
/daftar/formulir/:id       → Full registration form (Phase D) — protected by access code [:id = registration UUID]
/daftar/selesai/:id        → Success + WhatsApp link (Phase E) [:id = registration UUID]
/status                    → Status lookup form (Phase F)
/status/:registrationNumber → Status display (Phase F) — protected by access code [:registrationNumber = PPDB-YYYY-XXXXX]

/admin                     → Redirects to /admin/login if not authenticated
/admin/login               → Admin login page
/admin/dashboard           → Admin dashboard summary (Phase G)
/admin/pendaftaran         → Registration list (Phase G)
/admin/pendaftaran/:id     → Registration detail (Phase G) [:id = registration UUID]
```

### Route Protection

- **Parent routes** (payment, full form): Gated by a valid access code stored in `sessionStorage` after `verify-registration-access` succeeds. Access code is never re-verified from sessionStorage alone — it is always server-verified on page load.
- **Admin routes**: Gated by an active Supabase Auth session with a record in `admin_profiles`. Session is checked via `supabase.auth.getSession()` on mount. Unauthenticated requests redirect to `/admin/login`.
- **Parameter semantics**: `:id` consistently represents the internal `registrations.id` (UUID), returned to the frontend upon initial creation or access verification. `:registrationNumber` is the public code formatted as `PPDB-YYYY-XXXXX`.

### Vercel SPA Fallback (`vercel.json`)

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

---

## 4. State Management

| State Type | Tool | Rationale |
|---|---|---|
| Server state (fetching, caching, mutations) | **TanStack Query v5** | Automatic caching, background refetch, mutation state, deduplication |
| Form state | **React Hook Form** | Performant, minimal re-renders, integrates with Zod via `@hookform/resolvers` |
| Schema / validation | **Zod** | Type-safe validation shared between form and Edge Function |
| UI / local state | **React `useState` / `useReducer`** | Simple component-level state |
| Authentication session | **Supabase Auth** | `supabase.auth.getSession()` + `onAuthStateChange` listener |

> **No global client-side store** (Redux, Zustand, Jotai) — TanStack Query + React local state is sufficient for this application's complexity.

---

## 5. Supabase Edge Functions Detail

### `create-registration`
- **Trigger:** POST from Phase B form
- **Inputs:** `parent_name`, `child_name`, `whatsapp_number`
- **Actions:**
  1. Validate inputs (mirrors Zod schema)
  2. Check if PPDB is open (`ppdb_config.registration_open = true`)
  3. Check for duplicate WhatsApp in current period
  4. Generate `registration_number` (`PPDB-YYYY-XXXXX`) using DB sequence
  5. Generate 8-char access code via `crypto.getRandomValues`
  6. Bcrypt-hash the access code
  7. Insert row into `registrations` (status = `awaiting_payment`)
  8. Insert row into `registration_access` (hash only)
  9. Return `{ registration_number, access_code }` — **only call that ever returns plaintext access code**
  10. Log to `audit_events`

### `verify-registration-access`
- **Trigger:** POST from Phase F status lookup and Phase D form gate
- **Inputs:** `registration_number`, `access_code`
- **Actions:**
  1. Rate-limit check (5 failures / IP / 15 min via DB or Upstash Redis)
  2. Look up `registrations` by `registration_number`
  3. Compare `access_code` against stored hash (bcrypt/argon2 compare)
  4. Return `{ valid: true, registration_id, status, payment_status }` or `{ valid: false }` (no detail on why)
  5. On success: reset failure counter; on failure: increment counter

### `submit-payment-proof`
- **Trigger:** POST (multipart/form-data) from Phase C
- **Inputs:** `registration_id`, `access_code`, file
- **Actions:**
  1. Re-verify access (calls verify logic internally — no separate round-trip)
  2. Validate file: MIME type must be `image/jpeg`, `image/png`, or `application/pdf`; max 5 MB
  3. Upload to `payment-proofs` bucket at path `{registration_id}/{timestamp}.{ext}`
  4. Upsert `payments` row: `proof_file_path`, `uploaded_at`, `status = payment_submitted`
  5. Update `registrations.payment_status = payment_submitted`, `status = awaiting_form`
  6. Log to `audit_events`

### `admin-review-payment`
- **Trigger:** POST from admin dashboard
- **Inputs:** `payment_id`, `decision` (`approve` | `reject`), `notes` (optional)
- **Actions:**
  1. Verify caller has a valid admin JWT (Supabase Auth session)
  2. Verify caller has a row in `admin_profiles` (double-check role in DB)
  3. Update `payments.status` and `payments.reviewed_by`, `payments.reviewed_at`, `payments.review_notes`
  4. Update `registrations.payment_status` accordingly
  5. If approved: `registrations.status → awaiting_form` (if not already advanced)
  6. If rejected: `registrations.payment_status → payment_rejected`
  7. Log to `audit_events`

---

## 6. Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:

```
@/  →  src/
```

shadcn/ui's `components.json` is already set to use `@/` as the base alias.

---

## 7. Environment Variables

| Variable | Location | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local` | Supabase project URL — safe to expose (anon key access) |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` | Supabase anon/public key — safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Edge Function secrets | Service role key — **NEVER in `VITE_` vars**, **NEVER in frontend bundle** |

### `.env.example` (committed to repository)
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Rules
1. `SUPABASE_SERVICE_ROLE_KEY` is set only via Supabase Edge Function secrets dashboard.
2. No other secrets belong in the frontend. Any new secret that a future developer wants to add as `VITE_*` must be reviewed first.
3. `.env.local` is git-ignored. `.env.example` is committed.

---

## 8. shadcn/ui Integration

- shadcn/ui is already initialized (`components.json`: style=new-york, baseColor=neutral, cssVariables=true).
- Component source lives in `src/components/ui/`.
- All `ui/` components **must** import `cn` from `@/lib/utils`, not from the `cn` npm package.
- New shadcn components are added via `npx shadcn@latest add <component>` — do not hand-write them.
- Custom application components live in `features/<feature>/components/`, not in `components/ui/`.
- Do not modify shadcn component internals; wrap them instead.

---

## 9. Build & Deployment

| Step | Tool |
|---|---|
| Build | `vite build` → `dist/` |
| Type check | `tsc --noEmit` |
| Lint | `eslint .` (ESLint 9 flat config) |
| Deploy frontend | Vercel (auto from main branch) |
| Deploy Edge Functions | `supabase functions deploy` |
| DB migrations | `supabase db push` (local) / CI migration runner (prod) |

> CI pipeline spec is out of scope for now; add when repository is set up on GitHub.

---

## 10. Architecture Review & Approval Record

- **Reviewed Date:** 2026-10-20 (Task 004)
- **Status:** APPROVED
- **Review Summary:**
  1. **Tech Stack:** Confirmed React 19 + TypeScript (Strict) + Vite 7 + Tailwind CSS v4 + shadcn/ui. Backend confirmed as Supabase (PostgreSQL 15+, Auth, RLS, Storage) + Edge Functions (Deno/TS). SPA deployed to Vercel.
  2. **Zero-Backend-Server Model:** Confirmed no Express/NestJS server. All sensitive operations (access codes, uploads, reviews) execute inside Supabase Edge Functions with `service_role`.
  3. **Security Architecture:** Confirmed CSPRNG 8-char uppercase alphanumeric access codes, bcrypt/argon2 hashing, zero plaintext retention, and deny-all RLS as foundational security boundaries.
  4. **Directory Structure:** Confirmed feature-based layout (`src/features/{landing,registration,payment,documents,status,admin}`).
  5. **Routing & Parameter Standards:** Confirmed unified client route definitions with explicit `:id` (UUID) parameters for scoped operations and `:registrationNumber` for public status checks.
  6. **Deferred Items:** Confirmed Phase D (`documents/` and `document-upload` Edge Function) remain explicitly blocked awaiting official school requirements under Task 020.
