# PPDB TAUD Abu Ayyub — Data Model

## 1. Overview

The database runs on **PostgreSQL** managed by Supabase. Row-Level Security (RLS) is enabled on every table. The schema is modeled in `prisma/schema.prisma` and all schema/RLS migrations live in `prisma/migrations/` (managed via Prisma Migrate).

---

## 2. Enums

### `registration_status`

| Value | Meaning |
|---|---|
| `draft` | Registration row created but not yet confirmed (unused if we skip draft state) |
| `awaiting_payment` | Initial registration complete; waiting for payment proof upload |
| `awaiting_form` | Payment proof uploaded; waiting for parent to complete full form |
| `submitted` | Full form submitted by parent; awaiting admin review |
| `under_review` | Admin is actively reviewing the application |
| `accepted` | Application accepted; child enrolled |
| `rejected` | Application rejected |

### `payment_status`

| Value | Meaning |
|---|---|
| `payment_pending` | No payment proof uploaded yet |
| `payment_submitted` | Parent uploaded proof; awaiting admin verification |
| `payment_verified` | Admin verified the payment |
| `payment_rejected` | Admin rejected the payment proof (e.g., wrong amount, blurry image) |

```sql
CREATE TYPE registration_status AS ENUM (
  'draft',
  'awaiting_payment',
  'awaiting_form',
  'submitted',
  'under_review',
  'accepted',
  'rejected'
);

CREATE TYPE payment_status AS ENUM (
  'payment_pending',
  'payment_submitted',
  'payment_verified',
  'payment_rejected'
);
```

---

## 3. Tables

### 3.1 `registrations`

Primary table tracking each applicant's registration lifecycle.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Internal unique identifier |
| `registration_number` | `text` | UNIQUE, NOT NULL | Public identifier, format `PPDB-YYYY-XXXXX` |
| `child_name` | `text` | NOT NULL | Full name of the child |
| `parent_name` | `text` | NOT NULL | Full name of parent/guardian |
| `whatsapp_number` | `text` | NOT NULL | WhatsApp number (international format, e.g. `628xxx`) |
| `status` | `registration_status` | NOT NULL, DEFAULT `awaiting_payment` | Current registration lifecycle status |
| `payment_status` | `payment_status` | NOT NULL, DEFAULT `payment_pending` | Current payment status |
| `review_notes` | `text` | NULLABLE | Admin-written notes shown on the status page |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When initial registration was submitted |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last update timestamp (trigger-maintained) |
| `submitted_at` | `timestamptz` | NULLABLE | When full form was submitted (Phase D complete) |
| `ppdb_period` | `text` | NOT NULL, DEFAULT current period | PPDB period identifier (e.g., `2027-2028`) for multi-year deduplication |

```sql
CREATE TABLE registrations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text UNIQUE NOT NULL,
  child_name          text NOT NULL,
  parent_name         text NOT NULL,
  whatsapp_number     text NOT NULL,
  status              registration_status NOT NULL DEFAULT 'awaiting_payment',
  payment_status      payment_status NOT NULL DEFAULT 'payment_pending',
  review_notes        text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  submitted_at        timestamptz,
  ppdb_period         text NOT NULL DEFAULT '2027-2028'
);
```

**RLS summary:** No anon or authenticated access. All access via service role (Edge Functions) or admin custom claim.

---

### 3.2 `registration_access`

Stores the bcrypt/argon2 hash of the one-time access code. Never stores plaintext.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Internal identifier |
| `registration_id` | `uuid` | FK → `registrations.id`, UNIQUE, NOT NULL | One access code per registration |
| `access_code_hash` | `text` | NOT NULL | Bcrypt or argon2id hash of the 8-char access code |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When the hash was stored |

```sql
CREATE TABLE registration_access (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id   uuid UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  access_code_hash  text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

**RLS summary:** Service role only. Even admin users cannot SELECT from this table.

---

### 3.3 `payments`

Records payment proof uploads and admin review decisions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Internal identifier |
| `registration_id` | `uuid` | FK → `registrations.id`, NOT NULL | Associated registration |
| `proof_file_path` | `text` | NOT NULL | Storage path in `payment-proofs` bucket, e.g., `{registration_id}/{timestamp}.jpg` |
| `uploaded_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When the proof was uploaded |
| `reviewed_at` | `timestamptz` | NULLABLE | When admin reviewed the proof |
| `reviewed_by` | `uuid` | FK → `auth.users(id)`, NULLABLE | Admin who reviewed |
| `review_notes` | `text` | NULLABLE | Admin's note (e.g., reason for rejection) |
| `status` | `payment_status` | NOT NULL, DEFAULT `payment_submitted` | Payment review status |

```sql
CREATE TABLE payments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id  uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  proof_file_path  text NOT NULL,
  uploaded_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at      timestamptz,
  reviewed_by      uuid REFERENCES auth.users(id),
  review_notes     text,
  status           payment_status NOT NULL DEFAULT 'payment_submitted'
);
```

**RLS summary:** Service role for insert/update. Admin can SELECT all and UPDATE review fields only.

---

### 3.4 `registration_documents`

> **✅ CONFIRMED — Requirements confirmed 2026-10-21. See task-020.**

Three document types are required: `kartu_keluarga`, `akte_kelahiran`, `pas_foto`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Internal identifier |
| `registration_id` | `uuid` | FK → `registrations.id`, NOT NULL | Associated registration |
| `document_type` | `document_type` | NOT NULL | Enum: `kartu_keluarga` / `akte_kelahiran` / `pas_foto` |
| `file_path` | `text` | NOT NULL | Path in `registration-documents` bucket, e.g. `{registration_id}/kk.pdf` |
| `uploaded_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Upload timestamp |

```sql
CREATE TYPE document_type AS ENUM (
  'kartu_keluarga',
  'akte_kelahiran',
  'pas_foto'
);

CREATE TABLE registration_documents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id  uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  document_type    document_type NOT NULL,
  file_path        text NOT NULL,
  uploaded_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (registration_id, document_type) -- one file per doc type per registration
);
```

**Accepted formats:** JPEG, PNG, PDF. Max 5 MB per file. `pas_foto` accepts only JPEG/PNG.

**RLS summary:** Service role only for insert/update. Admin can SELECT.

---

### 3.5 `registration_form_data`

> **✅ CONFIRMED — Requirements confirmed 2026-10-21. See task-020.**

Stores detailed form data from Phase D wizard. JSONB is used for flexibility; the schema below is the validated contract enforced by the Edge Function via Zod.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Internal identifier |
| `registration_id` | `uuid` | FK → `registrations.id`, UNIQUE, NOT NULL | One form per registration |
| `form_data` | `jsonb` | NOT NULL, DEFAULT `'{}'` | Validated JSON — see schema below |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When first draft-saved |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last save (trigger-maintained) |

```sql
CREATE TABLE registration_form_data (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id  uuid UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  form_data        jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
```

**JSON schema for `form_data`** (enforced by Zod in the Edge Function):

```jsonc
{
  // Section 1 — Calon Peserta Didik
  "child": {
    "full_name": "string, required",
    "nickname": "string, required",
    "nik": "string, 16 digits, required",
    "birth_place": "string, required",
    "birth_date": "date string ISO-8601, required",
    "gender": "'laki_laki' | 'perempuan', required",
    "child_order": "integer >= 1, required",
    "sibling_count": "integer >= 0, required",
    "address": "string, required",
    "program": "'1_tahun' | '2_tahun', required"
  },
  // Section 2 — Ayah
  "father": {
    "full_name": "string, required",
    "nik": "string, 16 digits, required",
    "birth_place": "string, required",
    "birth_date": "date string ISO-8601, required",
    "last_education": "string, required",
    "occupation": "string, required",
    "monthly_income": "string, optional",
    "whatsapp_number": "string, required",
    "address": "string, required"
  },
  // Section 3 — Ibu (same shape as father)
  "mother": {
    "full_name": "string, required",
    "nik": "string, 16 digits, required",
    "birth_place": "string, required",
    "birth_date": "date string ISO-8601, required",
    "last_education": "string, required",
    "occupation": "string, required",
    "monthly_income": "string, optional",
    "whatsapp_number": "string, required",
    "address": "string, required"
  },
  // Section 4 — Kesehatan
  "health": {
    "weight_kg": "decimal, required",
    "height_cm": "decimal, required",
    "blood_type": "'A' | 'B' | 'AB' | 'O' | 'tidak_diketahui', optional",
    "allergy_history": "string, optional",
    "disease_history": "string, optional"
  }
}
```

**RLS summary:** Service role only for insert/update. Admin can SELECT.

---

### 3.6 `admin_profiles`

Links Supabase Auth users to school admin roles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK = `auth.users.id` | Matches the Supabase Auth user UUID |
| `full_name` | `text` | NOT NULL | Admin's display name |
| `role` | `text` | NOT NULL, DEFAULT `'admin'` | Role identifier (future: `'super_admin'`, etc.) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When the profile was created |

```sql
CREATE TABLE admin_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  role        text NOT NULL DEFAULT 'admin',
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**RLS summary:** Authenticated admin can SELECT their own row only. Service role has full access.

---

### 3.7 `audit_events`

Append-only log of all significant actions. No UPDATE or DELETE allowed by any role.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, `gen_random_uuid()` | Internal identifier |
| `actor_id` | `uuid` | NULLABLE | `auth.users.id` of the actor (null for system/anonymous actions) |
| `actor_type` | `text` | NOT NULL | `'admin'`, `'system'`, `'edge_function'` |
| `action` | `text` | NOT NULL | Action name, e.g., `registration_created`, `payment_approved` |
| `entity_type` | `text` | NOT NULL | Table name of the affected entity, e.g., `registrations`, `payments` |
| `entity_id` | `uuid` | NULLABLE | UUID of the affected row |
| `metadata` | `jsonb` | NULLABLE | Additional context (e.g., old/new status, review notes, IP address) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | When the event occurred |

```sql
CREATE TABLE audit_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid,
  actor_type  text NOT NULL,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**RLS summary:** Service role can INSERT. Admin can SELECT all. Nobody can UPDATE or DELETE.

---

### 3.8 `ppdb_config`

Key-value store for runtime configuration. Allows changing PPDB settings without code deployments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `key` | `text` | PK | Config key, e.g., `registration_open`, `ppdb_period`, `registration_fee` |
| `value` | `jsonb` | NOT NULL | Config value as JSON (boolean, string, number, object) |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | Last update timestamp |
| `updated_by` | `uuid` | FK → `auth.users(id)`, NULLABLE | Admin who last changed this value |

```sql
CREATE TABLE ppdb_config (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid REFERENCES auth.users(id)
);
```

**Example rows:**
```sql
INSERT INTO ppdb_config (key, value) VALUES
  ('registration_open', 'true'),
  ('ppdb_period', '"2026-2027"'),
  ('registration_fee', '300000'),
  ('admin_whatsapp', '["6282169599979", "6281367074138"]');
```

**RLS summary:** Anon can SELECT non-sensitive keys (filtered by policy). Admin can SELECT all and UPDATE. Service role has full access.

---

## 4. Registration Number Generation

- Format: `PPDB-{YYYY}-{NNNNN}` where `NNNNN` is a 5-digit zero-padded sequence.
- Example: `PPDB-2026-00001`, `PPDB-2026-00042`.
- Generated inside the `create-registration` Edge Function using a PostgreSQL sequence:

```sql
CREATE SEQUENCE ppdb_registration_seq START 1;
```

```typescript
// Inside Edge Function
const { data } = await supabaseAdmin.rpc('generate_registration_number', {
  period: '2026'
});
// DB function:
-- SELECT 'PPDB-' || period || '-' || LPAD(nextval('ppdb_registration_seq')::text, 5, '0')
```

- The sequence is **per PPDB period.** A new sequence (or sequence reset with a period prefix) is used for each academic year.

---

## 5. Access Code Format

- **8 uppercase alphanumeric characters.**
- Charset: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (32 chars, ambiguous chars excluded).
- Example: `X7KM2PQN`.
- Generated via `crypto.getRandomValues(new Uint8Array(8))` mapped to the charset inside the Edge Function.
- Only the **bcrypt hash** (or argon2id hash) is stored in `registration_access.access_code_hash`.
- The plaintext code is shown to the parent **once** and never retrievable afterward.

---

## 6. Storage Buckets

| Bucket name | Public | Purpose | Allowed MIME types | Max size |
|---|---|---|---|---|
| `payment-proofs` | ❌ Private | Payment transfer screenshots | `image/jpeg`, `image/png`, `application/pdf` | 5 MB |
| `registration-documents` | ❌ Private | Document scans (Akte, KK, foto) | `image/jpeg`, `image/png`, `application/pdf` | 5 MB per file |

- Files are accessed via **signed URLs** (15-minute expiry) generated server-side.
- File path structure: `{registration_id}/{unix_timestamp_ms}.{ext}`
- Storage policies mirror RLS: no anon access, no direct authenticated access, admin access via signed URL only.

---

## 7. Indexes

```sql
-- registrations
CREATE UNIQUE INDEX idx_registrations_number ON registrations(registration_number);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_registrations_whatsapp ON registrations(whatsapp_number, ppdb_period);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);

-- registration_access
CREATE UNIQUE INDEX idx_reg_access_registration_id ON registration_access(registration_id);

-- payments
CREATE INDEX idx_payments_registration_id ON payments(registration_id);
CREATE INDEX idx_payments_status ON payments(status);

-- registration_documents
CREATE INDEX idx_reg_docs_registration_id ON registration_documents(registration_id);

-- registration_form_data
CREATE UNIQUE INDEX idx_form_data_registration_id ON registration_form_data(registration_id);

-- audit_events
CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_created_at ON audit_events(created_at DESC);

-- ppdb_config
-- PK on key is sufficient; no additional indexes needed
```

---

## 8. Triggers

```sql
-- Auto-update updated_at on registrations
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Same trigger for registration_form_data
CREATE TRIGGER trg_form_data_updated_at
  BEFORE UPDATE ON registration_form_data
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ppdb_config_updated_at
  BEFORE UPDATE ON ppdb_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 9. RLS Policy Overview (Summary)

| Table | anon | authenticated (admin) | service_role |
|---|---|---|---|
| `registrations` | ❌ | SELECT+UPDATE (admin claim) | ✅ full |
| `registration_access` | ❌ | ❌ | ✅ full |
| `payments` | ❌ | SELECT+UPDATE (review fields) | ✅ full |
| `registration_documents` | ❌ | SELECT | ✅ full |
| `registration_form_data` | ❌ | SELECT | ✅ full |
| `admin_profiles` | ❌ | SELECT (own row) | ✅ full |
| `audit_events` | ❌ | SELECT (no write) | INSERT only |
| `ppdb_config` | SELECT (non-sensitive) | SELECT+UPDATE | ✅ full |

> Detailed policy SQL lives in `prisma/migrations/20261023000100_rls_policies/migration.sql` (including locking down `_prisma_migrations` from `anon`/`authenticated`).

---

## 10. TBD Sections

The following parts of this data model are explicitly deferred:

| Section | Blocker | Action Required |
|---|---|---|
| `registration_form_data` columns | Full form field list not confirmed by school | Get school to specify all required child/parent data fields |
| `registration_documents` columns | Doc upload list not finalized | Confirm which documents require digital upload vs. physical submission |
| Data retention policy | School has not defined one | School admin to decide; codify in `ppdb_config` and migration notes |
| Argon2id vs bcrypt decision | Either works; argon2id preferred if Deno runtime supports it natively | Confirm Deno/Edge Function compatibility before implementation |

---

## 11. Database Schema Review & Approval Record

- **Reviewed Date:** 2026-10-21 (Task 005)
- **Status:** APPROVED & SIGNED OFF
- **Review Summary:**
  1. **Core Tables Approved:** `registrations`, `registration_access`, `payments`, `admin_profiles`, `audit_events`, `ppdb_config` confirmed for initial migration (Task 010).
  2. **Enums Confirmed:**
     - `registration_status`: `'draft'`, `'awaiting_payment'`, `'awaiting_form'`, `'submitted'`, `'under_review'`, `'accepted'`, `'rejected'`.
     - `payment_status`: `'payment_pending'`, `'payment_submitted'`, `'payment_verified'`, `'payment_rejected'`.
  3. **Security & RLS Strategy Confirmed:** Deny-all by default. `registration_access` accessible strictly via `service_role`. Append-only integrity enforced on `audit_events`.
  4. **Deferred Tables (Flagged for Phase 6):** `registration_documents` and `registration_form_data` remain placeholder stubs pending official field requirements under Task 020.

