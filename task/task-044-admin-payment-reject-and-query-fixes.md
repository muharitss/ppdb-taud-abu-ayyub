# Task 044 — Perbaikan Fitur Admin & Keamanan Query (Tombol Tolak Bukti Bayar, Sanitasi Pencarian, Optimasi Statistik, & Parametrisasi Seed SQL)

## Status
NOT_STARTED

## Priority
P0 (Penting — Fungsionalitas Admin, Keamanan Query, & Skalabilitas)

## Dependencies
- Task 028 — Admin Registrant Detail & Audit
- Task 043 — RPC Security & Validation Hardening

## Objective
Memperbaiki 4 masalah pada halaman Admin dan script database:
1. Menambahkan tombol **"Tolak Pembayaran"** beserta dialog alasan penolakan (`RejectDialog`) pada halaman Detail Pendaftar (`AdminRegistrantDetailPage.tsx`).
2. Membersihkan (*sanitize*) input pencarian di `adminRegistrants.ts` agar karakter koma (`,`) atau tanda kurung (`()`) tidak merusak query filter PostgREST Supabase.
3. Mengoptimalkan perhitungan kartu statistik di `adminDashboard.ts` dan `AdminDashboardPage.tsx` agar tidak mengunduh seluruh baris tabel pada setiap ketikan pencarian dan tidak terpotong batas 1.000 baris Supabase.
4. Mengganti penggabungan teks SQL mentah (*string interpolation*) di `prisma/seed.ts` dengan *parameterized query* (`$1, $2, $3`) agar aman dari SQL Injection.

---

## Context & Penjelasan Masalah (Untuk Junior Developer)

### 1. Admin Tidak Bisa Menolak Bukti Pembayaran yang Salah/Buram (`AdminRegistrantDetailPage.tsx`)
Saat ini di halaman `/admin/pendaftar/:id` (`AdminRegistrantDetailPage.tsx`), di bagian Bukti Pembayaran hanya ada satu tombol hijau **"Verifikasi Pembayaran"** (`approved: true`). Tidak ada tombol untuk **menolak bukti pembayaran** (`approved: false`).
Jika orang tua salah mengunggah foto (misalnya foto selfie atau nominal kurang), admin tidak bisa menolak pembayarannya saja agar orang tua mengunggah ulang di halaman `/bayar/:registrationNumber`. Padahal komponen dialog penolakan `src/features/admin/components/RejectDialog.tsx` sudah dibuat tetapi belum dipasang ke `AdminRegistrantDetailPage.tsx`.

### 2. Filter Pencarian Admin Rusak Jika Ada Tanda Koma atau Kurung (`adminRegistrants.ts`)
Pada `src/features/admin/services/adminRegistrants.ts` baris 63–68:
```typescript
const term = `%${search.trim()}%`;
query = query.or(
  `registration_number.ilike.${term},child_name.ilike.${term},parent_name.ilike.${term}`
);
```
Supabase (PostgREST) menggunakan karakter koma `,` dan tanda kurung `()` sebagai pemisah aturan logika di dalam `.or(...)`. Jika admin mengetik nama dengan gelar seperti `Ahmad, S.Pd` di kotak pencarian, Supabase mengira `, S.Pd` adalah nama kolom baru dan mengembalikan error 400 (`Gagal memuat daftar pendaftar`).

### 3. `getDashboardStats` Mengunduh Seluruh Tabel Setiap Kali Pindah Halaman / Cari Nama (`adminDashboard.ts`)
Fungsi `getDashboardStats()` melakukan `SELECT status, payment_status FROM registrations` tanpa batas, lalu menghitung jumlahnya menggunakan `for (const row of rows)` di browser. Selain boros kuota internet karena dipanggil ulang setiap kali admin mengetik di kotak pencarian atau berpindah halaman tabel, Supabase membatasi hasil `SELECT` maksimal **1.000 baris**. Jika total pendaftar lintas tahun ajaran melebihi 1.000 orang, angka di kartu statistik akan macet di 1.000.
Solusinya: Gunakan query `{ count: 'exact', head: true }` dari Supabase (yang hanya mengembalikan angka jumlah baris dari database tanpa mengunduh datanya) dan panggil `loadStats()` hanya saat halaman pertama kali dibuka atau setelah menghapus pendaftar.

### 4. Raw SQL String Interpolation pada `prisma/seed.ts`
Di `prisma/seed.ts` baris 30–93, variabel `email`, `password`, dan `fullName` ditempel langsung ke dalam string SQL menggunakan `` '${password}' ``. Jika password admin mengandung tanda kutip tunggal (`'`), script seed akan error atau mengeksekusi perintah SQL yang tidak diinginkan.

---

## Scope (Daftar Pekerjaan)
1. **Pasang `RejectDialog` dan tombol "Tolak Pembayaran" di `src/features/admin/pages/AdminRegistrantDetailPage.tsx`**.
2. **Sanitasi string pencarian di `src/features/admin/services/adminRegistrants.ts`**.
3. **Ubah `getDashboardStats` di `src/features/admin/services/adminDashboard.ts` menjadi query `count: 'exact', head: true` paralel, dan pisahkan `loadStats()` dari perubahan halaman/pencarian di `src/features/admin/pages/AdminDashboardPage.tsx`**.
4. **Ubah `prisma/seed.ts` agar menggunakan parameterized SQL queries (`$1, $2, $3`)**.

## Out of Scope
- Mengubah desain visual tabel utama di `AdminDashboardPage.tsx`.

---

## Step-by-Step Implementation Guide (Panduan Langkah demi Langkah)

### Langkah 1: Tambahkan Fitur Tolak Bukti Pembayaran di `src/features/admin/pages/AdminRegistrantDetailPage.tsx`

1. Tambahkan import `RejectDialog` di bagian atas file `src/features/admin/pages/AdminRegistrantDetailPage.tsx`:
   ```tsx
   import { RejectDialog } from "../components/RejectDialog";
   ```
2. Di dekat state `const [verifyingPayment, setVerifyingPayment] = useState(false);` (sekitar baris 232), tambahkan state dan handler untuk penolakan bukti pembayaran:
   ```tsx
   const [verifyingPayment, setVerifyingPayment] = useState(false);
   const [rejectPaymentDialogOpen, setRejectPaymentDialogOpen] = useState(false);
   const [rejectingPayment, setRejectingPayment] = useState(false);

   const handleRejectPayment = async (notes: string) => {
     const latestPmt = data?.payments?.[0];
     if (!latestPmt || !data) return;

     setRejectingPayment(true);
     try {
       await reviewPayment({
         payment_id: latestPmt.id,
         approved: false,
         review_notes: notes,
       });

       toast.success(
         `Bukti pembayaran ${data.registration.registration_number} ditolak. Pendaftar dapat mengunggah ulang bukti baru.`
       );
       setRejectPaymentDialogOpen(false);
       fetchDetail();
     } catch (err: unknown) {
       toast.error(
         err instanceof Error ? err.message : "Gagal menolak bukti pembayaran"
       );
     } finally {
       setRejectingPayment(false);
     }
   };
   ```
3. Pada bagian render Bukti Pembayaran (baik untuk tampilan PDF di sekitar baris 828 maupun tampilan Gambar di sekitar baris 882), ketika `registration.payment_status === "payment_submitted"`, tampilkan tombol **Tolak Bukti** di samping tombol **Verifikasi Pembayaran**:
   ```tsx
   {registration.payment_status !== "payment_verified" ? (
     <div className="flex flex-wrap items-center gap-2">
       <Button
         size="sm"
         onClick={handleVerifyPayment}
         disabled={verifyingPayment || rejectingPayment}
         className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-medium shadow-xs"
       >
         {verifyingPayment ? (
           <>
             <Loader2 className="w-3.5 h-3.5 animate-spin" />
             Memverifikasi...
           </>
         ) : (
           <>
             <CheckCircle2 className="w-3.5 h-3.5" />
             Verifikasi Pembayaran
           </>
         )}
       </Button>
       {latestPayment.status === "payment_submitted" && (
         <Button
           size="sm"
           variant="outline"
           onClick={() => setRejectPaymentDialogOpen(true)}
           disabled={verifyingPayment || rejectingPayment}
           className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 font-medium"
         >
           <XCircle className="w-3.5 h-3.5" />
           Tolak Bukti Bayar
         </Button>
       )}
     </div>
   ) : (
     <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
       Pembayaran Terverifikasi
     </div>
   )}
   ```
4. Di bagian paling bawah JSX dalam `AdminRegistrantDetailPage.tsx` (sebelum tag penutup `</div>` utama), pasang komponen `<RejectDialog />`:
   ```tsx
   <RejectDialog
     isOpen={rejectPaymentDialogOpen}
     onClose={() => setRejectPaymentDialogOpen(false)}
     onConfirm={handleRejectPayment}
     isSubmitting={rejectingPayment}
     registrationNumber={registration.registration_number}
   />
   ```

---

### Langkah 2: Sanitasi Input Pencarian di `src/features/admin/services/adminRegistrants.ts`
Buka `src/features/admin/services/adminRegistrants.ts` pada baris 63–68, lalu bersihkan karakter sintaks PostgREST (koma, tanda kurung, kutip, backslash) sebelum dimasukkan ke `.or(...)`:

```typescript
  if (search && search.trim()) {
    const cleanSearch = search.trim().replace(/[,()"\\]/g, "");
    if (cleanSearch) {
      const term = `%${cleanSearch}%`;
      query = query.or(
        `registration_number.ilike.${term},child_name.ilike.${term},parent_name.ilike.${term}`
      );
    }
  }
```

---

### Langkah 3: Optimasi `getDashboardStats` di `src/features/admin/services/adminDashboard.ts` dan `AdminDashboardPage.tsx`

1. Buka `src/features/admin/services/adminDashboard.ts` dan ubah fungsi `getDashboardStats()` agar menghitung jumlah baris langsung di database menggunakan `{ count: 'exact', head: true }`:

```typescript
export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalRes,
    paymentSubmittedRes,
    awaitingFormRes,
    submittedRes,
    acceptedRes,
    rejectedRes,
  ] = await Promise.all([
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'payment_submitted'),
    supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'awaiting_form'),
    supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'under_review']),
    supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted'),
    supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected'),
  ]);

  if (totalRes.error) {
    throw new Error('Gagal memuat statistik pendaftaran: ' + totalRes.error.message);
  }

  return {
    total: totalRes.count ?? 0,
    paymentSubmitted: paymentSubmittedRes.count ?? 0,
    awaitingForm: awaitingFormRes.count ?? 0,
    submitted: submittedRes.count ?? 0,
    accepted: acceptedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
  };
}
```

2. Buka `src/features/admin/pages/AdminDashboardPage.tsx` (sekitar baris 190–255):
   - Panggil `loadStats()` di dalam `useEffect` terpisah saat pertama kali halaman dimuat, dan panggil `loadStats()` kembali di dalam `handleDeleteConfirm` setelah pendaftar dihapus (sehingga mengetik di kolom pencarian atau berpindah halaman tabel tidak memicu 6 query statistik berulang kali):
   ```tsx
   useEffect(() => {
     loadStats();
   }, [loadStats]);

   const fetchData = useCallback(async () => {
     setLoading(true);
     setError(null);

     try {
       const registrantsRes = await getRegistrants({
         status: statusFilter,
         search: activeSearch,
         page,
         pageSize,
       });
       setData(registrantsRes);
     } catch (err: unknown) {
       setError(
         err instanceof Error ? err.message : "Gagal memuat data pendaftar",
       );
     } finally {
       setLoading(false);
     }
   }, [statusFilter, activeSearch, page]);
   ```
   Dan di dalam `handleDeleteConfirm`, panggil `loadStats()` setelah `deleteRegistrant(deletingItem.id)` berhasil.

---

### Langkah 4: Gunakan Parameterized Queries di `prisma/seed.ts`
Ganti isi `prisma/seed.ts` agar menggunakan parameter `$1, $2, $3` (bukan `${email}` atau `${password}` di dalam string SQL):

```typescript
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@taud-abu-ayyub.sch.id';
const password = process.env.INITIAL_ADMIN_PASSWORD || 'AdminPassword2026!';
const fullName = process.env.INITIAL_ADMIN_NAME || 'Administrator PPDB TAUD Abu Ayyub';

if (!process.env.DATABASE_URL) {
  console.error('[PPDB Seed] DATABASE_URL is missing in environment variables.');
  process.exit(1);
}

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log(`[PPDB Seed] Connecting to database to ensure admin (${email})...`);

  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (existing.rowCount === 0) {
      const userInsert = await client.query<{ id: string }>(
        `INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          recovery_sent_at,
          last_sign_in_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          email_change,
          email_change_token_new,
          recovery_token
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf', 10)),
          now(),
          now(),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('full_name', $3::text),
          now(),
          now(),
          '',
          '',
          '',
          ''
        ) RETURNING id`,
        [email, password, fullName]
      );

      const newUserId = userInsert.rows[0].id;

      await client.query(
        `INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          $1::uuid,
          jsonb_build_object('sub', $1::text, 'email', $2::text),
          'email',
          $1::text,
          now(),
          now(),
          now()
        )`,
        [newUserId, email]
      );

      await client.query(
        `INSERT INTO public.admin_profiles (id, full_name, role, created_at)
         VALUES ($1::uuid, $2::text, 'admin', now())
         ON CONFLICT (id) DO NOTHING`,
        [newUserId, fullName]
      );
    }

    await client.query('COMMIT');

    const res = await client.query(
      'SELECT u.id, u.email, p.full_name, p.role FROM auth.users u JOIN public.admin_profiles p ON u.id = p.id WHERE u.email = $1',
      [email]
    );

    console.log('[PPDB Seed] Admin user ready:', res.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[PPDB Seed] Error running seed:', err);
  process.exit(1);
});
```

---

## Files Expected to Change
- `src/features/admin/pages/AdminRegistrantDetailPage.tsx`
- `src/features/admin/services/adminRegistrants.ts`
- `src/features/admin/services/adminDashboard.ts`
- `src/features/admin/pages/AdminDashboardPage.tsx`
- `prisma/seed.ts`

## Acceptance Criteria
- [ ] Pada halaman Detail Pendaftar (`/admin/pendaftar/:id`), terdapat tombol **"Tolak Bukti Bayar"** saat status pembayaran `payment_submitted` yang membuka modal `RejectDialog` dan memanggil `reviewPayment({ payment_id, approved: false, review_notes })`.
- [ ] Mengetik karakter koma `,` atau tanda kurung `()` pada kotak pencarian di Dashboard Admin tidak menimbulkan error query.
- [ ] `getDashboardStats()` menggunakan `{ count: 'exact', head: true }` dan tidak lagi dipanggil ulang pada setiap ketikan pencarian atau perpindahan halaman tabel.
- [ ] `prisma/seed.ts` menggunakan *parameterized queries* (`$1, $2, $3`) tanpa string interpolation variabel ke dalam SQL.
- [ ] `npx tsc -b --noEmit`, `npm run lint`, dan `npm run build` berjalan sukses dengan 0 error.

## Verification Commands
```bash
npx tsc -b --noEmit
npm run lint
npm run build
```
