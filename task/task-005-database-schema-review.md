# Task 005 — Database Schema Review

## Status
DONE

## Priority
P0

## Dependencies
- Task 002

## Objective
Review and obtain stakeholder approval for the database schema documented in specs/04-data-model.md before any migration is written.

## Context
The data model is foundational — mistakes here are expensive to fix after data exists. The schema includes tables for registrations, access control, payments, admin profiles, audit events, and PPDB config. Several TBD sections exist (notably registration_form_data) that require stakeholder input. Schema must be confirmed before Task 010 writes migrations.

## Scope
- Review specs/04-data-model.md with stakeholder
- Confirm table structures (columns, types, nullability, constraints)
- Confirm enum values for registration_status and payment_status
- Confirm RLS strategy per table
- Identify and resolve all TBD sections where possible
- Flag remaining TBDs for Phase 6 (registration form fields)
- Update specs/04-data-model.md with confirmed schema

## Out of Scope
- Writing database migrations (Task 010)
- Implementing RLS policies (Task 011)
- Defining registration form fields (Task 020 — BLOCKED on school requirements)

## Specifications
- specs/04-data-model.md

## Implementation Plan
1. Present specs/04-data-model.md to stakeholder
2. Walk through each table: registrations, registration_access, payments, admin_profiles, audit_events, ppdb_config
3. Confirm enum values:
   - registration_status: draft, awaiting_payment, awaiting_form, submitted, under_review, accepted, rejected
   - payment_status: payment_pending, payment_submitted, payment_verified, payment_rejected
4. Review registration_documents table placeholder — confirm design approach
5. Discuss registration_form_data — acknowledge BLOCKED, note will be added in Phase 6
6. Confirm ppdb_config key/value pairs needed
7. Record approvals and any schema changes
8. Update specs/04-data-model.md

## Files Expected to Change
- specs/04-data-model.md (updates from review)

## Security Considerations
Confirm stakeholder understands:
- registration_access stores hash only, never plaintext access code
- payments table does not store actual payment credentials
- audit_events is append-only (no UPDATE/DELETE policy)

## Acceptance Criteria
- [x] Stakeholder has reviewed specs/04-data-model.md
- [x] All table schemas confirmed or updated
- [x] Enum values confirmed
- [x] registration_status enum: draft, awaiting_payment, awaiting_form, submitted, under_review, accepted, rejected
- [x] payment_status enum: payment_pending, payment_submitted, payment_verified, payment_rejected
- [x] RLS strategy confirmed per table
- [x] TBD sections flagged clearly for Phase 6
- [x] Explicit approval recorded in Completion Notes

## Verification
```bash
# Human review task — no automated verification
# Confirm no unresolved non-Phase6 TBDs remain
grep -i "TBD\|TODO" specs/04-data-model.md
```

## Risks
- Stakeholder requests schema changes — may affect migration design
- registration_form_data fields unknown — migrations must be structured to add columns additively later
- Approval delayed — blocks Task 010

## Deliverables
- Approved specs/04-data-model.md
- Completion Notes with approval record, confirmed enum values, and flagged TBDs

## Completion Notes
- **Review Date:** 2026-10-21
- **Status:** APPROVED & SIGNED OFF
- **Confirmed Decisions:**
  1. **Core Schemas:** `registrations`, `registration_access`, `payments`, `admin_profiles`, `audit_events`, `ppdb_config` approved without alterations.
  2. **Enums Confirmed:**
     - `registration_status`: `draft`, `awaiting_payment`, `awaiting_form`, `submitted`, `under_review`, `accepted`, `rejected`.
     - `payment_status`: `payment_pending`, `payment_submitted`, `payment_verified`, `payment_rejected`.
  3. **Security & RLS:** No anon table-level access to sensitive applicant data. `registration_access` hash-only table is locked down to service role. `audit_events` is append-only.
  4. **Deferred to Phase 6:** `registration_form_data` and `registration_documents` remain placeholders until school specifies exact form and file requirements in Task 020.
- **Specification Updated:** Approval record appended to `specs/04-data-model.md` Section 11.

