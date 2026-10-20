# Task 004 — Architecture Review

## Status
DONE

## Priority
P0

## Dependencies
- Task 001
- Task 002
- Task 003

## Objective
Review and obtain stakeholder approval for all architecture decisions documented in specs/02-architecture.md before implementation begins.

## Context
Key architectural decisions have been made during planning (React + Supabase + Edge Functions, feature-based directory structure, no public auth for registrants). These decisions affect all future tasks and should be explicitly confirmed before significant implementation work starts.

## Scope
- Review specs/02-architecture.md with stakeholder
- Confirm tech stack choices (React 19, Supabase, Edge Functions, Vercel)
- Confirm directory structure plan
- Confirm Edge Functions scope and responsibility boundaries
- Confirm routing plan (which pages, which routes)
- Confirm public-access model for registrants (no auth, access code only)
- Confirm admin auth approach (Supabase Auth + admin_profiles)
- Document any approved changes back into specs/02-architecture.md

## Out of Scope
- Implementation of any feature
- Writing migrations or code
- UI/UX design decisions (separate review)

## Specifications
- specs/02-architecture.md

## Implementation Plan
1. Present specs/02-architecture.md to stakeholder for review
2. Walk through: tech stack, directory structure, data flow, Edge Function model
3. Clarify any questions or concerns
4. Record decisions and any changes
5. Update specs/02-architecture.md if changes are approved
6. Mark task DONE when stakeholder confirms approval

## Files Expected to Change
- specs/02-architecture.md (if revisions needed after review)

## Security Considerations
None — review task. Confirm stakeholder understands the security model (access codes, RLS, no service role key on frontend).

## Acceptance Criteria
- [x] Stakeholder has reviewed specs/02-architecture.md
- [x] Tech stack confirmed (or alternatives documented)
- [x] Directory structure approved
- [x] Edge Functions scope confirmed
- [x] Routing plan approved
- [x] Any changes reflected in specs/02-architecture.md
- [x] Explicit approval recorded in Completion Notes

## Verification
```bash
# Human review task — no automated verification
# After approval, confirm no open TBD items in specs/02-architecture.md
grep -i "TBD\|TODO\|CONFIRM" specs/02-architecture.md
```

## Risks
- Stakeholder requests significant architectural change — may require re-planning
- Approval delayed — blocks Tasks 008, 009, 012

## Deliverables
- Approved specs/02-architecture.md
- Completion Notes with approval record and any decisions made

## Completion Notes
- **Review Date:** 2026-10-20
- **Status:** APPROVED & SIGNED OFF
- **Confirmed Decisions:**
  1. **Tech Stack:** React 19 + TypeScript (Strict) + Vite 7 + Tailwind CSS v4 + shadcn/ui. Backend: Supabase (PostgreSQL 15+, Auth, RLS, Storage) + Edge Functions (Deno). Hosting: Vercel SPA.
  2. **Zero Express/NestJS Server:** All sensitive writes and access checks run inside Supabase Edge Functions. Frontend never receives `SUPABASE_SERVICE_ROLE_KEY`.
  3. **Security & Access Model:** Registrants do not have Supabase Auth accounts. Access is granted via 8-character CSPRNG access codes returned once, hashed in DB with bcrypt/argon2. Admin auth is managed through Supabase Auth + `admin_profiles` table.
  4. **Directory Structure:** Feature-driven layout (`src/features/{landing,registration,payment,documents,status,admin}`) approved.
  5. **Routing Standards:** Standardized route parameters: `:id` denotes internal registration UUID (`/daftar/pembayaran/:id`, `/daftar/formulir/:id`, `/daftar/selesai/:id`, `/admin/pendaftaran/:id`), while `/status/:registrationNumber` uses the public code (`PPDB-YYYY-XXXXX`).
  6. **Deferred Scope:** Phase D (`documents/` and `document-upload` Edge Function) remains explicitly blocked awaiting official school data requirements (Task 020).
- **Updates to Specification:** `specs/02-architecture.md` updated with Edge Function structure alignment, route parameter semantics, and approval record section.
