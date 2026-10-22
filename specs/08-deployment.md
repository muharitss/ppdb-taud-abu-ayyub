# 08 — Deployment

## 1. Environment Tiers

| Tier | Frontend | Backend | Purpose |
|---|---|---|---|
| **development** | Local Vite dev server (`npm run dev`, port 5173) | Local Supabase (`supabase start`) or remote Supabase dev project | Day-to-day development |
| **staging** | Vercel preview deploy (auto-created per branch/PR) | Supabase staging project (separate from production) | Pre-production verification |
| **production** | Vercel production deploy (`main` branch) | Supabase production project | Live system |

> **Staging is optional but strongly recommended** before any changes go live on the production school system. A data mistake on production affecting actual registrations is difficult to undo.

---

## 2. Vercel Configuration

### 2.1 Project Settings

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 20.x (LTS) |

### 2.2 SPA Routing — `vercel.json`

> **CRITICAL:** Without this configuration, all routes other than `/` will return a 404 on hard refresh or direct navigation.

Create `vercel.json` at the repository root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel to serve `index.html` for every route, allowing React Router to handle client-side routing.

### 2.3 Environment Variables in Vercel

Set the following in the Vercel project dashboard under **Settings → Environment Variables**:

| Variable | Scope | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Production, Preview, Development | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development | Supabase anon (public) key |

> **CRITICAL — Never add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables.** The `VITE_` prefix causes Vite to embed the value into the client-side JavaScript bundle, where it is publicly readable. The service role key bypasses all RLS policies and must never be exposed to the browser.

The service role key is used **only** inside Supabase Edge Functions, where it is set as a Supabase secret (not a Vercel env var).

---

## 3. Supabase Configuration

### 3.1 CLI-Driven Workflow

All schema changes must go through the Supabase CLI migration system. Never apply ad-hoc SQL directly to production.

**Install Supabase CLI:**

```bash
npm install --save-dev supabase
# or
brew install supabase/tap/supabase
```

**Initialize (if not already done):**

```bash
supabase init
```

**Start local Supabase:**

```bash
supabase start
```

### 3.2 Applying Migrations (Prisma)

```bash
# Create/apply migrations in development & generate Prisma client
npx prisma migrate dev

# Apply pending migrations to staging/production database
npx prisma migrate deploy

# Generate Prisma Client & TypeScript types
npx prisma generate
```

Migration files live in `prisma/migrations/` and are tracked in `_prisma_migrations`.

### 3.3 Edge Functions

Deploy an Edge Function:

```bash
supabase functions deploy <function-name>
```

Deploy all functions:

```bash
supabase functions deploy
```

Set secrets (used inside Edge Functions as environment variables — never exposed to client):

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<value>
supabase secrets set ADMIN_WHATSAPP_NUMBER=6282169599979
```

### 3.4 Storage Buckets

Storage bucket creation should be performed via:
1. **Preferred:** A Supabase migration file (SQL using `storage.create_bucket()`) so the bucket exists in all environments consistently.
2. **Alternative:** Supabase dashboard (for initial setup only — must be documented and replicated in migration).

Required buckets:

| Bucket Name | Access | Purpose |
|---|---|---|
| `payment-proofs` | Private (RLS enforced) | Payment proof images uploaded by registrants |
| `registration-documents` | Private (RLS enforced) | Supporting documents for full form |

All buckets must be **private**. Access is controlled via RLS policies on `storage.objects`.

### 3.5 RLS Policies

All RLS policies are applied via migration files. RLS must be **enabled** on every table before going live.

```sql
-- Enable RLS on a table (include in migration)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
```

---

## 4. Environment Variables

### 4.1 Local Development

Create `.env.local` at the repository root (gitignored):

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key-from-supabase-start-output>
```

**`.env.local` must never be committed.** Confirm it is listed in `.gitignore`.

### 4.2 `.env.example` (Committed)

Create `.env.example` at the repository root with placeholder values — this is safe to commit and documents required variables for new developers:

```env
# Supabase project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anon (public) key — safe to expose to the browser
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# DO NOT add SUPABASE_SERVICE_ROLE_KEY here.
# It must only be set as a Supabase secret for Edge Functions.
```

### 4.3 Service Role Key — Edge Functions Only

The `SUPABASE_SERVICE_ROLE_KEY` is used only inside Supabase Edge Functions runtime environment:

```bash
# Set it as a Supabase secret — never as a Vercel env var
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<value>
```

Inside Edge Functions, access it via:

```ts
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
```

---

## 5. Free Tier Limitations

> **Do not assume free tier is suitable for a live school operational system without assessment.**

| Service | Free Tier Limit | Risk |
|---|---|---|
| **Supabase DB** | 500 MB storage | Low risk for Phase 0 (small dataset), monitor as registrations grow |
| **Supabase Storage** | 1 GB | Moderate — payment proof images + documents could grow; compress uploads |
| **Supabase Bandwidth** | 2 GB/month | Monitor; image downloads (proof review) consume bandwidth |
| **Edge Functions** | 500,000 invocations/month | Low risk for school-scale usage |
| **Supabase Log Retention** | 7 days | Insufficient for audit purposes — export or archive logs regularly |
| **Vercel Hobby** | No SLA, 100 GB bandwidth, limited build minutes | No uptime guarantee — acceptable for Phase 0, reassess for production |

**Recommendation:** Review current limits at [supabase.com/pricing](https://supabase.com/pricing) and [vercel.com/pricing](https://vercel.com/pricing) before the registration period opens. Upgrade if storage or bandwidth limits risk disrupting active registrations.

---

## 6. Database Migrations Workflow

### 6.1 Rules

- **Never** apply raw SQL directly to the production database outside of the migration system.
- Every schema change must have a corresponding migration file.
- Migrations are applied in timestamp order — do not rename or reorder existing migration files.

### 6.2 File Naming Convention

```
prisma/migrations/YYYYMMDDHHMMSS_description/migration.sql
```

Examples:

```
prisma/migrations/20261023000000_init/migration.sql
prisma/migrations/20261023000100_rls_policies/migration.sql
```

### 6.3 Promotion Workflow

```
Local → Staging → Production
```

1. Edit `prisma/schema.prisma` (or use `--create-only` for raw SQL like RLS/triggers) and run `npx prisma migrate dev`.
2. Apply to staging: `npx prisma migrate deploy` with staging `DATABASE_URL`.
3. Run integration and E2E tests against staging.
4. Apply to production: `npx prisma migrate deploy` with production `DATABASE_URL`.

### 6.4 Rollback Plan

Supabase migrations are not automatically reversible. For each major migration, document a rollback SQL script alongside the migration:

```
supabase/migrations/20260102000000_add_payment_proof_url.sql
supabase/migrations/20260102000000_add_payment_proof_url.rollback.sql
```

The rollback script should undo the migration's changes (e.g., `ALTER TABLE ... DROP COLUMN`). Test the rollback on local before going to production.

---

## 7. Go-Live Checklist

Complete all items before opening registration to the public:

### Database & Backend
- [ ] All migrations applied to production Supabase project
- [ ] RLS enabled on all tables (`registrations`, `audit_log`, and any others)
- [ ] All RLS policies applied and verified
- [ ] Edge Functions deployed (`create-registration`, `verify-registration-access`, `submit-payment-proof`, `submit-full-form`)
- [ ] Edge Function secrets set (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Storage buckets created and set to private
- [ ] Storage RLS policies applied

### Frontend & Hosting
- [ ] Environment variables set in Vercel dashboard (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] `vercel.json` SPA rewrite configured and deployed
- [ ] Custom domain configured (if applicable)

### End-to-End Verification (on production)
- [ ] Complete registration flow tested end-to-end on production URL
- [ ] Admin login tested
- [ ] Admin payment approval flow tested
- [ ] Payment rejection + re-upload flow tested
- [ ] Status page tested with valid credentials
- [ ] Status page tested with invalid credentials (verify opaque error, verify rate limiting)
- [ ] wa.me link opens WhatsApp with correctly pre-filled message

### Security
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is NOT present in Vercel environment variables
- [ ] Confirm no service role key appears in client-side JavaScript bundle (inspect built `dist/` assets)
- [ ] Confirm `.env.local` is not committed to the repository (check `git log` and `.gitignore`)
- [ ] Confirm all storage buckets are private (not publicly listable)

### Operational Readiness
- [ ] Backup strategy documented (Supabase provides daily backups on paid plans; verify for free tier)
- [ ] Admin account created and login verified
- [ ] Admin team trained on payment approval workflow
- [ ] Support contact (WhatsApp) tested and reachable
