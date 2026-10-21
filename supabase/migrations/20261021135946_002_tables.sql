-- Migration 002: Core Tables, Sequence, Triggers, and Functions
-- Specifications: specs/04-data-model.md (Section 3, 4, 8)

-- 1. Sequence for Registration Numbers
CREATE SEQUENCE IF NOT EXISTS ppdb_registration_seq START 1;

-- 2. Helper function to generate registration numbers (PPDB-YYYY-NNNNN)
CREATE OR REPLACE FUNCTION generate_registration_number(period text)
RETURNS text AS $$
BEGIN
  RETURN 'PPDB-' || period || '-' || LPAD(nextval('ppdb_registration_seq')::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. Utility function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Table: registrations
CREATE TABLE IF NOT EXISTS registrations (
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

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 5. Table: registration_access
CREATE TABLE IF NOT EXISTS registration_access (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id   uuid UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  access_code_hash  text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- 6. Table: payments
CREATE TABLE IF NOT EXISTS payments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id  uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  proof_file_path  text NOT NULL,
  uploaded_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_at      timestamptz,
  reviewed_by      uuid REFERENCES auth.users(id),
  review_notes     text,
  status           payment_status NOT NULL DEFAULT 'payment_submitted'
);

-- 7. Table: admin_profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  role        text NOT NULL DEFAULT 'admin',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 8. Table: audit_events
CREATE TABLE IF NOT EXISTS audit_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid,
  actor_type  text NOT NULL,
  action      text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 9. Table: ppdb_config
CREATE TABLE IF NOT EXISTS ppdb_config (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid REFERENCES auth.users(id)
);

CREATE TRIGGER trg_ppdb_config_updated_at
  BEFORE UPDATE ON ppdb_config
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Default configuration seed
INSERT INTO ppdb_config (key, value) VALUES
  ('registration_open', 'true'::jsonb),
  ('ppdb_period', '"2027-2028"'::jsonb),
  ('registration_fee', '300000'::jsonb),
  ('admin_whatsapp', '["6282169599979", "6281367074138"]'::jsonb)
ON CONFLICT (key) DO NOTHING;
