-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "registration_status" AS ENUM ('draft', 'awaiting_payment', 'awaiting_form', 'submitted', 'under_review', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('payment_pending', 'payment_submitted', 'payment_verified', 'payment_rejected');

-- CreateTable
CREATE TABLE "registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_number" TEXT NOT NULL,
    "child_name" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "whatsapp_number" TEXT NOT NULL,
    "status" "registration_status" NOT NULL DEFAULT 'awaiting_payment',
    "payment_status" "payment_status" NOT NULL DEFAULT 'payment_pending',
    "review_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ,
    "ppdb_period" TEXT NOT NULL DEFAULT '2027-2028',

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_access" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_id" UUID NOT NULL,
    "access_code_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_id" UUID NOT NULL,
    "proof_file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,
    "reviewed_by" UUID,
    "review_notes" TEXT,
    "status" "payment_status" NOT NULL DEFAULT 'payment_submitted',

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "actor_type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppdb_config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "ppdb_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "registrations_registration_number_key" ON "registrations"("registration_number");

-- CreateIndex
CREATE INDEX "idx_registrations_status" ON "registrations"("status");

-- CreateIndex
CREATE INDEX "idx_registrations_payment_status" ON "registrations"("payment_status");

-- CreateIndex
CREATE INDEX "idx_registrations_whatsapp" ON "registrations"("whatsapp_number", "ppdb_period");

-- CreateIndex
CREATE INDEX "idx_registrations_created_at" ON "registrations"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "registration_access_registration_id_key" ON "registration_access"("registration_id");

-- CreateIndex
CREATE INDEX "idx_payments_registration_id" ON "payments"("registration_id");

-- CreateIndex
CREATE INDEX "idx_payments_status" ON "payments"("status");

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "audit_events"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_actor" ON "audit_events"("actor_id");

-- CreateIndex
CREATE INDEX "idx_audit_created_at" ON "audit_events"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "registration_access" ADD CONSTRAINT "registration_access_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Raw SQL (not modelled by Prisma). Specs: specs/04-data-model.md
-- ============================================================

-- Shadow-DB stub: `prisma migrate dev` replays migrations into an empty shadow database
-- that has no Supabase `auth` schema / roles. On the real Supabase DB this block is a no-op.
DO $$
BEGIN
  IF to_regprocedure('auth.uid()') IS NULL THEN
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT NULL::uuid';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
END $$;

-- No FKs to auth.users: Prisma rejects cross-schema references unless it manages the `auth`
-- schema too (which would let it alter Supabase-owned tables). See specs/04-data-model.md.

-- Registration number generator (PPDB-YYYY-NNNNN)
CREATE SEQUENCE IF NOT EXISTS ppdb_registration_seq START 1;

CREATE OR REPLACE FUNCTION generate_registration_number(period text)
RETURNS text AS $$
BEGIN
  RETURN 'PPDB-' || period || '-' || LPAD(nextval('ppdb_registration_seq')::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at (also covers writes from supabase-js / Edge Functions)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ppdb_config_updated_at
  BEFORE UPDATE ON ppdb_config FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Default configuration seed
INSERT INTO ppdb_config (key, value) VALUES
  ('registration_open', 'true'::jsonb),
  ('ppdb_period', '"2027-2028"'::jsonb),
  ('registration_fee', '300000'::jsonb),
  ('admin_whatsapp', '["6282169599979", "6281367074138"]'::jsonb)
ON CONFLICT (key) DO NOTHING;
