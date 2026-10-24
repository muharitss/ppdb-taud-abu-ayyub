# PPDB TAUD Abu Ayyub — Task Dashboard & Project Tracker

> **Pendekatan:** Spec-Driven Development (SDD)  
> **Status:** Phase 6, Phase 7, Phase 8, & Phase 11 Selesai 100% (Form Schema, DB Migration, Edge Functions, Wizard Refactor, Success & Status Pages, Admin Suite Tuntas), Phase 9 (Testing) Siap Aktif  
> **Progres Akurat:** 34 / 40 Task Selesai (**85.00%**)

---

## 1. Ringkasan Proyek & Tujuan Aplikasi

Aplikasi **PPDB TAUD Abu Ayyub** adalah sistem Penerimaan Peserta Didik Baru berbasis web untuk **TAUD SaQu Abu Ayyub** (Tahun Pelajaran 2027/2028) di Duri, Mandau, Bengkalis, Riau.

Sistem bertransformasi dari landing page statis menjadi aplikasi web terintegrasi yang mencakup:

1. **Landing Page Publik:** Mempertahankan branding, kurikulum, dan informasi sekolah yang sudah ada.
2. **Pendaftaran Awal:** Pengisian data inti siswa/orang tua dan penerbitan Nomor Pendaftaran unik serta Kode Akses aman sekali-tampil.
3. **Pembayaran Transfer Manual & Bantuan Admin:** Instruksi transfer resmi Rp300.000, akses langsung ke nomor WhatsApp Admin untuk bantuan & pertanyaan, dan upload foto bukti transfer tanpa payment gateway.
4. **Akses Langsung Formulir Lengkap & Upload Dokumen:** Begitu pendaftar mengunggah foto bukti pembayaran (`payment_submitted`), status pendaftaran langsung menjadi `awaiting_form` sehingga pendaftar dapat langsung mengisi formulir lengkap serta mengunggah foto **Kartu Keluarga (KK)** dan **Akte Kelahiran** (tanpa perlu menunggu verifikasi admin terlebih dahulu).
5. **Verifikasi Admin:** Verifikasi bukti pembayaran dan berkas pendaftaran oleh admin melalui dashboard.
6. **Notifikasi WhatsApp:** Pembuatan tautan `https://wa.me/...` berisi pesan ter-encode untuk dikirimkan secara manual oleh pendaftar.
7. **Pemeriksaan Status:** Halaman status aman yang memverifikasi nomor pendaftaran dan hash kode akses via backend.
8. **Dashboard Admin:** Pengelolaan antrean pendaftar, verifikasi pembayaran, audit log, dan pengaturan PPDB.

---

## 2. Tech Stack Terkonfirmasi

| Lapisan                  | Teknologi                                        | Status / Catatan                                         |
| ------------------------ | ------------------------------------------------ | -------------------------------------------------------- |
| **Frontend Framework**   | React 19.1 (`react`, `react-dom`)                | Terpasang, kompatibel                                    |
| **Language & Tooling**   | TypeScript 5.9 (Strict Mode), Vite 7             | Terpasang, strict typing                                 |
| **Styling & Theme**      | Tailwind CSS v4 (`@tailwindcss/vite`)            | Terpasang, CSS Variables branding aman                   |
| **UI Component System**  | **shadcn/ui** (Style: New York, Base: Neutral)   | `components.json` terpasang, aturan murni shadcn         |
| **Icons**                | Lucide React                                     | Terpasang                                                |
| **Carousel**             | Embla Carousel React (`embla-carousel-react`)    | Terpasang, digunakan di landing page                     |
| **Client Routing**       | React Router v6 (`react-router-dom`)             | Direncanakan (Task 008)                                  |
| **Form & Validasi**      | React Hook Form + Zod                            | Direncanakan (Task 015, 021)                             |
| **Server State**         | TanStack Query (`@tanstack/react-query`)         | Direncanakan (Task 008, 018)                             |
| **Backend & Database**   | Supabase (PostgreSQL 15+, Auth, RLS, Storage)    | Terpasang (Task 009–011)                                 |
| **ORM & Migrations**     | Prisma 7 (`prisma`, `@prisma/client`)            | Terpasang (`prisma/schema.prisma`, `prisma/migrations/`) |
| **Serverless Logic**     | Supabase Edge Functions (Deno / TypeScript)      | Direncanakan (Task 013, 014, 017, 019)                   |
| **Testing**              | Vitest + Playwright                              | Direncanakan (Task 031, 033)                             |
| **Hosting & Deployment** | Vercel (Frontend SPA) + Supabase Cloud (Backend) | Direncanakan (Task 034, 035)                             |

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

|  Task   | Judul Task                                                                                     |   Fase   | Prioritas |    Status     | Dependencies       |
| :-----: | ---------------------------------------------------------------------------------------------- | :------: | :-------: | :-----------: | ------------------ |
| **001** | [Project Audit](task-001-project-audit.md)                                                     | Phase 0  |    P0     |   **DONE**    | —                  |
| **002** | [Specifications Writing](task-002-specifications.md)                                           | Phase 0  |    P0     |   **DONE**    | Task 001           |
| **003** | [Task Planning & Dashboard](task-003-task-planning.md)                                         | Phase 0  |    P0     |   **DONE**    | Task 001, 002      |
| **004** | [Architecture Review & Approval](task-004-architecture-review.md)                              | Phase 1  |    P0     |   **DONE**    | Task 001–003       |
| **005** | [Database Schema Review & Approval](task-005-database-schema-review.md)                        | Phase 1  |    P0     |   **DONE**    | Task 002           |
| **006** | [Dependency Cleanup & Import Bug Fix](task-006-dependency-cleanup.md)                          | Phase 2  |    P1     |   **DONE**    | Task 001           |
| **007** | [Dead Code Removal & TS Fix](task-007-dead-code-removal.md)                                    | Phase 2  |    P1     |   **DONE**    | Task 006           |
| **008** | [Project Restructure & Routing Setup](task-008-project-restructure.md)                         | Phase 2  |    P1     |   **DONE**    | Task 006, 007      |
| **009** | [Supabase Setup & Local Dev Init](task-009-supabase-setup.md)                                  | Phase 3  |    P0     |   **DONE**    | Task 004, 005, 008 |
| **010** | [Database Migrations](task-010-database-migrations.md)                                         | Phase 3  |    P0     |   **DONE**    | Task 005, 009      |
| **011** | [Row Level Security (RLS) Policies](task-011-rls-policies.md)                                  | Phase 3  |    P0     |   **DONE**    | Task 010           |
| **012** | [Admin Authentication & Authorization](task-012-admin-auth.md)                                 | Phase 3  |    P0     |   **DONE**    | Task 009, 011      |
| **013** | [Edge Fn: create-registration](task-013-registration-edge-function.md)                         | Phase 4  |    P0     |   **DONE**    | Task 010, 011      |
| **014** | [Edge Fn: verify-registration-access](task-014-verify-access-edge-function.md)                 | Phase 4  |    P0     |   **DONE**    | Task 013           |
| **015** | [Registration UI (Initial Form)](task-015-registration-ui.md)                                  | Phase 4  |    P1     |   **DONE**    | Task 008, 013      |
| **016** | [Payment Page UI](task-016-payment-page-ui.md)                                                 | Phase 5  |    P1     |   **DONE**    | Task 015           |
| **017** | [Edge Fn: submit-payment-proof](task-017-payment-upload-edge-function.md)                      | Phase 5  |    P0     |   **DONE**    | Task 010, 013      |
| **018** | [Admin Payment Dashboard](task-018-admin-payment-dashboard.md)                                 | Phase 5  |    P1     |   **DONE**    | Task 012, 017      |
| **019** | [Edge Fn: admin-review-payment](task-019-admin-review-edge-function.md)                        | Phase 5  |    P0     |   **DONE**    | Task 010, 011, 012 |
| **020** | [Form Requirements Confirmation](task-020-form-requirements-confirmation.md)                   | Phase 6  |    P0     |   **DONE**    | Task 005           |
| **021** | [Form Schema & DB Migration](task-021-form-schema-and-migration.md)                            | Phase 6  |    P1     |   **DONE**    | Task 020, 010      |
| **022** | [Full Form UI & File Upload](task-022-full-form-ui.md)                                         | Phase 6  |    P1     |   **DONE**    | Task 021, 015      |
| **023** | [Edge Fn: document-upload](task-023-document-upload-edge-function.md)                          | Phase 6  |    P0     |   **DONE**    | Task 021, 010      |
| **024** | [Success Page & WhatsApp Action](task-024-success-page-and-whatsapp.md)                        | Phase 7  |    P1     |   **DONE**    | Task 022           |
| **025** | [Registration Status Page UI](task-025-status-page.md)                                         | Phase 7  |    P1     |   **DONE**    | Task 014           |
| **026** | [Admin Dashboard Overview](task-026-admin-dashboard-overview.md)                               | Phase 8  |    P2     |   **DONE**    | Task 012, 018      |
| **027** | [Admin Registrant List & Search](task-027-admin-registrant-list.md)                            | Phase 8  |    P2     |   **DONE**    | Task 026           |
| **028** | [Admin Registrant Detail & Audit](task-028-admin-registrant-detail.md)                         | Phase 8  |    P2     |   **DONE**    | Task 027, 022      |
| **029** | [Admin PPDB Config Management](task-029-admin-ppdb-config.md)                                  | Phase 8  |    P2     |   **DONE**    | Task 012           |
| **030** | [Audit Log Viewer UI](task-030-audit-log-ui.md)                                                | Phase 8  |    P2     |   **DONE**    | Task 026           |
| **031** | [Unit Testing Setup & Logic Tests](task-031-unit-tests.md)                                     | Phase 9  |    P1     | `NOT_STARTED` | Task 013, 014, 022 |
| **032** | [RLS Security Policy Tests](task-032-rls-tests.md)                                             | Phase 9  |    P0     | `NOT_STARTED` | Task 011           |
| **033** | [End-to-End Flow Tests](task-033-e2e-tests.md)                                                 | Phase 9  |    P1     | `NOT_STARTED` | Task 018, 025      |
| **034** | [Production Supabase Setup](task-034-production-supabase.md)                                   | Phase 10 |    P0     | `NOT_STARTED` | Task 010–019       |
| **035** | [Vercel Deployment & SPA Routing](task-035-vercel-deployment.md)                               | Phase 10 |    P0     | `NOT_STARTED` | Task 008, 034      |
| **036** | [Go-Live Checklist & Verification](task-036-go-live-checklist.md)                              | Phase 10 |    P0     | `NOT_STARTED` | Task 033, 034, 035 |
| **037** | [Landing Page CTA & Navigation Routing Fix](task-037-landing-cta-and-navigation-fix.md)        | Phase 11 |    P1     |   **DONE**    | Task 015, 022      |
| **038** | [Bank Information & Contact Consistency](task-038-bank-info-and-contact-consistency.md)        | Phase 11 |    P0     |   **DONE**    | Task 016, 020      |
| **039** | [Access Code Session Retention & Anti-Lockout](task-039-access-code-session-retention.md)      | Phase 11 |    P1     |   **DONE**    | Task 015, 016, 022 |
| **040** | [Full Form Wizard Simplification & Component Refactor](task-040-form-wizard-simplification.md) | Phase 11 |    P2     |   **DONE**    | Task 021, 022      |

---

## 5. Ringkasan Status & Task Siap Eksekusi

### A. Metrik Progres Proyek

- **Total Task:** 40
- **Selesai (`DONE`):** 34 (Task 001–030, Task 037–040)
- **Siap Dikerjakan (`NOT_STARTED` unblocked):** Task 031, Task 032, Task 033
- **Menunggu Persyaratan (`WAITING_FOR_REQUIREMENTS`):** 0
- **Terblokir (`BLOCKED`):** 0
- **Persentase Selesai Nyata:** **85.00%**

### B. Task yang Dapat Langsung Dieksekusi Berikutnya

1. **Task 031:** Unit Testing Setup & Logic Tests (Vitest untuk Edge Functions & Form Schemas).
2. **Task 032:** RLS Security Policy Tests (verifikasi RLS database PostgreSQL).
3. **Task 033:** End-to-End Flow Tests (pengujian alur pendaftaran s.d. dashboard admin).

### C. Task yang Terblokir & Penyebabnya

- _Tidak ada task yang terblokir saat ini._ Seluruh dependency Phase 6 telah terpenuhi.

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
5. **Pembayaran Manual Tanpa Payment Gateway (Alur Langsung):**
   - Biaya Rp300.000 ditransfer ke rekening resmi sekolah, disertai akses ke nomor WhatsApp Admin untuk bantuan dan pertanyaan.
   - Pendaftar mengunggah foto bukti pembayaran ke private Supabase storage.
   - Begitu bukti pembayaran diunggah (`payment_submitted`), pendaftar **langsung dapat mengakses dan mengisi formulir pendaftaran** (`status = awaiting_form`) beserta upload foto Kartu Keluarga dan Akte Kelahiran.
   - Admin terautentikasi memverifikasi status pembayaran melalui dashboard secara paralel.

---

## 7. Daftar Hal yang Menunggu Keputusan Stakeholder

1. **Detail Rekening Bank Resmi Sekolah:** Nomor rekening, nama bank, dan atas nama pemilik rekening untuk ditampilkan pada halaman pembayaran.
2. **Formulir Pendaftaran Lengkap:** Daftar field data diri siswa, data orang tua/wali, riwayat kesehatan, dan kontak darurat.
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

- **2026-10-24 (Phase 8 — Admin Suite Tuntas 100%):**
  - Penyelesaian komprehensif seluruh 5 task Phase 8 (Task 026, Task 027, Task 028, Task 029, Task 030):
    - **Task 026 (Admin Dashboard Overview `/admin`):** Metrik ringkasan kartu statistik (total pendaftar, antrean pembayaran, menunggu formulir, formulir masuk, diterima, ditolak), banner peringatan verifikasi pembayaran aktif, auto-refresh 30 detik tanpa dependensi eksternal berlebih, 10 aktivitas jejak audit terkini, dan top navigation bar portal admin.
    - **Task 027 (Admin Registrant List & Search `/admin/pendaftar`):** Tabel daftar seluruh pendaftar dengan debounced search, filter status pendaftaran (tersinkronisasi query params URL), database-level pagination, badge status, tautan kontak WhatsApp, dan tombol navigasi detail pendaftar.
    - **Task 028 (Admin Registrant Detail & Audit `/admin/pendaftar/:id`):** Tampilan lengkap data formulir siswa & orang tua (read-only), berkas persyaratan (Kartu Keluarga & Akte Kelahiran) dengan short-lived signed URLs (gambar & PDF), alur verifikasi keputusan status (Terima, Tolak dengan catatan wajib, Tandai Sedang Ditinjau), riwayat pembayaran, serta jejak audit spesifik pendaftar.
    - **Task 029 (Admin PPDB Config Management `/admin/pengaturan`):** Pengelolaan terintegrasi status buka/tutup pendaftaran, tahun ajaran, rentang tanggal pendaftaran, biaya registrasi, rekening bank resmi, dan kontak WhatsApp admin dengan audit logging.
    - **Task 030 (Audit Log Viewer UI `/admin/audit`):** Tabel pencatatan audit keamanan sistem komprehensif dengan filter tipe aksi (12 jenis event), filter rentang tanggal kalender, tautan entitas ke detail pendaftar, dan database-level pagination.
  - Progres: 34 / 40 Task (**85.00%**). Phase 8 resmi tuntas 100%.

- **2026-10-24 (Phase 7 & Phase 11 Tuntas 100%):**
  - Penyelesaian komprehensif 6 task berturut-turut (Task 037, Task 038, Task 039, Task 040, Task 024, Task 025):
    - **Task 037 (Landing Page CTA & Navigation Fix):** Mengarahkan tombol CTA Hero, Navbar, dan Syarat Pendaftaran langsung ke route internal `/daftar`, mengaktifkan navbar button, dan menghapus dead code file `DocumentUploadPage.tsx`.
    - **Task 038 (Bank Info & Contact Consistency):** Sentralisasi konfigurasi perbankan & kontak admin di `src/config/schoolInfo.ts`. Menegaskan rekening resmi tunggal BSI 7216959997 a.n. TAUD SaQu Abu Ayyub serta sinkronisasi kontak WhatsApp admin across specs and code.
    - **Task 039 (Access Code Session Retention & Anti-Lockout):** Pembuatan helper `src/lib/sessionCredentials.ts` dengan penyimpanan aman scoped pada browser tab `sessionStorage`. Menjaga calon pendaftar agar tidak terkunci saat berpindah aplikasi m-banking atau me-reload halaman ponsel. Dilengkapi tombol recovery WhatsApp admin.
    - **Task 040 (Full Form Wizard Simplification):** Ekstraksi komponen bersama `ParentFormSection.tsx` (Data Ayah & Data Ibu), memotong 226 baris kode duplikasi di `FullFormWizard.tsx`, serta menambahkan deteksi otomatis langkah aktif wizard dari draf tersimpan.
    - **Task 024 (Success Page & WhatsApp Action):** Pembuatan halaman `/daftar/berhasil` (`SuccessPage.tsx`) dengan pre-filled template pesan WhatsApp `wa.me`, tautan bergabung grup resmi WhatsApp PPDB, dan tombol salin informasi pendaftaran ke clipboard.
    - **Task 025 (Registration Status Page UI):** Pembuatan halaman `/status` (`StatusPage.tsx`) dan `StatusDisplay.tsx` terintegrasi dengan Edge Function `verify-registration-access`. Menampilkan status pendaftaran & pembayaran human-readable bahasa Indonesia, penanganan error opaque anti-timing attack, rate limit 429 friendly handling, dan tombol aksi tindak lanjut (pembayaran / formulir).
  - Progres: 29 / 40 Task (**72.50%**). Phase 7 dan Phase 11 tuntas 100%.

- **2026-10-23 (Refactor Logic Pendaftaran Simplified & Phase 6 Selesai):**
  - Penyederhanaan alur pendaftaran di seluruh spesifikasi (`specs/`), daftar task (`task/`), Edge Functions, dan UI:
    - Alur pembayaran menampilkan keterangan transfer ke nomor rekening, akses ke nomor WhatsApp admin untuk bantuan/pertanyaan, dan upload foto bukti pembayaran -> langsung membuka akses halaman formulir (`status = awaiting_form` saat `submit-payment-proof`, tanpa menunggu verifikasi admin).
    - Halaman formulir lengkap (`/daftar/formulir`) memiliki tambahan upload foto **Kartu Keluarga (KK)** dan **Akte Kelahiran** (`kartu_keluarga`, `akte_kelahiran`).
  - Task 022 & 023 resmi diselesaikan (`DONE`):
    - **Task 023 (Edge Function `document-upload` & `submit-full-form`):** Endpoint Deno untuk upload berkas dokumen persyaratan (Kartu Keluarga dan Akte Kelahiran) dengan validasi magic bytes (JPEG/PNG/PDF), batas 5MB, timing-attack protection bcrypt, penyimpanan ke private storage bucket `registration-documents`, upsert ke tabel `registration_documents`, dan pencatatan audit log `audit_events`. Serta Edge function `submit-full-form` untuk query status draf formulir (`get`), simpan kemajuan draf (`save_draft`), dan validasi final lengkap serta perubahan status ke `submitted`.
    - **Task 022 (Full Form UI & File Upload `/daftar/formulir`):** Halaman formulir pendaftaran lengkap yang langsung dapat diakses setelah upload bukti pembayaran (`payment_submitted` atau `payment_verified`). Dilengkapi gating instruksi pembayaran + bantuan admin WA + upload bukti pembayaran inline jika `payment_pending`. Wizard 5 langkah (Calon Siswa, Data Ayah, Data Ibu, Kesehatan, Upload Foto KK & Akte Kelahiran) dengan validasi Zod bertahap, auto-save draf setiap langkah, dan tombol tautan bergabung ke grup resmi WhatsApp PPDB. Phase 6 tuntas 100%.
  - Progres: 23 / 36 Task (**63.89%**).
- **2026-10-23 (Phase 6 Dimulai):**
  - Task 021 resmi diselesaikan (`DONE`):
    - **Task 021 (Form Schema & DB Migration):** Zod schema validasi formulir lengkap di `src/features/registration/schemas/formSchema.ts` mencakup 4 sub-skema (`childSchema`, `fatherSchema`, `motherSchema`, `healthSchema`) dengan normalisasi dan validasi NIK 16 digit, format tanggal ISO-8601, sanitasi string opsional lewat preprocess, serta skema `documentTypeSchema` (`kartu_keluarga`, `akte_kelahiran`, `pas_foto`). Penambahan enum `DocumentType`, relasi, model `RegistrationDocument` dan `RegistrationFormData` pada `prisma/schema.prisma`. Pembuatan migrasi PostgreSQL `20261023000300_registration_form_and_documents` lengkap dengan constraint unik, index, trigger auto-update `updated_at`, dan RLS policy admin SELECT. Task 022 (`Full Form UI`) dan Task 023 (`Edge Fn: document-upload`) resmi terbuka (`UNBLOCKED`).
  - Progres: 21 / 36 Task (**58.33%**).
- **2026-10-23 (Phase 5 Selesai):**
  - Task 018 & 019 resmi diselesaikan (`DONE`):
    - **Task 019 (Edge Function `admin-review-payment` & RPC `fn_review_payment`):** Endpoint Deno dan PostgreSQL RPC function atomic dengan row lock (`FOR UPDATE`), verifikasi role admin via `admin_profiles`, pencegahan double-review (409 Conflict), validasi catatan wajib saat penolakan (400 Bad Request), update status `payments` dan `registrations`, serta pencatatan audit log `audit_events`.
    - **Task 018 (Admin Payment Dashboard `/admin` & `/admin/pendaftar/:id`):** Antrean verifikasi pembayaran pendaftar dengan komponen shadcn `Table`, `Badge`, `Dialog`, `Textarea`, dan `Button`. Pratinjau berkas bukti transfer gambar dan dokumen PDF via short-lived signed URL Supabase Storage (1 jam), alur persetujuan instan, dialog modal penolakan dengan input alasan wajib, integrasi toast Sonner, dan pembaruan metrik ringkasan dashboard pendaftar. Phase 5 tuntas 100%.
  - Progres: 20 / 36 Task (**55.56%**).
- **2026-10-23 (Phase 5):**
  - Task 016 & 017 resmi diselesaikan (`DONE`):
    - **Task 017 (Edge Function `submit-payment-proof`):** Endpoint Deno untuk upload bukti transfer dengan validasi magic bytes berkas (JPEG, PNG, PDF), batas ukuran 5MB, verifikasi hash kode akses dengan proteksi timing attack (dummy bcrypt hash), pencegahan double-submission (409 Conflict), penyimpanan ke private storage bucket `payment-proofs`, insert ke tabel `payments`, update `payment_status` ke `payment_submitted`, dan pencatatan audit log `audit_events`.
    - **Task 016 (Payment Page UI `/daftar/pembayaran` & `/bayar/:registrationNumber`):** Tampilan instruksi transfer bank resmi (BSI 7216959997 a.n TAUD SaQu Abu Ayyub) dengan tombol salin nomor rekening dan nominal Rp300.000, komponen upload bukti drag-and-drop dengan validasi client-side, pratinjau thumbnail gambar / info PDF, penanganan error ramah pengguna, integrasi API ke Edge Function `submit-payment-proof`, serta layar konfirmasi sukses yang mengarahkan ke halaman status dan tombol WhatsApp konfirmasi admin.
  - Progres: 18 / 36 Task (**50.00%**).
- **2026-10-23 (Phase 4):**
  - Task 015 resmi diselesaikan (`DONE`): Registration UI (`/daftar`). Implementasi formulir pendaftaran awal siswa (nama calon siswa, nama orang tua/wali, nomor WhatsApp Indonesia), validasi Zod + React Hook Form + shadcn Form primitive, integrasi Sonner toast, penanganan error humanis bahasa Indonesia, tampilan nomor pendaftaran & kode akses sekali-tampil dengan tombol salin (clipboard API), peringatan tegas anti-data breach, dan passing `access_code` secara strictly in-memory lewat React Router state menuju alur pembayaran tanpa disimpan di `localStorage`/`sessionStorage`. Phase 4 tuntas.
  - Progres: 16 / 36 Task (**44.44%**).
  - Task 014 resmi diselesaikan (`DONE`): Edge Function `verify-registration-access`. Implementasi endpoint Deno dengan rate limiting (maksimal 5 percobaan gagal per 15 menit), penanganan anti-enumeration lewat error opaque seragam (`Nomor pendaftaran atau kode akses tidak sesuai`), mitigasi timing side-channel via dummy bcrypt comparison untuk pendaftar tidak ditemukan, verifikasi hash bcrypt kode akses ke tabel `registration_access`, reset counter kegagalan saat sukses lewat `audit_events`, serta whitelist ketat field respons status pendaftar (tanpa mengekspos data pribadi/rahasia).
  - Progres: 15 / 36 Task (**41.67%**).
  - Task 013 resmi diselesaikan (`DONE`): Edge Function `create-registration`. Implementasi endpoint Deno dengan validasi input, normalisasi nomor WhatsApp Indonesia, pengecekan status buka/tutup PPDB (`ppdb_config`), generator nomor pendaftaran atomic via DB sequence RPC / collision retry fallback, pembuatan kode akses 8 karakter alfanumerik CSPRNG (tanpa karakter ambigu `0, O, 1, I`), hashing bcrypt ke tabel `registration_access`, rollback otomatis jika terjadi kegagalan, dan logging audit event.
- **2026-10-23 (Phase 3):**
  - Task 012 resmi diselesaikan (`DONE`): Admin Authentication & Authorization. Implementasi `useAdminAuth`, login form anti-enumeration di `/admin/login`, route protection dan role guard berbasis query `admin_profiles`, serta session logout. Phase 3 tuntas.
  - Progres: 13 / 36 Task (**36.11%**).
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
