# PPDB TAUD Abu Ayyub — Project Overview

## 1. Project Purpose

**PPDB TAUD Abu Ayyub** is an online student-registration system (Penerimaan Peserta Didik Baru) for **TAUD SaQu Abu Ayyub**, an Islamic early-childhood school (*Taman Asuh Usia Dini / TAUD*) located in Duri, Bengkalis, Riau, Indonesia.

The goal is to replace the current paper-and-external-form process with a self-contained web application that guides prospective parents through registration, payment confirmation, and document submission, while giving school administrators a dashboard to review applications and manage enrollment.

---

## 2. School Information

| Field | Value |
|---|---|
| School name | TAUD SaQu Abu Ayyub |
| Location | Jl. Sakura Gg. Mufakat 3 RT 002/RW 013, Kel. Duri Barat, Kec. Mandau, Kab. Bengkalis, Riau |
| Academic year | TP.2026-2027 |
| Admin WhatsApp | 6282169599979 (Ummu Rumi), 6281367074138 (Admin) |

---

## 3. Confirmed Tech Stack

### Frontend
| Technology | Version | Notes |
|---|---|---|
| React | 19.1 | |
| TypeScript | 5.9 (strict) | `noUnusedLocals`, `noUnusedParameters` enabled |
| Vite | 7 | Build tool and dev server |
| Tailwind CSS | v4 | Via `@tailwindcss/vite` plugin (no `tailwind.config.js`) |
| shadcn/ui | latest | Style: **new-york**, base color: neutral, CSS variables: true |
| embla-carousel-react | latest | Used by shadcn Carousel component |
| lucide-react | latest | Icon library |

### To Be Added (per phase)
| Technology | Purpose |
|---|---|
| React Router v6 | Client-side SPA routing |
| Supabase (JS client) | Database, auth, storage, Edge Functions |
| React Hook Form | Form state management |
| Zod | Schema validation |
| TanStack Query v5 | Server state / async data fetching |

### Path Alias
- `@/` → `src/`

---

## 4. Application Scope — Phases

The application is structured into **10 phases labeled A through G** (with some phases split):

| Phase | Label | Description | Status |
|---|---|---|---|
| A | Landing page | Public marketing site, school info, programs, gallery | Partially built (landing components exist) |
| B | Initial registration | Parent fills name, child name, WhatsApp number; receives registration number + access code | Planned |
| C | Payment | Instruction page with bank details and Rp300.000 fee; upload proof of payment | Planned |
| D | Full registration form | Detailed child and family data (fields TBD); document uploads | Planned |
| E | Success + WhatsApp | Confirmation page; pre-filled wa.me link so parent can notify admin | Planned |
| F | Status page | Parent enters registration number + access code to check current status | Planned |
| G | Admin dashboard | Admin reviews payments, manages registration status, views applications, audit log | Planned |

---

## 5. Key Constraints

### Payment
- **No payment gateway** (Midtrans, Xendit, etc.) — manual bank transfer only.
- Registration fee: **Rp300.000**.
- Parent uploads a screenshot/photo of transfer receipt; admin verifies manually.

### WhatsApp Communication
- **No WhatsApp Business API** — only `wa.me` deep-links.
- User must tap the pre-filled link and press **Send** themselves; delivery is not guaranteed.
- Admin WhatsApp numbers are static strings defined in `data/content.ts` and environment-aware config.

### Admin Access
- **No public admin registration**. Admin accounts are created directly in Supabase Auth by the project owner.
- Role enforcement lives in the **database** (RLS + `admin_profiles` table), never only in the frontend.

### Backend
- **No separate Express / NestJS server**. All server-side logic runs in **Supabase Edge Functions**.
- The Supabase service role key is **never** placed in any `VITE_` environment variable.

---

## 6. Development Approach

This project follows **Spec-Driven Development**:
1. Specs are written and agreed upon first (this `specs/` directory).
2. Implementation follows the specs, not the other way around.
3. Any significant deviation from a spec requires updating the relevant spec file before or alongside the code change.

---

## 7. Spec Files Index

| File | Contents |
|---|---|
| [`00-project-overview.md`](./00-project-overview.md) | This file — purpose, stack, phases, constraints |
| [`01-requirements.md`](./01-requirements.md) | Functional and non-functional requirements per phase |
| [`02-architecture.md`](./02-architecture.md) | Directory structure, routing, state management, Edge Functions |
| [`03-security.md`](./03-security.md) | Access codes, RLS, storage, admin security, secrets |
| [`04-data-model.md`](./04-data-model.md) | Database schema, enums, indexes, storage buckets |

---

## 8. Known Technical Debt (pre-spec state)

The following issues were discovered during the initial audit and must be resolved during implementation:

| Issue | File(s) | Action |
|---|---|---|
| `button.tsx` and `card.tsx` import from `"cn"` (npm package) instead of `"@/lib/utils"` | `src/components/ui/button.tsx`, `card.tsx` | Fix import path |
| `keen-slider` installed but never used | `package.json` | Remove dependency |
| `radix-ui` barrel package AND `@radix-ui/react-slot` both installed (redundant) | `package.json` | Remove `radix-ui`, keep `@radix-ui/react-slot` |
| `cn` npm package installed; only referenced by the wrong imports above | `package.json` | Remove after fixing imports |
| `src/App.css` is pure Vite boilerplate, not imported in `App.tsx` | `src/App.css` | Delete |
| `public/vite.svg` is Vite boilerplate, not referenced in code | `public/vite.svg` | Delete |
| `src/assets/react.svg` is Vite boilerplate, unused | `src/assets/react.svg` | Delete |
| `OutputStandards.tsx` line 77 declares `const Icon = item.icon` but never renders it (TS `noUnusedLocals` error) | `src/components/OutputStandards.tsx` | Render the icon |
| `Contact.tsx`, `Header.tsx`, `ProgramMaterials.tsx`, `Requirements.tsx` are never imported in `App.tsx` | `src/components/` | Evaluate: integrate, relocate to features, or remove |
| `ProgramMaterials.tsx` uses Carousel without `CarouselContent`/`CarouselItem` (broken) | `src/components/ProgramMaterials.tsx` | Fix or remove |
| Image paths in `data/content.ts` reference `/images/documentation/photo-*.jpg` which do not exist in `public/` | `src/data/content.ts` | Add real images or update paths |
