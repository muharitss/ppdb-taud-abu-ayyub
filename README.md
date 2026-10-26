# PPDB TAUD SaQu Abu Ayyub

Sistem Penerimaan Peserta Didik Baru (PPDB) online untuk TAUD SaQu Abu Ayyub. Mencakup landing page profil sekolah, alur pendaftaran santri baru bertahap, konfirmasi pembayaran, upload berkas, pelacakan status, dan dashboard admin untuk verifikasi.

## Fitur Utama

- **Landing Page**: Profil sekolah, standar kelulusan, program kegiatan, dan kontak.
- **Pendaftaran Online**: Alur bertahap (input data awal, formulir santri & wali santri).
- **Pembayaran & Berkas**: Upload bukti transfer serta dokumen pendaftaran (KK & Akta Kelahiran via Cloudinary).
- **Cek Status Pendaftaran**: Fitur pelacakan status seleksi secara mandiri bagi wali santri.
- **Admin Dashboard**: Manajemen pendaftar, verifikasi pembayaran, dan validasi dokumen.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router
- **Backend & Database**: Supabase (Auth/API), PostgreSQL, Prisma ORM
- **Storage**: Cloudinary (dokumen & bukti bayar)

## Struktur Folder

```text
├── prisma/             # Skema database & migrasi
├── public/             # Aset statis (gambar, logo, media)
└── src/
    ├── app/            # Routing & app providers
    ├── components/     # Komponen UI bersama (shadcn/ui)
    ├── features/       # Modul fitur aplikasi
    │   ├── admin/      # Dashboard manajemen & verifikasi
    │   ├── landing/    # Halaman utama informasi sekolah
    │   ├── registration/ # Alur & formulir pendaftaran
    │   ├── payments/   # Konfirmasi & bukti pembayaran
    │   ├── documents/  # Penanganan upload dokumen
    │   └── status/     # Halaman pelacakan status
    └── lib/            # Inisialisasi Supabase, Cloudinary, & utilitas
```

## Setup & Menjalankan Proyek

### 1. Prasyarat
- Node.js 18+
- Database PostgreSQL (atau project Supabase)
- Akun Cloudinary (untuk upload berkas)

### 2. Instalasi
```bash
git clone https://github.com/muharitss/ppdb-taud-abu-ayyub.git
cd ppdb-taud-abu-ayyub
npm install
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` lalu lengkapi nilainya:
```bash
cp .env.example .env
```

Variabel yang dibutuhkan:
- Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Database: `DATABASE_URL` (koneksi PostgreSQL / pooler Supabase)
- Cloudinary: `CLOUDINARY_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_API_KEY`, `VITE_CLOUDINARY_API_SECRET`

### 4. Database Setup
```bash
# Generate client Prisma
npm run db:generate

# Jalankan migrasi schema
npm run db:migrate
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Akses aplikasi melalui `http://localhost:5173`.

## Script Penting

| Script | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server Vite |
| `npm run build` | Generate Prisma client, cek TypeScript, & build production |
| `npm run preview` | Menjalankan preview lokal dari hasil build |
| `npm run db:studio` | Membuka GUI Prisma Studio di browser |
| `npm run db:migrate` | Menjalankan migrasi database di lingkungan dev |
