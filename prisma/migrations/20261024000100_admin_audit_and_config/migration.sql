-- Migration: Allow authenticated admins to append audit events and manage configurations
-- Task: Task 028, 029, 030

DO $$
BEGIN
  -- 1. Grant authenticated admins insert permission to audit_events (append-only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_events' AND policyname = 'admins_insert_audit_events'
  ) THEN
    CREATE POLICY "admins_insert_audit_events" ON audit_events
      FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
  END IF;
END $$;
