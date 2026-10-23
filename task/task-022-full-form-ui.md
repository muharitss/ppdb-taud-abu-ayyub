# Task 022 — Full Form UI

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 021 — Form Schema & Migration (**DONE**)
- Task 015 — Registration UI

## Objective
Build the full registration form UI at `/daftar/formulir` where confirmed registrants (payment verified) fill in all official registration details and upload required documents.

## Context
After payment proof is uploaded (`payment_status = payment_submitted`), registrants complete their full registration via a 4-section wizard. If payment proof has NOT been uploaded yet, a gating page shows payment instructions first.

## Scope
- **Gating page** at `/daftar/formulir` entry: if `payment_status = payment_pending`, show bank BSI transfer instructions (Rp 300.000, No.Rek 7327913322 a.n. TAUD Abu Ayyub, WA konfirmasi 0813 6707 4138) with payment upload field (from task-016/017); block wizard access.
- **4-section wizard** (step indicator at top):
  - Step 1: Data Calon Peserta Didik (10 fields incl. program dropdown: 1 tahun / 2 tahun)
  - Step 2: Data Ayah (8 fields)
  - Step 3: Data Ibu (8 fields)
  - Step 4: Data Kesehatan Anak (5 fields, mostly optional)
- **Step 5: Upload Dokumen** (3 file inputs: KK, Akta Kelahiran, Pas Foto 3×4; JPEG/PNG/PDF; max 5 MB; all required)
- Each step saves draft to DB before advancing (calls `save-form-draft` or equivalent logic in document-upload Edge Function)
- Final submit → call submit Edge Function → status → `submitted`
- **Step 6: WA Group link** — after upload success, show button "Gabung Grup WhatsApp" → `https://chat.whatsapp.com/LfyeZ98q1PZ1TCQrkTOPzh`
- Form fields use Zod schema from task-021; validation errors in Bahasa Indonesia
- Once `submitted`, all fields read-only

## Implementation Plan
1. Create route `/daftar/formulir` (protected: requires reg number + access code)
2. Build gating component: check `payment_status`; show payment instructions + upload if `payment_pending`
3. Build `<FormWizard>` with `<StepIndicator>` (steps 1–5)
4. Build per-section components using shadcn/ui `<Input>`, `<Select>`, `<Textarea>`, `<RadioGroup>`, `react-hook-form` + Zod resolver
5. Each "Next" button: validate current section → PATCH draft to DB → advance step
6. Step 5: 3 `<FileUpload>` components; call document-upload Edge Function per file
7. Final submit button → call form-submit Edge Function → redirect to success page
8. After document upload success: show "Gabung Grup WhatsApp" button (external link, new tab)
9. Read-only state: wrap all inputs in disabled mode when `status = submitted`

## Out of Scope
- Form field definitions (determined by task 020)
- Schema (task 021)
- Edge Function (task 023)

## Specifications
- specs/01-requirements.md (confirmed by task 020)
- specs/06-ui-conventions.md

## Implementation Plan
_To be detailed after tasks 020 and 021 complete._

## Files Expected to Change
- `src/features/registration/pages/FullFormPage.tsx` (new)
- `src/features/registration/components/FormWizard/` (new — StepIndicator, Step1Child, Step2Father, Step3Mother, Step4Health, Step5Documents)
- `src/features/registration/components/PaymentGatingPage.tsx` (new — or reuse Phase C component)
- `src/router.tsx` (add route)

## Security Considerations
- Access code required to access this page (same verification as other protected pages)
- File uploads go through Edge Function, not direct to Storage
- Draft data (if implemented) stored securely, not in localStorage

## Acceptance Criteria
- [ ] Gating: wali murid dengan `payment_pending` melihat instruksi transfer BSI dan kolom upload bukti TF — formulir tidak bisa diakses sebelum upload
- [ ] 4-section wizard renders all confirmed fields with correct validation
- [ ] Program pembelajaran dropdown: "1 Tahun" / "2 Tahun"
- [ ] All 3 document uploads work (KK, Akta, Pas Foto); format/size validation shown in UI
- [ ] "Gabung Grup WhatsApp" button appears after successful document upload
- [ ] Draft saves per step — refreshing page restores last saved step
- [ ] Validation errors shown in Bahasa Indonesia
- [ ] Form cannot be submitted with missing required fields
- [ ] After submit: fields are read-only, success state shown

## Verification
```bash
npx tsc --noEmit
npm run build
```

## Risks
- Number of fields may make form complex — multi-step may be needed
- Mobile UX for multi-document upload needs careful testing

## Deliverables
- Full registration form page at `/daftar/formulir`
- All field and document upload components

## Completion Notes
Unblocked 2026-10-21. Requirements confirmed in task-020. Ready to implement after task-021.
