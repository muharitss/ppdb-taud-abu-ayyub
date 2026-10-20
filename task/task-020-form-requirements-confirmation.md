# Task 020 — Form Requirements Confirmation

## Status
WAITING_FOR_REQUIREMENTS

## Priority
P0

## Dependencies
- Task 005 — Database Schema Review

## Objective
Confirm official full registration form fields and required documents with the school before implementation begins.

## Context
The full registration form fields (child data, parent data, medical info, required documents, etc.) must follow the official school requirements for TAUD SaQu Abu Ayyub TP.2026-2027. Implementation of tasks 021–023 is blocked until these requirements are confirmed and documented.

## Scope
- Gather official list of form fields for registration (child data, parent data, guardian info, medical info, etc.)
- Gather official list of required documents (akte kelahiran, KK, foto, sertifikat, etc.) with exact specifications (format, size, resolution)
- Confirm any special validation rules (minimum age, photo specs, file formats)
- Confirm whether a draft/save feature is needed for the form
- Update `specs/01-requirements.md` with confirmed fields
- Update `specs/04-data-model.md` with confirmed `registration_form_data` and `registration_documents` schema
- Unblock tasks 021–023

## Out of Scope
- Implementation of the form (task 022)
- Database migration (task 021)
- Document upload Edge Function (task 023)

## Specifications
- specs/01-requirements.md (to be updated)
- specs/04-data-model.md (to be updated)

## Implementation Plan
1. Prepare list of questions for school admin/stakeholder
2. Schedule meeting or collect requirements via WhatsApp/document
3. Document confirmed fields in `specs/01-requirements.md`
4. Update `specs/04-data-model.md`:
   - `registration_form_data` JSON schema or separate columns
   - `registration_documents` table with document type enum
5. Get sign-off from stakeholder
6. Update task 021, 022, 023 with confirmed scope
7. Mark this task as DONE

## Files Expected to Change
- `specs/01-requirements.md`
- `specs/04-data-model.md`

## Security Considerations
N/A — this is a requirements gathering task. Ensure any shared documents with the school are handled securely.

## Acceptance Criteria
- [ ] Official field list confirmed by school stakeholder and documented in `specs/01-requirements.md`
- [ ] Official document list confirmed with exact specs (format, max size)
- [ ] Special validation rules documented (age minimum, photo requirements, etc.)
- [ ] Draft/save feature decision confirmed (yes/no)
- [ ] `specs/04-data-model.md` updated with confirmed `registration_form_data` schema
- [ ] `specs/04-data-model.md` updated with confirmed `registration_documents` schema
- [ ] Tasks 021, 022, 023 unblocked and updated with confirmed scope

## Verification
```bash
# Check that specs are updated
cat specs/01-requirements.md
cat specs/04-data-model.md
```

## Risks
- **CRITICAL PATH**: This task blocks Phase 6 entirely. Delay here delays go-live.
- School may change requirements after initial confirmation — build schema to be flexible

## Deliverables
- Updated `specs/01-requirements.md`
- Updated `specs/04-data-model.md`
- Stakeholder sign-off (documented or screenshot of approval)

## Completion Notes
_Not started — awaiting school requirements_
