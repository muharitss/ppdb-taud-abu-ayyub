# PPDB TAUD Abu Ayyub — Task Dashboard & Project Tracker

> **Pendekatan:** Spec-Driven Development (SDD)  
> **Status:** Phase 3 In Progress (Database Migrations Selesai)  
> **Progres Akurat:** 11 / 36 Task Selesai (**30.56%**)

---

## 1. Ringkasan Proyek & Tujuan Aplikasi

Aplikasi **PPDB TAUD Abu Ayyub** adalah sistem Penerimaan Peserta Didik Baru berbasis web untuk **TAUD SaQu Abu Ayyub** (Tahun Pelajaran 2026/2027) di Duri, Mandau, Bengkalis, Riau.

Sistem bertransformasi dari landing page statis menjadi aplikasi web terintegrasi yang mencakup:
1. **Landing Page Publik:** Mempertahankan branding, kurikulum, dan informasi sekolah yang sudah ada.
2. **Pendaftaran Awal:** Pengisian data inti santri/orang tua dan penerbitan Nomor Pendaftaran unik serta Kode Akses aman sekali-tampil.
3. **Pembayaran Transfer Manual:** Instruksi transfer resmi Rp300.000 dan upload bukti transfer tanpa payment gateway.
4. **Verifikasi Admin:** Verifikasi pembayaran manual oleh admin sebelum formulir lengkap dapat diakses.
5. **Formulir Lengkap & Upload Dokumen:** Pengisian data santri dan upload berkas persyaratan (berstatus `BLOCKED` menunggu penetapan resmi sekolah).
6. **Notifikasi WhatsApp:** Pembuatan tautan `https://wa.me/...` berisi pesan ter-encode untuk dikirimkan secara manual oleh pendaftar.
7. **Pemeriksaan Status:** Halaman status aman yang memverifikasi nomor pendaftaran dan hash kode akses via backend.
8. **Dashboard Admin:** Pengelolaan antrean pendaftar, verifikasi pembayaran, audit log, dan pengaturan PPDB.

---

## 2. Tech Stack Terkonfirmasi

| Lapisan | Teknologi | Status / Catatan |
|---|---|---|
| **Frontend Framework** | React 19.1 (`react`, `react-dom`) | Terpasang, kompatibel |
| **Language & Tooling** | TypeScript 5.9 (Strict Mode), Vite 7 | Terpasang, strict typing |
| **Styling & Theme** | Tailwind CSS v4 (`@tailwindcss/vite`) | Terpasang, CSS Variables branding aman |
| **UI Component System** | **shadcn/ui** (Style: New York, Base: Neutral) | `components.json` terpasang, aturan murni shadcn |
| **Icons** | Lucide React | Terpasang |
| **Carousel** | Embla Carousel React (`embla-carousel-react`) | Terpasang, digunakan di landing page |
| **Client Routing** | React Router v6 (`react-router-dom`) | Direncanakan (Task 008) |
| **Form & Validasi** | React Hook Form + Zod | Direncanakan (Task 015, 021) |
| **Server State** | TanStack Query (`@tanstack/react-query`) | Direncanakan (Task 008, 018) |
| **Backend & Database** | Supabase (PostgreSQL 15+, Auth, RLS, Storage) | Direncanakan (Task 009–011) |
| **Serverless Logic** | Supabase Edge Functions (Deno / TypeScript) | Direncanakan (Task 013, 014, 017, 019) |
| **Testing** | Vitest + Playwright | Direncanakan (Task 031, 033) |
| **Hosting & Deployment**| Vercel (Frontend SPA) + Supabase Cloud (Backend) | Direncanakan (Task 034, 035) |

---

## 3. Indeks Spesifikasi Teknis (Specs)

Seluruh keputusan arsitektur, keamanan, dan aturan bisnis terdokumentasi dalam direktori `specs/`:

1. [specs/00-project-overview.md](../specs/00-project-overview.md) — Ikhtisar proyek, hasil audit awal, daftar hutang teknis.
2. [specs/01-requirements.md](../specs/01-requirements.md) — Kebutuhan fungsional Tahap A–G, batasan WhatsApp, batasan pembayaran, dan NFR.
3. [specs/02-architecture.md](../specs/02-architecture.md) — Arsitektur sistem, struktur modular `src/features/`, Edge Functions, dan routing.
4. [specs/03-security.md](../specs/03-security.md) — Standar keamanan 8 domain: kode akses CSPRNG + bcrypt, RLS, private storage, secrets.
5. [specs/04-data-model.md](../specs/04-data-model.md) — Skema database PostgreSQL, enum status, generator nomor pendaftaran, dan audit events.
6. [specs/05-business-workflows.md](../specs/05-business-workflows.md) — Diagram alur status, tabel transisi valid & terlarang, alur error, dan template pesan WA.
7. [specs/06-ui-conventions.md](../specs/06-ui-conventions.md) — Aturan kepatuhan shadcn/ui murni, batasan CSS landing page vs aplikasi, route map.
8. [specs/07-testing-strategy.md](../specs/07-testing-strategy.md) — Strategi pengujian berlapis (Unit, RLS, E2E), tools, dan matriks acceptance criteria.
9. [specs/08-deployment.md](../specs/08-deployment.md) — Panduan deploy Vercel + Supabase, `vercel.json` SPA rewrite, mitigasi batas free-tier, go-live checklist.

---

## 4. Master Task Breakdown & Status Pelaksanaan

### Legend Status
- `DONE`: Task telah diverifikasi dan acceptance criteria terpenuhi 100%.
- `IN_PROGRESS`: Sedang dalam pengerjaan aktif.
- `NOT_STARTED`: Siap dikerjakan begitu dependencies terpenuhi.
- `WAITING_FOR_REQUIREMENTS`: Menunggu input / data resmi dari pihak sekolah.
- `BLOCKED`: Terhalang oleh task lain atau requirement yang belum lengkap.

### Tabel Progres Task (36 Task Total)

| Task | Judul Task | Fase | Prioritas | Status | Dependencies |
|:---:|---|:---:|:---:|:---:|---|
| **001** | [Project Audit](task-001-project-audit.md) | Phase 0 | P0 | **DONE** | — |
| **002** | [Specifications Writing](task-002-specifications.md) | Phase 0 | P0 | **DONE** | Task 001 |
| **003** | [Task Planning & Dashboard](task-003-task-planning.md) | Phase 0 | P0 | **DONE** | Task 001, 002 |
| **004** | [Architecture Review & Approval](task-004-architecture-review.md) | Phase 1 | P0 | **DONE** | Task 001–003 |
| **005** | [Database Schema Review & Approval](task-005-database-schema-review.md) | Phase 1 | P0 | **DONE** | Task 002 |
| **006** | [Dependency Cleanup & Import Bug Fix](task-006-dependency-cleanup.md) | Phase 2 | P1 | **DONE** | Task 001 |
| **007** | [Dead Code Removal & TS Fix](task-007-dead-code-removal.md) | Phase 2 | P1 | **DONE** | Task 006 |
| **008** | [Project Restructure & Routing Setup](task-008-project-restructure.md) | Phase 2 | P1 | **DONE** | Task 006, 007 |
| **009** | [Supabase Setup & Local Dev Init](task-009-supabase-setup.md) | Phase 3 | P0 | **DONE** | Task 004, 005, 008 |
| **010** | [Database Migrations](task-010-database-migrations.md) | Phase 3 | P0 | **DONE** | Task 005, 009 |
| **011** | [Row Level Security (RLS) Policies](task-011-rls-policies.md) | Phase 3 | P0 | `NOT_STARTED` | Task 010 |
| **012** | [Admin Authentication & Authorization](task-012-admin-auth.md) | Phase 3 | P0 | `NOT_STARTED` | Task 009, 011 |
| **013** | [Edge Fn: create-registration](task-013-registration-edge-function.md) | Phase 4 | P0 | `NOT_STARTED` | Task 010, 011 |
| **014** | [Edge Fn: verify-registration-access](task-014-verify-access-edge-function.md) | Phase 4 | P0 | `NOT_STARTED` | Task 013 |
| **015** | [Registration UI (Initial Form)](task-015-registration-ui.md) | Phase 4 | P1 | `NOT_STARTED` | Task 008, 013 |
| **016** | [Payment Page UI](task-016-payment-page-ui.md) | Phase 5 | P1 | `NOT_STARTED` | Task 015 |
| **017** | [Edge Fn: submit-payment-proof](task-017-payment-upload-edge-function.md) | Phase 5 | P0 | `NOT_STARTED` | Task 010, 013 |
| **018** | [Admin Payment Dashboard](task-018-admin-payment-dashboard.md) | Phase 5 | P1 | `NOT_STARTED` | Task 012, 017 |
| **019** | [Edge Fn: admin-review-payment](task-019-admin-review-edge-function.md) | Phase 5 | P0 | `NOT_STARTED` | Task 010, 011, 012 |
| **020** | [Form Requirements Confirmation](task-020-form-requirements-confirmation.md) | Phase 6 | P0 | **DONE** | Task 005 |
| **021** | [Form Schema & DB Migration](task-021-form-schema-and-migration.md) | Phase 6 | P1 | `NOT_STARTED` | Task 020, 010 |
| **022** | [Full Form UI & File Upload](task-022-full-form-ui.md) | Phase 6 | P1 | `BLOCKED` | Task 021, 015 |
| **023** | [Edge Fn: document-upload](task-023-document-upload-edge-function.md) | Phase 6 | P0 | `BLOCKED` | Task 021, 010 |
| **024** | [Success Page & WhatsApp Action](task-024-success-page-and-whatsapp.md) | Phase 7 | P1 | `NOT_STARTED` | Task 022 |
| **025** | [Registration Status Page UI](task-025-status-page.md) | Phase 7 | P1 | `NOT_STARTED` | Task 014 |
| **026** | [Admin Dashboard Overview](task-026-admin-dashboard-overview.md) | Phase 8 | P2 | `NOT_STARTED` | Task 012, 018 |
| **027** | [Admin Registrant List & Search](task-027-admin-registrant-list.md) | Phase 8 | P2 | `NOT_STARTED` | Task 026 |
| **028** | [Admin Registrant Detail & Audit](task-028-admin-registrant-detail.md) | Phase 8 | P2 | `NOT_STARTED` | Task 027, 022 |
| **029** | [Admin PPDB Config Management](task-029-admin-ppdb-config.md) | Phase 8 | P2 | `NOT_STARTED` | Task 012 |
| **030** | [Audit Log Viewer UI](task-030-audit-log-ui.md) | Phase 8 | P2 | `NOT_STARTED` | Task 026 |
| **031** | [Unit Testing Setup & Logic Tests](task-031-unit-tests.md) | Phase 9 | P1 | `NOT_STARTED` | Task 013, 014, 022 |
| **032** | [RLS Security Policy Tests](task-032-rls-tests.md) | Phase 9 | P0 | `NOT_STARTED` | Task 011 |
| **033** | [End-to-End Flow Tests](task-033-e2e-tests.md) | Phase 9 | P1 | `NOT_STARTED` | Task 018, 025 |
| **034** | [Production Supabase Setup](task-034-production-supabase.md) | Phase 10 | P0 | `NOT_STARTED` | Task 010–019 |
| **035** | [Vercel Deployment & SPA Routing](task-035-vercel-deployment.md) | Phase 10 | P0 | `NOT_STARTED` | Task 008, 034 |
| **036** | [Go-Live Checklist & Verification](task-036-go-live-checklist.md) | Phase 10 | P0 | `NOT_STARTED` | Task 033, 034, 035 |

---

## 5. Ringkasan Status & Task Siap Eksekusi

### A. Metrik Progres Proyek
- **Total Task:** 36
- **Selesai (`DONE`):** 11 (Task 001–010, Task 020)
- **Siap Dikerjakan (`NOT_STARTED` unblocked):** Task 011 (RLS Policies), Task 021 (Form Schema & Migration)
- **Menunggu Persyaratan (`WAITING_FOR_REQUIREMENTS`):** 0
- **Terblokir (`BLOCKED`):** 2 (Task 022, 023 — menunggu Task 021)
- **Persentase Selesai Nyata:** **30.56%**

### B. Task yang Dapat Langsung Dieksekusi Berikutnya
1. **Task 011:** Row Level Security (RLS) Policies (deny-all by default, service_role & admin policies).
2. **Task 021:** Form Schema & DB Migration (Zod validation + migration for `registration_documents` & `registration_form_data`).
3. **Task 012:** Admin Authentication & Authorization.

### C. Task yang Terblokir & Penyebabnya
- **Task 022, 023 (`BLOCKED`):** Bergantung pada Task 021 (Zod schema dan struktur tabel formulir/dokumen).

---

## 6. Keputusan Arsitektur yang Ditetapkan

1. **Komponen UI Wajib Murni shadcn/ui:**
   - Tidak membuat design system sendiri.
   - Tidak memodifikasi file internal source komponen shadcn/ui.
   - Menggunakan CLI resmi untuk instalasi komponen baru.
   - Landing page mempertahankan warna/font/ornamen via CSS Variables dan utilitas layout tanpa merusak default variant shadcn.
2. **Tidak Menggunakan Server Express/NestJS Terpisah:**
   - Operasi privat dan sensitif ditangani secara eksklusif oleh **Supabase Edge Functions** (Deno/TS).
   - Akses data publik dijaga ketat tanpa ekspos langsung ke database.
3. **Mekanisme Kode Akses Aman (Anti-Data Breach):**
   - Dibuat di server via CSPRNG (8 karakter alfanumerik huruf kapital + angka, entropi ~41 bit).
   - Ditampilkan hanya **satu kali** ke pendaftar saat awal pendaftaran.
   - Disimpan di database dalam bentuk **hash (bcrypt)** pada tabel `registration_access`.
   - Tidak pernah dicatat dalam log server atau plaintext database.
4. **Alur WhatsApp Tanpa API Berbayar:**
   - Menggunakan skema URL murni: `https://wa.me/<nomor>?text=<pesan_terencode>`.
   - Pengguna menekan tombol kirim sendiri dari perangkat mereka.
   - Sistem mencantumkan disclaimer bahwa link WhatsApp bukan bukti konfirmasi pengiriman.
5. **Pembayaran Manual Tanpa Payment Gateway:**
   - Biaya Rp300.000 ditransfer ke rekening resmi sekolah.
   - Pendaftar mengunggah file bukti transfer ke private Supabase storage.
   - Hanya admin terautentikasi yang berhak memverifikasi status pembayaran.
   - Formulir lengkap digembok secara backend sampai pembayaran diverifikasi (`payment_verified`).

---

## 7. Daftar Hal yang Menunggu Keputusan Stakeholder

1. **Detail Rekening Bank Resmi Sekolah:** Nomor rekening, nama bank, dan atas nama pemilik rekening untuk ditampilkan pada halaman pembayaran.
2. **Formulir Pendaftaran Lengkap:** Daftar field data diri santri, data orang tua/wali, riwayat kesehatan, dan kontak darurat.
3. **Dokumen Persyaratan Final:** Format dan ukuran berkas (KK, Akta Kelahiran, Pas Foto, dll.).
4. **Fitur Simpan Draft Formulir:** Apakah orang tua diizinkan menyimpan draf formulir yang belum lengkap, atau harus diisi sekali selesai.
5. **Akun Admin Perdana:** Alamat email admin utama untuk didaftarkan ke Supabase Auth (undangan manual).
6. **Keputusan Paket Supabase & Vercel:** Memastikan batas Free Tier (500MB DB, 1GB Storage Supabase, kuota Edge Function) memadai untuk estimasi kuota pendaftar sekolah.

---

## 8. Perintah Verifikasi Project

Gunakan perintah standar berikut untuk memverifikasi kebersihan dan keabsahan build project:

```bash
# Typecheck ketat TypeScript (harus 0 error)
npx tsc -b --noEmit

# Validasi linter ESLint
npm run lint

# Verifikasi bundle produksi Vite
npm run build

# Menjalankan server pengembangan lokal
npm run dev

# Preview hasil build lokal
npm run preview
```

---

## 9. Log Riwayat Perubahan

- **2026-10-21 (Phase 2):**
  - Task 006 resmi diselesaikan (`DONE`): Pembersihan dependensi (`keen-slider`, `cn`, `radix-ui`), perbaikan impor `cn` ke `@/lib/utils`, dan impor `Slot` ke `@radix-ui/react-slot`.
  - Progres: 6 / 36 Task (**16.67%**).
- **2026-10-21 (Phase 1):**
  - Task 005 resmi diselesaikan (`DONE`): Database Schema Review & Approval tercatat di `specs/04-data-model.md` dan `task/task-005-database-schema-review.md`. Phase 1 selesai.
  - Progres: 5 / 36 Task (**13.89%**).
- **2026-10-20 (Phase 0):**
  - Pelaksanaan audit menyeluruh atas 100% kode existing, dependensi, dan aset.
  - Penulisan 9 dokumen spesifikasi lengkap (`specs/00` s.d. `specs/08`).
  - Pembuatan 36 file task breakdown terstruktur (`task/task-001` s.d. `task/task-036`).
  - Pembuatan dashboard progres utama `task/README.md`.
  - Task 001, 002, 003 resmi diselesaikan (`DONE`). Progres: 8.33%.
