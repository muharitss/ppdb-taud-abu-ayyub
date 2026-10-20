# Task 012 — Admin Authentication

## Status
NOT_STARTED

## Priority
P0

## Dependencies
- Task 009
- Task 011

## Objective
Implement admin authentication and authorization: admin login page, auth guard, session management, and role verification via admin_profiles table.

## Context
Admin users manage registrations, verify payments, and communicate with applicants. Access must be strictly controlled — no public signup, invitation-only via Supabase Auth. The role check must be backed by the database (admin_profiles record existence), not merely a frontend flag or JWT claim that could be spoofed.

## Scope
1. Create admin user(s) in Supabase Auth (invitation-only, via Supabase dashboard — NOT a public signup flow)
2. Create corresponding admin_profiles record(s) for each admin user
3. Build admin login page at `/admin/login` using shadcn Form, Input, Button
4. Build AdminLayout component with auth guard that protects all `/admin/*` routes
5. Implement auth state management using Supabase Auth session (onAuthStateChange)
6. Implement role check: verify admin_profiles record exists for logged-in user
7. Implement logout functionality
8. Redirect unauthenticated users from `/admin/*` to `/admin/login`
9. Redirect non-admin authenticated users away from `/admin` (to landing or 403 page)
10. On successful login, redirect to `/admin` (dashboard placeholder)

## Out of Scope
- Admin dashboard features (Tasks 026–030)
- MFA (document as future enhancement in specs/03-security.md)
- Admin user self-service password reset (use Supabase dashboard for now)
- Public registration auth (registrants do not create accounts — access code model)

## Specifications
- specs/02-architecture.md
- specs/03-security.md

## Implementation Plan
1. In Supabase dashboard: Auth → Users → Invite → invite admin email(s)
2. In Supabase Studio SQL editor: insert into admin_profiles for each admin user
3. Create src/features/admin/pages/AdminLoginPage.tsx:
   - shadcn Form with email + password fields
   - On submit: call `supabase.auth.signInWithPassword({ email, password })`
   - On success: redirect to `/admin`
   - On error: show generic error message (do NOT distinguish "wrong password" vs "email not found")
   - Use shadcn Input, Label, Button, Form components
4. Create src/app/layouts/AdminLayout.tsx:
   - useEffect to subscribe to `supabase.auth.onAuthStateChange`
   - On SIGNED_OUT or no session: redirect to `/admin/login`
   - On SIGNED_IN: check admin_profiles — if no record: sign out + redirect with "unauthorized" message
   - Render `<Outlet />` for admin sub-routes when authorized
5. Create src/hooks/useAdminAuth.ts:
   - Returns: { user, isAdmin, isLoading }
   - Checks session and admin_profiles existence
6. Update src/app/router.tsx to nest admin routes under AdminLayout
7. Add logout button to admin layout header
8. Create src/features/admin/pages/AdminDashboardPage.tsx placeholder

## Files Expected to Change
- src/features/admin/pages/AdminLoginPage.tsx (new)
- src/features/admin/pages/AdminDashboardPage.tsx (new placeholder)
- src/app/layouts/AdminLayout.tsx (new)
- src/hooks/useAdminAuth.ts (new)
- src/app/router.tsx (updated with nested admin routes)

## Security Considerations
- **Login error messages must not distinguish between wrong password and non-existent email** — prevents user enumeration
- **Role check must query admin_profiles** — not just check `session.user` existence. An authenticated user who is NOT in admin_profiles must be blocked.
- **Session managed by Supabase Auth** — do not store role or admin status in localStorage
- **No public signup route** — admin accounts created only via Supabase dashboard invitation
- MFA: document as recommended future enhancement
- Consider adding a short rate limit delay on failed login to slow brute-force (Supabase Auth has built-in protections)

## Acceptance Criteria
- [ ] Admin login page renders at `/admin/login` with shadcn Form components
- [ ] Successful login with valid admin credentials redirects to `/admin`
- [ ] Failed login (wrong credentials) shows generic error without info leak
- [ ] Non-admin authenticated user (not in admin_profiles) is blocked from `/admin`
- [ ] Unauthenticated user visiting `/admin/*` is redirected to `/admin/login`
- [ ] Session persists across page refresh (Supabase handles this)
- [ ] Logout button clears session and redirects to `/admin/login`
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` succeeds

## Verification
```bash
npx tsc --noEmit && npm run build

# Manual tests:
# 1. Visit /admin → redirected to /admin/login ✓
# 2. Login with valid admin credentials → redirected to /admin ✓
# 3. Refresh /admin → stays on /admin (session persists) ✓
# 4. Click logout → redirected to /admin/login ✓
# 5. Try visiting /admin directly again → redirected to /admin/login ✓
# 6. Login with wrong password → see generic error, no user enumeration ✓
```

## Risks
- onAuthStateChange race conditions (e.g., showing protected content briefly before session check) — use isLoading state
- admin_profiles query could fail if RLS is misconfigured — test with actual session tokens
- Session refresh: Supabase handles token refresh automatically, but test for long-lived sessions

## Deliverables
- Admin login page at `/admin/login`
- AdminLayout with auth guard
- useAdminAuth hook
- Admin dashboard placeholder at `/admin`
- Logout functionality

## Completion Notes
_Not started_
