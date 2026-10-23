# Task 014 — Verify Access Edge Function

## Status
DONE

## Priority
P0

## Dependencies
- Task 013

## Objective
Create the `verify-registration-access` Supabase Edge Function that validates a registration number and access code, implements rate limiting, and returns only the permitted status fields when credentials are valid.

## Context
Registrants use their registration_number + access_code to check their PPDB status. This Edge Function is the gatekeeper: it verifies credentials without revealing whether a registration_number exists (prevents enumeration), implements rate limiting to prevent brute-force attacks, and returns only the minimal data needed for the status page.

## Scope
1. Create supabase/functions/verify-registration-access/index.ts
2. Accept POST: `{ registration_number, access_code }`
3. Look up registration by registration_number
4. If not found: return same opaque error as wrong code (do NOT distinguish)
5. Look up registration_access record for the registration
6. Check rate limit: max 5 failed attempts per registration_number per 15 minutes
7. If rate limited: return 429 with retry-after information
8. Compare access_code against stored hash using bcrypt verify
9. If mismatch: increment attempt counter, return opaque error
10. If match: reset attempt counter, return permitted status fields only
11. Permitted response fields: `{ registration_number, registration_status, payment_status, submitted_at, form_completeness }`
12. Never return: access_code_hash, parent_name (full), whatsapp_number, documents, form_data

## Out of Scope
- Admin access (admin queries DB directly via service role)
- Full form data retrieval
- Document download

## Specifications
- specs/05-edge-functions.md
- specs/03-security.md
- specs/04-data-model.md

## Implementation Plan
1. Create directory: supabase/functions/verify-registration-access/
2. Create index.ts:
   ```typescript
   import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
   import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

   const OPAQUE_ERROR = { error: 'Registration number or access code is incorrect' }
   const MAX_ATTEMPTS = 5
   const WINDOW_MINUTES = 15

   serve(async (req) => {
     if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

     const { registration_number, access_code } = await req.json()

     if (!registration_number?.trim() || !access_code?.trim()) {
       return new Response(JSON.stringify(OPAQUE_ERROR), {
         status: 400, headers: { 'Content-Type': 'application/json' }
       })
     }

     const supabase = createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
     )

     // Look up registration (join with access record)
     const { data: registration } = await supabase
       .from('registrations')
       .select('id, registration_number, registration_status, payment_status, submitted_at')
       .eq('registration_number', registration_number.trim().toUpperCase())
       .single()

     if (!registration) {
       // Artificial delay to match hash comparison time (timing attack prevention)
       await new Promise(r => setTimeout(r, 200))
       return new Response(JSON.stringify(OPAQUE_ERROR), {
         status: 401, headers: { 'Content-Type': 'application/json' }
       })
     }

     // Get access record
     const { data: accessRecord } = await supabase
       .from('registration_access')
       .select('id, access_code_hash, attempts, last_attempt_at')
       .eq('registration_id', registration.id)
       .single()

     if (!accessRecord) {
       return new Response(JSON.stringify(OPAQUE_ERROR), {
         status: 401, headers: { 'Content-Type': 'application/json' }
       })
     }

     // Rate limiting check
     const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
     const lastAttempt = accessRecord.last_attempt_at ? new Date(accessRecord.last_attempt_at) : null
     const attemptsInWindow = lastAttempt && lastAttempt > windowStart ? accessRecord.attempts : 0

     if (attemptsInWindow >= MAX_ATTEMPTS) {
       return new Response(
         JSON.stringify({ error: 'Too many attempts. Please try again in 15 minutes.' }),
         { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '900' } }
       )
     }

     // Verify access code
     const isValid = await compare(access_code.trim().toUpperCase(), accessRecord.access_code_hash)

     if (!isValid) {
       // Increment attempt counter
       await supabase.from('registration_access').update({
         attempts: attemptsInWindow + 1,
         last_attempt_at: new Date().toISOString(),
       }).eq('id', accessRecord.id)

       return new Response(JSON.stringify(OPAQUE_ERROR), {
         status: 401, headers: { 'Content-Type': 'application/json' }
       })
     }

     // Success: reset attempt counter
     await supabase.from('registration_access').update({
       attempts: 0,
       last_attempt_at: null,
     }).eq('id', accessRecord.id)

     // Return permitted fields only
     return new Response(JSON.stringify({
       registration_number: registration.registration_number,
       registration_status: registration.registration_status,
       payment_status: registration.payment_status,
       submitted_at: registration.submitted_at,
       form_completeness: false, // TODO: calculate based on form_data completeness
     }), { status: 200, headers: { 'Content-Type': 'application/json' } })
   })
   ```
3. Deploy: `npx supabase functions deploy verify-registration-access`
4. Test: valid credentials, wrong code, non-existent registration, rate limiting
5. Verify response never includes hash or private data

## Files Expected to Change
- supabase/functions/verify-registration-access/index.ts (new)

## Security Considerations
- **Opaque error**: exact same error message and HTTP status for non-existent registration AND wrong access code — prevents enumeration
- **Timing attack**: artificial delay when registration not found to match bcrypt compare timing
- **Rate limiting**: max 5 attempts per 15-minute window per registration_number
- **Response field whitelist**: explicitly select and return ONLY permitted fields — do NOT spread the full DB row
- **No logging of access_code**: never log the plaintext code
- **access_code_hash NOT in response**: verified — select only needed fields

## Acceptance Criteria
- [x] Edge Function files configured (`supabase/functions/verify-registration-access/index.ts`, `deno.json`)
- [x] Valid credentials return `{ registration_number, registration_status, payment_status, submitted_at, form_completeness }`
- [x] Wrong access_code returns opaque 401 error
- [x] Non-existent registration_number returns same opaque 401 error (same message, same status)
- [x] Rate limiting activates after 5 failed attempts within 15 minutes
- [x] Rate limited request returns 429 with Retry-After header
- [x] Successful login resets attempt counter
- [x] Response does NOT include: access_code_hash, whatsapp_number, parent_name, form data, documents
- [x] Missing input returns 400

## Verification
```bash
# Run unit & logic verification tests
node --experimental-strip-types src/features/status/__tests__/verify-registration-access.test.ts

# Typecheck & build
npx tsc -b --noEmit && npm run build
```

## Risks
- bcrypt compare timing varies — mitigated using constant pre-computed dummy bcrypt comparison against non-existent registrations to prevent timing side-channels.
- Attempt counter reset on success may be exploited if attacker can guess after legitimate user logs in — acceptable trade-off for UX.
- form_completeness calculation is stubbed — implement properly in Phase 6.

## Deliverables
- `supabase/functions/verify-registration-access/index.ts`
- `supabase/functions/verify-registration-access/deno.json`
- `src/features/status/types/index.ts`
- `src/features/status/services/status.ts`
- `src/features/status/__tests__/verify-registration-access.test.ts`

## Completion Notes
- Implemented `supabase/functions/verify-registration-access/index.ts` with CORS preflight, strict input validation, opaque error message (`Nomor pendaftaran atau kode akses tidak sesuai`), timing attack defense via dummy bcrypt comparison on invalid lookups, 5-attempt/15-minute rate limiting tracked via `audit_events`, attempt reset on success, and strict whitelisting of response fields.
- Created status feature types in `src/features/status/types/index.ts` and client invocation service in `src/features/status/services/status.ts`.
- Implemented 7-part unit test suite in `src/features/status/__tests__/verify-registration-access.test.ts` verifying all security properties and business rules.
- Passed `node --experimental-strip-types src/features/status/__tests__/verify-registration-access.test.ts`, `npx tsc -b --noEmit`, `npm run lint`, and `npm run build`.
