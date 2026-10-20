# Task 035 — Vercel Deployment

## Status
NOT_STARTED

## Priority
P0

## Dependencies
- Task 008 — Project Restructure & Routing
- Task 034 — Production Supabase Setup

## Objective
Deploy the frontend application to Vercel production with proper SPA routing and environment variables.

## Context
The PPDB application frontend is built with Vite + React Router and deployed on Vercel. Because client-side routing is used, Vercel must rewrite all requests to `index.html` to avoid 404 errors on direct navigation or refresh. Production Supabase credentials must be configured securely.

## Scope
1. Verify `vercel.json` exists in project root with SPA rewrite rule:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. Connect Git repository to Vercel project
3. Configure build settings in Vercel:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Configure production environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL` = `<production-supabase-url>`
   - `VITE_SUPABASE_ANON_KEY` = `<production-supabase-anon-key>`
5. Trigger initial deployment and verify build succeeds
6. Verify deep links resolve properly without 404 (e.g. `/daftar`, `/status`, `/admin/login`)
7. Verify HTTPS certificate is active and auto-renewing

## Out of Scope
- Custom school domain purchase/setup (optional post-launch step)
- Backend Supabase deployment (handled in task 034)

## Specifications
- specs/08-deployment.md
- specs/02-architecture.md

## Implementation Plan
1. Check or create `vercel.json` in repository root.
2. Link repository to Vercel via Vercel CLI or Web Dashboard.
3. Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Trigger production deployment.
5. Test navigation directly by entering URLs into browser address bar.
6. Test API connectivity against production Supabase.

## Files Expected to Change
- `vercel.json` (created or verified)

## Security Considerations
- **NEVER** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables or prefix it with `VITE_`.
- Verify `.env.local` is not committed and not deployed.
- Ensure only anon key is bundled in client-side build artifacts.

## Acceptance Criteria
- [ ] `vercel.json` contains correct SPA rewrites
- [ ] Vercel production build completes without errors
- [ ] Landing page renders identically to local environment
- [ ] Direct access to `/status` does not return 404
- [ ] Direct access to `/admin/login` does not return 404
- [ ] Client communicates successfully with production Supabase
- [ ] Service role key is not present in bundled JS files

## Verification
```bash
# Verify vercel.json syntax
cat vercel.json

# Test production build locally
npm run build && npm run preview

# After deploy, verify deep links via curl
curl -I https://<your-vercel-domain>/status
# Expected: 200 OK (rewritten to index.html)
```

## Risks
- Direct URL access failing with 404 if `vercel.json` rewrite is missing or malformed.
  *Mitigation:* Test deep links immediately after deploy.
- Leaking service role key if environment variables are misconfigured.
  *Mitigation:* Inspect client bundle with grep for sensitive tokens.

## Deliverables
- `vercel.json` configured in repository.
- Successful Vercel production deployment URL.

## Completion Notes
_Not started_
