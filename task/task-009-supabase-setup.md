# Task 009 — Supabase Setup

## Status
NOT_STARTED

## Priority
P0

## Dependencies
- Task 004
- Task 005
- Task 008

## Objective
Create and configure the Supabase project (remote and local CLI), install the Supabase client library, set up environment variable handling, and verify the client can connect.

## Context
Supabase is the backend for all database, auth, and Edge Function functionality. This task sets up the foundation that all subsequent backend tasks (010–014) build upon. The Supabase client must be properly typed and environment variables must be managed securely (no VITE_ variables for service role keys).

## Scope
1. Create remote Supabase project (via Supabase dashboard or CLI)
2. Install Supabase CLI globally or as dev dependency
3. Initialize supabase/ directory with `supabase init`
4. Configure supabase/config.toml for local development
5. Install @supabase/supabase-js: `npm install @supabase/supabase-js`
6. Create src/lib/supabase/client.ts with typed Supabase client using VITE_ env vars
7. Create src/lib/env.ts with typed environment variable accessors (update stub from Task 008)
8. Create .env.local with actual Supabase URL and anon key (gitignored)
9. Create .env.example with variable names and placeholder values (committed)
10. Verify .gitignore includes .env.local
11. Verify Supabase client connects (test query or health check)

## Out of Scope
- Database migrations (Task 010)
- RLS policies (Task 011)
- Edge Functions (Task 013, 014)
- Admin authentication implementation (Task 012)
- Service role key usage in frontend (never allowed)

## Specifications
- specs/02-architecture.md
- specs/03-security.md
- specs/08-deployment.md

## Implementation Plan
1. Go to supabase.com → New project → create project → note URL and anon key
2. Install Supabase CLI: `npm install -D supabase` (or follow CLI install docs)
3. Run: `npx supabase init` in project root → creates supabase/ directory
4. Review supabase/config.toml → set project_id to your Supabase project ref
5. Run: `npm install @supabase/supabase-js`
6. Create src/lib/supabase/client.ts:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   import { env } from '@/lib/env'

   export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
   ```
7. Update src/lib/env.ts with actual env var accessors:
   ```typescript
   export const env = {
     SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
     SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
   } as const
   ```
8. Create .env.local:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
9. Create .env.example:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
10. Verify `.gitignore` contains `.env.local` and `.env*.local`
11. Add a temporary connection test (can be a console.log in a dev-only component or a one-off script)
12. Run `npm run build && npx tsc --noEmit` to verify no TS errors

## Files Expected to Change
- package.json (@supabase/supabase-js added, supabase CLI dev dep)
- package-lock.json
- supabase/ (new directory, initialized by CLI)
- supabase/config.toml
- src/lib/supabase/client.ts (new)
- src/lib/env.ts (updated from stub)
- .env.local (new, gitignored)
- .env.example (new, committed)
- .gitignore (verify/update)

## Security Considerations
- **NEVER** put the Supabase service role key in any VITE_ variable — it would be exposed in the browser bundle
- **NEVER** commit .env.local — verify .gitignore
- The anon key is safe to expose in VITE_ variables (it is public by design, protected by RLS)
- Service role key is used ONLY in Edge Functions (Supabase Edge Function environment, not frontend)
- Validate that env.ts throws or warns at runtime if env vars are missing

## Acceptance Criteria
- [ ] Remote Supabase project created
- [ ] supabase/ directory initialized
- [ ] @supabase/supabase-js installed
- [ ] src/lib/supabase/client.ts created with typed client
- [ ] src/lib/env.ts updated with actual env var accessors
- [ ] .env.local created with real values (gitignored)
- [ ] .env.example committed with placeholder values
- [ ] .gitignore confirmed to exclude .env.local
- [ ] Supabase client can connect to remote project (verified)
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` succeeds

## Verification
```bash
# Confirm env.local is gitignored
git check-ignore -v .env.local

# Confirm client.ts exists
cat src/lib/supabase/client.ts

# TypeScript + build
npx tsc --noEmit && npm run build

# Confirm no service role key in VITE_ vars
grep -r "service_role\|service-role" .env.local 2>/dev/null && echo "WARNING: service role key found!"
```

## Risks
- Supabase project region selection — choose closest to users (Indonesia: Southeast Asia)
- Free tier limits — document plan tier used
- .env.local accidentally committed — .gitignore check is mandatory

## Deliverables
- Initialized supabase/ directory
- Typed Supabase client at src/lib/supabase/client.ts
- .env.example committed to repo
- Connected Supabase client verified

## Completion Notes
_Not started_
