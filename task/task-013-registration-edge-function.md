# Task 013 — Registration Edge Function

## Status
NOT_STARTED

## Priority
P0

## Dependencies
- Task 010
- Task 011

## Objective
Create the `create-registration` Supabase Edge Function that handles the initial registration step: validates input, generates a unique registration number and access code, stores the hashed code, and returns the one-time access code to the caller.

## Context
Registrants begin the PPDB process by submitting basic info (child name, parent name, WhatsApp number). This creates a registration record and generates credentials the registrant will use to check their status. The access code is shown once and never stored in plaintext — only a hash is stored. This Edge Function runs server-side with the service role key, bypassing RLS.

## Scope
1. Create supabase/functions/create-registration/index.ts
2. Accept POST: `{ child_name, parent_name, whatsapp_number }`
3. Validate all fields (required, WhatsApp format)
4. Generate registration_number: format `PPDB-YYYY-XXXXX` (year + 5-digit zero-padded sequence or random)
5. Handle registration_number collision (retry with new number if duplicate)
6. Generate access code: 8 characters, CSPRNG, uppercase alphanumeric (A-Z0-9)
7. Hash access code with bcrypt or argon2 (use Deno-compatible library)
8. Insert into `registrations` (status: draft, payment_status: payment_pending)
9. Insert into `registration_access` (access_code_hash only — no plaintext)
10. Return response: `{ registration_number, access_code, registration_id }`
11. Access code must NOT be logged or stored anywhere after returning in the response
12. Return 400 for validation errors with descriptive message

## Out of Scope
- Payment handling (Task 016)
- Form data submission (Phase 6)
- Email/WhatsApp notifications (Task 024)
- Rate limiting (handled separately per Edge Function guidelines)

## Specifications
- specs/05-edge-functions.md
- specs/04-data-model.md
- specs/03-security.md

## Implementation Plan
1. Create directory: supabase/functions/create-registration/
2. Create index.ts with Deno HTTP handler:
   ```typescript
   import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
   import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

   serve(async (req) => {
     if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

     const { child_name, parent_name, whatsapp_number } = await req.json()

     // Validate inputs
     if (!child_name?.trim() || !parent_name?.trim() || !whatsapp_number?.trim()) {
       return new Response(JSON.stringify({ error: 'All fields required' }), {
         status: 400, headers: { 'Content-Type': 'application/json' }
       })
     }

     // Validate WhatsApp number format (Indonesian: 08xx or +628xx)
     const waRegex = /^(\+?62|0)8[1-9][0-9]{6,10}$/
     if (!waRegex.test(whatsapp_number.replace(/\s/g, ''))) {
       return new Response(JSON.stringify({ error: 'Invalid WhatsApp number format' }), {
         status: 400, headers: { 'Content-Type': 'application/json' }
       })
     }

     const supabase = createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
     )

     // Generate registration number with collision handling
     const year = new Date().getFullYear()
     let registration_number: string
     let attempts = 0
     do {
       const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
       registration_number = `PPDB-${year}-${seq}`
       const { data } = await supabase.from('registrations')
         .select('id').eq('registration_number', registration_number).single()
       if (!data) break
       attempts++
     } while (attempts < 10)

     if (attempts >= 10) {
       return new Response(JSON.stringify({ error: 'Server error, please try again' }), {
         status: 500, headers: { 'Content-Type': 'application/json' }
       })
     }

     // Generate access code (8 chars, A-Z0-9, CSPRNG)
     const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
     const bytes = new Uint8Array(8)
     crypto.getRandomValues(bytes)
     const access_code = Array.from(bytes).map(b => alphabet[b % alphabet.length]).join('')

     // Hash access code
     const access_code_hash = await hash(access_code)

     // Insert registration
     const { data: registration, error: regError } = await supabase
       .from('registrations')
       .insert({
         registration_number,
         child_name: child_name.trim(),
         parent_name: parent_name.trim(),
         whatsapp_number: whatsapp_number.trim(),
         registration_status: 'draft',
         payment_status: 'payment_pending',
       })
       .select('id')
       .single()

     if (regError) {
       return new Response(JSON.stringify({ error: 'Failed to create registration' }), {
         status: 500, headers: { 'Content-Type': 'application/json' }
       })
     }

     // Insert access record
     await supabase.from('registration_access').insert({
       registration_id: registration.id,
       access_code_hash,
       attempts: 0,
     })

     return new Response(
       JSON.stringify({ registration_number, access_code, registration_id: registration.id }),
       { status: 201, headers: { 'Content-Type': 'application/json' } }
     )
   })
   ```
3. Deploy: `npx supabase functions deploy create-registration`
4. Test with curl (success, validation errors, duplicate collision)
5. Write unit tests for registration_number format and access code generation

## Files Expected to Change
- supabase/functions/create-registration/index.ts (new)

## Security Considerations
- **Service role key in Edge Function env only** — set via Supabase dashboard → Edge Functions → Secrets
- **Access code never logged** — no console.log of access_code or access_code_hash
- **Access code shown only once** — documented in task; frontend must enforce (Task 015)
- **8 chars from 36-char alphabet** ≈ 41 bits of entropy — adequate for access codes (not passwords)
- **Hash before storage** — bcrypt recommended; argon2 acceptable
- **Collision retry** — max 10 attempts before 500; alert if frequent collisions (indicates pool exhaustion)
- **Input sanitization** — trim whitespace, validate WhatsApp format strictly

## Acceptance Criteria
- [ ] Edge Function deploys successfully
- [ ] POST with valid input returns `{ registration_number, access_code, registration_id }` with status 201
- [ ] registration_number format is `PPDB-YYYY-XXXXX`
- [ ] registration_access table contains bcrypt hash, NOT plaintext access_code
- [ ] access_code is NOT stored in registrations table
- [ ] Missing required fields return 400 with error message
- [ ] Invalid WhatsApp number format returns 400
- [ ] Duplicate registration_number collision handled (retry logic works)
- [ ] Function handles concurrent requests without race conditions on registration_number

## Verification
```bash
# Deploy
npx supabase functions deploy create-registration

# Test success case
curl -X POST \
  https://your-project.supabase.co/functions/v1/create-registration \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"child_name":"Ahmad Fauzi","parent_name":"Budi Santoso","whatsapp_number":"08123456789"}'
# Expected: 201 with registration_number, access_code, registration_id

# Test validation error
curl -X POST \
  https://your-project.supabase.co/functions/v1/create-registration \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"child_name":"","parent_name":"Budi","whatsapp_number":"08123456789"}'
# Expected: 400

# Verify DB: access_code_hash stored, not plaintext
# SELECT access_code_hash FROM registration_access LIMIT 1;
# Should start with $2b$ (bcrypt) not be 8-char code
```

## Risks
- Deno bcrypt library compatibility with Supabase Edge Function runtime — verify version
- Registration number pool exhaustion for large year-cohorts — consider sequential counters instead of random for production
- WhatsApp number format edge cases (international format, spaces, dashes) — test thoroughly

## Deliverables
- supabase/functions/create-registration/index.ts deployed
- Verified: registration created, hash stored, access code returned once

## Completion Notes
_Not started_
