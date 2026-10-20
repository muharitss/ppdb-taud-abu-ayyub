# PPDB TAUD Abu Ayyub — Product Requirements

## 1. Functional Requirements

### Phase A — Landing Page (Public Marketing Site)

| ID | Requirement |
|---|---|
| A-01 | Display school name, tagline, and logo prominently |
| A-02 | Display school programs (sections: Hero, Programs, VisionMission, About, OutputStandards) |
| A-03 | Display registration requirements (administrative and non-administrative) |
| A-04 | Display photo gallery / documentation section |
| A-05 | Display school location with address and map embed |
| A-06 | Display contact information (WhatsApp numbers) |
| A-07 | Provide a clear **Daftar Sekarang** (Register Now) call-to-action that routes to Phase B |
| A-08 | Site must be fully responsive (mobile-first) |
| A-09 | Navbar must link to all major landing sections via smooth scroll |

### Phase B — Initial Registration

| ID | Requirement |
|---|---|
| B-01 | Present a short initial form: parent full name, child full name, WhatsApp number |
| B-02 | Validate all fields client-side (non-empty, WhatsApp format) and server-side |
| B-03 | On submission, call the `create-registration` Edge Function |
| B-04 | Edge Function generates a unique **Registration Number** (`PPDB-YYYY-XXXXX`) server-side |
| B-05 | Edge Function generates an **Access Code** (8 random uppercase alphanumeric chars) server-side via CSPRNG |
| B-06 | Access code is shown to the user **exactly once** on the confirmation screen — never again |
| B-07 | User is strongly instructed to save both the registration number and access code |
| B-08 | Initial status is set to `draft` → `awaiting_payment` after confirmation screen is acknowledged |
| B-09 | Prevent duplicate submissions from the same WhatsApp number within the same PPDB period (configurable via `ppdb_config`) |

### Phase C — Payment

| ID | Requirement |
|---|---|
| C-01 | Display bank account details and registration fee (Rp300.000) clearly |
| C-02 | Display the parent's registration number for reference |
| C-03 | Allow parent to upload a photo/screenshot of payment proof (JPEG, PNG, PDF; max 5 MB) |
| C-04 | File is uploaded to the private `payment-proofs` Supabase Storage bucket via Edge Function |
| C-05 | After upload, registration `payment_status` is set to `payment_submitted` |
| C-06 | After upload, registration `status` advances to `awaiting_form` |
| C-07 | Show a success message and a pre-filled wa.me link directing the parent to inform admin |
| C-08 | If a payment proof has already been uploaded, allow re-upload (replaces previous file) unless payment is already `payment_verified` |

### Phase D — Full Registration Form

> **⚠️ TBD — Awaiting official school requirements.**
> Field list below is a starting placeholder. Final field list must be confirmed with the school administration before implementation.

| ID | Requirement |
|---|---|
| D-01 | Full form is only accessible after payment proof is uploaded (status = `awaiting_form`) |
| D-02 | Form is accessed by entering registration number + access code (same as status page) |
| D-03 | Form collects detailed child data (fields TBD — see note above) |
| D-04 | Form collects parent/guardian data (fields TBD) |
| D-05 | Form allows upload of required documents (fields TBD — see Section 3 for known doc requirements) |
| D-06 | All uploads go to private `registration-documents` bucket via Edge Function |
| D-07 | On final submission, status advances to `submitted` |
| D-08 | Form data is saved incrementally (auto-save or step-by-step) to avoid data loss |
| D-09 | Once `submitted`, form fields become read-only |

### Phase E — Success + WhatsApp Notification

| ID | Requirement |
|---|---|
| E-01 | Show a confirmation screen after full form submission |
| E-02 | Display registration number and remind parent to save it |
| E-03 | Show a pre-filled **wa.me** link with a message like: *"Assalamu'alaikum, saya [nama] telah menyelesaikan pendaftaran PPDB TP.2026-2027. Nomor pendaftaran saya: PPDB-YYYY-XXXXX."* |
| E-04 | Clearly state that the parent must press Send manually — delivery is not automatic |
| E-05 | Provide a link to the status page (Phase F) |

### Phase F — Registration Status Page

| ID | Requirement |
|---|---|
| F-01 | Parent enters registration number + access code to view status |
| F-02 | Verification is performed by the `verify-registration-access` Edge Function (not by client-side logic) |
| F-03 | Display current registration status and payment status in plain language |
| F-04 | If status is `accepted`, display acceptance letter / congratulations message |
| F-05 | If status is `rejected`, display the rejection note provided by admin |
| F-06 | If status is `awaiting_form`, show a button to continue to Phase D |
| F-07 | Apply rate limiting: maximum 5 incorrect attempts per IP per 15 minutes |
| F-08 | Error messages must not reveal whether a registration number exists |

### Phase G — Admin Dashboard

| ID | Requirement |
|---|---|
| G-01 | Admin login via Supabase Auth (email + password); no public registration |
| G-02 | Dashboard shows summary counts: total registrations, awaiting payment, awaiting form, submitted, under review, accepted, rejected |
| G-03 | Admin can view a paginated, searchable, and filterable list of all registrations |
| G-04 | Admin can open a registration detail page showing all submitted data and documents |
| G-05 | Admin can view uploaded payment proof (via signed URL) |
| G-06 | Admin can approve or reject payment proof with an optional note |
| G-07 | On payment approval, `payment_status` → `payment_verified`; on rejection → `payment_rejected` |
| G-08 | Admin can update registration status (e.g., move from `under_review` to `accepted` or `rejected`) |
| G-09 | Admin can add review notes visible to the applicant on the status page |
| G-10 | All admin actions are recorded in the `audit_events` table |
| G-11 | Admin routes are protected: unauthenticated users are redirected to admin login |
| G-12 | Role is checked server-side via RLS — frontend role checks are UI conveniences only |
| G-13 | Admin can configure PPDB open/close periods via `ppdb_config` table |

---

## 2. Non-Functional Requirements

### Security
- All sensitive operations (access code generation, payment verification, status changes) run in **Supabase Edge Functions**, never on the client.
- RLS is enabled on every table; default-deny for `anon` and `authenticated` roles unless explicitly granted.
- Admin role is enforced in the database, not only in the frontend.
- See [`03-security.md`](./03-security.md) for full security requirements.

### Performance
- Lighthouse Performance score ≥ 80 on mobile (3G simulation).
- Largest Contentful Paint (LCP) ≤ 3 s on a mid-range mobile device.
- Images in the landing page must use modern formats (WebP preferred) and include `width`/`height` attributes to prevent layout shift.
- TanStack Query must be used for all server-state fetching to enable caching and deduplication.

### Accessibility
- Minimum WCAG 2.1 Level AA compliance.
- All interactive elements must be keyboard-navigable.
- All images must have descriptive `alt` text.
- Form fields must have visible labels (not just placeholders).
- Color contrast ratio ≥ 4.5:1 for normal text.

### Maintainability
- TypeScript strict mode; no `any` without a documented justification comment.
- shadcn/ui components must import `cn` from `@/lib/utils`, never from the `cn` npm package.
- Feature-oriented directory structure (see [`02-architecture.md`](./02-architecture.md)).
- All environment variables documented in `.env.example`.
- Spec files updated before or alongside any significant architectural change.

### Browser Support
- Chrome, Firefox, Safari, Edge — last 2 major versions.
- Mobile Safari (iOS 15+) and Chrome for Android.

---

## 3. Registration Requirements (from `data/content.ts`)

### Administrative Requirements
These are the known requirements a parent must fulfill:

| # | Requirement |
|---|---|
| 1 | Biaya pendaftaran **Rp300.000** |
| 2 | Formulir pendaftaran (completed via this application) |
| 3 | Fotokopi Akte Kelahiran (1 lembar) |
| 4 | Fotokopi Kartu Keluarga / KK (1 lembar) |
| 5 | Pas Foto 3×4 latar merah (2 lembar) |

### Non-Administrative Requirements (Child Readiness)

| # | Requirement |
|---|---|
| 1 | Usia minimal 3,5 tahun |
| 2 | Dapat memahami instruksi sederhana |
| 3 | Lulus toilet training |
| 4 | Dapat melafalkan huruf dengan jelas |
| 5 | Orang tua siap bekerja sama dengan pihak sekolah |
| 6 | Komitmen untuk menyelesaikan jenjang TAUD |

> **Note:** Document upload fields in Phase D (Akte, KK, pas foto) are TBD pending final confirmation from school administration on whether digital uploads are accepted.

---

## 4. WhatsApp Integration Constraints

- Only `wa.me/<number>?text=<encoded-message>` deep-links are used.
- The application **cannot** programmatically send or verify WhatsApp messages.
- The parent must manually tap the link and press **Send** in WhatsApp.
- Admin WhatsApp numbers: `6282169599979` (Ummu Rumi), `6281367074138` (Admin). These are defined in application config and not hardcoded in multiple places.
- WhatsApp notifications are for:
  1. Parent → Admin: "I have completed registration / uploaded payment" (Phase C and Phase E).
  2. Admin → Parent: Out of scope (admin uses WhatsApp manually from their phone).

---

## 5. Payment Constraints

- **Payment method:** Manual bank transfer only.
- **Amount:** Rp300.000 (fixed; configurable via `ppdb_config` for future PPDB periods).
- **Proof:** Parent uploads a screenshot or photo of the transfer receipt.
- **Verification:** Admin visually verifies the proof in the admin dashboard and approves or rejects.
- **No payment gateway** of any kind (Midtrans, Xendit, Doku, etc.).
- **No refund flow** in scope (handled offline).

---

## 6. Out of Scope

The following are explicitly **not** part of this project:

| Out of Scope Item | Reason |
|---|---|
| Payment gateway integration | Cost, complexity, overkill for small school volume |
| WhatsApp Business API | Cost and compliance overhead |
| Separate Express / NestJS backend server | Supabase Edge Functions are sufficient |
| Native mobile apps (iOS / Android) | Responsive web is sufficient |
| Automated acceptance/rejection logic | Admin makes all enrollment decisions manually |
| Student information system (SIS) integration | School has no SIS yet |
| Multi-school / multi-tenant support | Single school only |
| Email notifications | WhatsApp is the school's primary communication channel |
