-- Migration 003: Performance and Lookup Indexes
-- Specifications: specs/04-data-model.md (Section 7)

-- registrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_number ON registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_whatsapp ON registrations(whatsapp_number, ppdb_period);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

-- registration_access
CREATE UNIQUE INDEX IF NOT EXISTS idx_reg_access_registration_id ON registration_access(registration_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- audit_events
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_events(created_at DESC);
