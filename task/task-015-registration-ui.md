# Task 015 — Registration UI

## Status
NOT_STARTED

## Priority
P1

## Dependencies
- Task 013
- Task 008

## Objective
Build the initial registration page UI at `/daftar` that collects basic information (child name, parent name, WhatsApp number), submits to the `create-registration` Edge Function, and shows the one-time access code on success.

## Context
This is the first page a registrant interacts with. It must be simple, mobile-friendly, and clearly communicate what the access code is and why they must save it. The access code is shown exactly once and must never be stored in localStorage or any persistent client storage.

## Scope
1. Create src/features/registration/pages/RegistrationStartPage.tsx
2. Form fields: child_name (text), parent_name (text), whatsapp_number (text with format hint)
3. Zod validation schema: src/features/registration/schemas/initial-registration.schema.ts
4. React Hook Form + shadcn Form, Input, Label components
5. Install required packages: `npm install react-hook-form @hookform/resolvers zod`
6. Install Sonner for toast: `npm install sonner` (or use shadcn Alert for inline errors)
7. On form submit: call create-registration Edge Function via Supabase client
8. Success state: show access code prominently with warning to save it; show registration number
9. On success: do NOT redirect immediately — let user acknowledge and copy access code
10. After acknowledgement: redirect to payment page `/bayar/:registrationNumber`
11. Error handling: display errors in Indonesian language
12. WhatsApp number: validate Indonesian format (08xx or +628xx)
13. Access code must NOT be stored in localStorage, sessionStorage, or any persistent storage
14. Access code passed in navigation state (React Router state) to payment page — it lives in memory only

## Out of Scope
- Payment page (Task 016)
- Status check page (Task 017)
- Full registration form (Phase 6)
- Email or WhatsApp notifications

## Specifications
- specs/06-ui-flows.md
- specs/05-edge-functions.md
- specs/03-security.md

## Implementation Plan
1. `npm install react-hook-form @hookform/resolvers zod`
2. `npm install sonner`
3. Add Sonner `<Toaster />` to src/app/providers.tsx
4. Create src/features/registration/schemas/initial-registration.schema.ts:
   ```typescript
   import { z } from 'zod'

   export const initialRegistrationSchema = z.object({
     child_name: z.string().min(2, 'Nama anak minimal 2 karakter').max(100),
     parent_name: z.string().min(2, 'Nama orang tua minimal 2 karakter').max(100),
     whatsapp_number: z.string()
       .regex(/^(\+?62|0)8[1-9][0-9]{6,10}$/, 'Format nomor WhatsApp tidak valid (contoh: 08123456789)'),
   })

   export type InitialRegistrationInput = z.infer<typeof initialRegistrationSchema>
   ```
5. Create src/features/registration/pages/RegistrationStartPage.tsx:
   - useForm with zodResolver(initialRegistrationSchema)
   - Form fields with shadcn Form, FormField, FormItem, FormLabel, FormControl, FormMessage
   - Submit button with loading state
   - On submit: call Supabase function `create-registration`
   - On success: set local state `{ registrationNumber, accessCode }` — show success UI
   - Success UI:
     - Prominent display of registration_number
     - Prominent display of access_code (large, copyable)
     - Bold warning in Indonesian: "SIMPAN KODE AKSES INI! Kode ini hanya ditampilkan sekali dan tidak dapat dikembalikan."
     - "Salin Kode" button (clipboard API)
     - "Lanjut ke Pembayaran" button → navigate to `/bayar/{registrationNumber}` with router state `{ accessCode }`
   - On error: show toast (Sonner) or inline error in Indonesian
6. Update src/app/router.tsx: ensure `/daftar` route renders RegistrationStartPage
7. Verify mobile responsiveness (Tailwind responsive classes)
8. Run `npx tsc --noEmit && npm run build`

## Files Expected to Change
- src/features/registration/pages/RegistrationStartPage.tsx (new)
- src/features/registration/schemas/initial-registration.schema.ts (new)
- src/app/providers.tsx (add Sonner Toaster)
- src/app/router.tsx (verify /daftar route)
- package.json (react-hook-form, zod, sonner added)
- package-lock.json

## Security Considerations
- **access_code must NOT be stored in localStorage or sessionStorage** — it lives in React component state and React Router navigation state only
- If user navigates away from success screen before copying the code, the code is lost — this is intentional and acceptable (they can contact admin for help)
- WhatsApp number is PII — ensure it is only sent over HTTPS to the Edge Function
- Form submission must use HTTPS (Supabase functions endpoint is always HTTPS)
- Inform user clearly that the access code cannot be recovered

## Acceptance Criteria
- [ ] Registration form renders at `/daftar` with shadcn Form components
- [ ] All 3 fields have labels and validation error messages in Indonesian
- [ ] WhatsApp number validation enforces Indonesian format
- [ ] Submit button shows loading state during API call
- [ ] Successful submission shows registration_number and access_code
- [ ] access_code display is prominent and copyable (clipboard button)
- [ ] Warning message displayed in Indonesian: save the access code
- [ ] "Lanjut ke Pembayaran" navigates to `/bayar/{registrationNumber}`
- [ ] access_code is NOT stored in localStorage (verified via browser DevTools)
- [ ] API error shows error message in Indonesian
- [ ] Form is mobile-responsive
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` succeeds

## Verification
```bash
npx tsc --noEmit && npm run build

# Manual tests:
# 1. Navigate to /daftar
# 2. Submit empty form → see validation errors in Indonesian ✓
# 3. Submit with invalid WhatsApp → see format error ✓
# 4. Submit with valid data → see success screen with registration_number and access_code ✓
# 5. Check browser DevTools → localStorage, sessionStorage — no access_code ✓
# 6. Click "Lanjut ke Pembayaran" → navigate to /bayar/{number} ✓
# 7. Go back → access_code is gone from success screen ✓
```

## Risks
- React Router navigation state is not persisted across full page refresh — if user refreshes payment page, access code is lost. This is acceptable for security; document in UX copy.
- Mobile keyboard layout may obscure form fields — test on mobile viewport
- Clipboard API may require user gesture / HTTPS — test copy button behavior

## Deliverables
- src/features/registration/pages/RegistrationStartPage.tsx
- src/features/registration/schemas/initial-registration.schema.ts
- Working registration form at `/daftar`
- Sonner toast integrated

## Completion Notes
_Not started_
