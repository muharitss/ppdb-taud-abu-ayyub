-- Migration 001: Core Enums for PPDB System
-- Specifications: specs/04-data-model.md (Section 2)

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
