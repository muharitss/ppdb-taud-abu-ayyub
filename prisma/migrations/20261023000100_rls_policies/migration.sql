-- Row Level Security (RLS) Policies. Specs: specs/03-security.md (Section 4)

-- 1. Helper Function: is_admin
-- Evaluates whether the current authenticated user exists in admin_profiles with role 'admin'
-- SECURITY DEFINER and search_path set to prevent search path hijacking and RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Enable RLS on all 6 tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppdb_config ENABLE ROW LEVEL SECURITY;

-- 3. Policies: registrations
-- Public applicants access data strictly via Edge Functions (service_role bypasses RLS)
-- Authenticated admins have full management access
CREATE POLICY "admins_all_registrations" ON registrations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Policies: registration_access
-- Critical security barrier: access codes hashes are accessible ONLY by service_role
-- No client policies created -> default deny-all for anon and authenticated (including admins)

-- 5. Policies: payments
-- Verification workflow: admins need to view all payment proofs and update payment review status
CREATE POLICY "admins_select_payments" ON payments
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admins_update_payments" ON payments
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Policies: admin_profiles
-- Any authenticated user can read their own profile row
-- Admins can read all admin profile records
CREATE POLICY "authenticated_select_own_admin_profile" ON admin_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "admins_select_all_admin_profiles" ON admin_profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 7. Policies: audit_events
-- Append-only audit trail: written via service_role in backend/triggers
-- Admins can view audit logs; no UPDATE or DELETE policies are granted to anyone
CREATE POLICY "admins_select_audit_events" ON audit_events
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 8. Policies: ppdb_config
-- Public non-sensitive settings (registration open status, period, fees, contact WA) are readable
CREATE POLICY "public_select_ppdb_config" ON ppdb_config
  FOR SELECT TO anon, authenticated
  USING (key IN ('registration_open', 'ppdb_period', 'registration_fee', 'admin_whatsapp'));

-- Admins can manage all config keys
CREATE POLICY "admins_all_ppdb_config" ON ppdb_config
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. Prisma bookkeeping table lives in `public`, which Supabase exposes via the Data API.
-- Lock it down so anon/authenticated cannot read or tamper with migration history.
-- Guarded: the shadow database has no _prisma_migrations table.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public._prisma_migrations FROM anon, authenticated;
  END IF;
END $$;
