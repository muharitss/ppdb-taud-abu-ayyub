# Task 043 — Pengamanan & Perbaikan Fungsi RPC Database PostgreSQL (Admin Guard, Rate Limit, Validasi Pembayaran & Form, Atomic Registration)

## Status
DONE

## Priority
P0 (Kritis — Keamanan & Integritas Data)

## Dependencies
- Task 010 — Database Migrations
- Task 011 — Row Level Security (RLS) Policies
- Task 041 — Combined Registration & Payment Flow

## Objective
Menutup celah keamanan dan bug logika bisnis pada fungsi-fungsi RPC (*Remote Procedure Call* — fungsi SQL di PostgreSQL yang dipanggil langsung dari browser via `supabase.rpc(...)`):
1. Menambahkan pengecekan `public.is_admin()` pada `fn_review_payment` agar pengguna biasa tidak bisa menyetujui pembayarannya sendiri.
2. Menambahkan pembatasan percobaan gagal (*rate limit* 5 kali per 15 menit) dan pengecekan `registration_open` pada fungsi publik RPC.
3. Mencegah pendaftar yang belum membayar (`payment_pending` / `payment_rejected`) mengirim formulir final (`fn_submit_registration_final`), menyimpan draf, atau mengunggah dokumen.
4. Menggabungkan pembuatan pendaftaran dan pencatatan bukti bayar awal ke dalam 1 transaksi database (`fn_create_registration`) agar tidak terjadi *orphan registration* (pendaftar kehilangan kode akses saat sinyal internet terputus di tengah jalan).
5. Memvalidasi isi JSON pada `fn_submit_registration_final` serta memperbarui kolom `child_name` dan `parent_name` di tabel `registrations` agar nama orang tua di tabel Admin tidak selamanya tertulis `"Wali Murid"`.

---

## Context & Penjelasan Masalah (Untuk Junior Developer)

Pada migrasi `20261024000200_registration_rpc_and_cloudinary`, logika backend dipindahkan dari Supabase Edge Functions ke fungsi SQL PostgreSQL (`SECURITY DEFINER`). Fungsi yang memiliki label `SECURITY DEFINER` berjalan dengan hak akses pemilik database (melewati aturan RLS / *Row-Level Security*).

Saat ini terdapat **5 masalah serius** di fungsi-fungsi SQL tersebut:

1. **Celah Otorisasi Admin di `fn_review_payment`**:
   - Fungsi `fn_review_payment` diberikan izin `GRANT EXECUTE ... TO authenticated`, tetapi di dalam badannya **tidak mengecek `public.is_admin()`**. Akibatnya, siapa pun yang memiliki sesi login non-admin dapat memanggil `supabase.rpc('fn_review_payment', ...)` dari konsol browser untuk memverifikasi pembayaran apa pun dan memalsukan `p_admin_id`.
2. **Tidak Ada Rate Limit & Tidak Mengecek Status Buka/Tutup PPDB**:
   - `fn_create_registration` tidak mengecek tabel `ppdb_config` apakah pendaftaran sedang dibuka (`registration_open = true`), dan selalu menulis tahun `'2027'` secara statis.
   - `fn_verify_registration_access` dan RPC publik lainnya tidak membatasi percobaan salah kode akses (tidak ada blokir setelah 5 kali gagal dalam 15 menit), sehingga rentan terhadap serangan tebak kode akses (*brute-force*).
3. **Bisa Kirim Formulir Lengkap Tanpa Membayar**:
   - `fn_upload_registration_document`, `fn_save_registration_draft`, dan `fn_submit_registration_final` hanya mengecek kolom `status`, tetapi **lupa mengecek kolom `payment_status`**. Pendaftar yang belum mengunggah bukti bayar (`payment_pending`) atau yang bukti bayarnya ditolak (`payment_rejected`) bisa langsung memanggil `fn_submit_registration_final` dan mengubah statusnya menjadi `submitted` (`Formulir Masuk`).
4. **Pendaftaran Menggantung (*Orphan Registration*) Jika Koneksi Putus**:
   - Di `src/features/registration/services/registration.ts`, browser memanggil `fn_create_registration` lalu memanggil `fn_submit_payment_proof` secara terpisah. Jika panggilan pertama berhasil tetapi panggilan kedua gagal (karena sinyal HP terputus), error dilempar sebelum `access_code` sempat disimpan di browser. Orang tua tidak pernah melihat kode aksesnya dan jika mereka menekan tombol Daftar lagi, data ganda akan terbuat.
5. **Nama Orang Tua Selamanya `"Wali Murid"` & Tidak Ada Validasi JSON di `fn_submit_registration_final`**:
   - Saat awal daftar (Task 041), `parent_name` diisi default `"Wali Murid"`. Ketika orang tua selesai mengisi formulir lengkap (yang berisi nama asli Ayah dan Ibu) dan menekan Kirim Final (`fn_submit_registration_final`), fungsi SQL tersebut tidak memperbarui kolom `parent_name` dan `child_name` di tabel `registrations`, serta tidak mengecek apakah JSON formulir benar-benar berisi data siswa/ayah/ibu.
   - Selain itu, pada `fn_submit_payment_proof`, kolom `status` selalu ditimpa menjadi `'awaiting_form'` meskipun pendaftar sudah berstatus `'submitted'` (ketika mengunggah ulang bukti bayar yang ditolak).

---

## Scope (Daftar Pekerjaan)
1. Buat file migrasi SQL baru `prisma/migrations/20261028000100_rpc_security_and_validation_fixes/migration.sql` yang memperbarui:
   - `public.fn_review_payment`
   - `public.fn_verify_access_or_fail` (fungsi helper internal untuk cek kode akses + rate limit 5x/15m)
   - `public.fn_create_registration` (menerima parameter opsional `p_proof_url text DEFAULT NULL`, mengecek `ppdb_config`, dan langsung menyimpan bukti bayar dalam 1 transaksi jika `p_proof_url` diisi)
   - `public.fn_verify_registration_access`
   - `public.fn_submit_payment_proof`
   - `public.fn_upload_registration_document`
   - `public.fn_get_registration_full_form`
   - `public.fn_save_registration_draft`
   - `public.fn_submit_registration_final`
2. Perbarui `src/features/registration/services/registration.ts` agar mengirimkan `p_proof_url: uploadRes.secure_url` langsung ke `fn_create_registration` dalam satu panggilan RPC (tanpa perlu memanggil `fn_submit_payment_proof` lagi secara terpisah).

## Out of Scope
- Mengubah struktur tabel di `prisma/schema.prisma`.
- Mengubah tampilan UI halaman pendaftaran atau dashboard admin.

---

## Step-by-Step Implementation Guide (Panduan Langkah demi Langkah)

### Langkah 1: Buat File Migrasi SQL Baru
Buat file baru di `prisma/migrations/20261028000100_rpc_security_and_validation_fixes/migration.sql` dengan isi lengkap berikut:

```sql
-- Migration: Security & Validation Hardening for PostgreSQL RPC Functions
-- Task: Task 043

-- 1. Amankan fn_review_payment dengan pengecekan public.is_admin() dan auth.uid()
CREATE OR REPLACE FUNCTION public.fn_review_payment(
  p_payment_id UUID,
  p_approved BOOLEAN,
  p_admin_id UUID DEFAULT NULL,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_new_payment_status payment_status;
  v_new_reg_status registration_status;
  v_audit_action TEXT;
  v_actor_id UUID;
BEGIN
  -- Wajib memiliki sesi admin aktif (kecuali dipanggil oleh service_role di server)
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Akses ditolak: hanya admin aktif yang dapat memverifikasi pembayaran' USING ERRCODE = '42501';
    END IF;
  END IF;

  v_actor_id := COALESCE(auth.uid(), p_admin_id);
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'ID Admin tidak ditemukan' USING ERRCODE = '42501';
  END IF;

  -- Lock baris payment
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Data pembayaran tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;

  IF v_payment.status != 'payment_submitted' THEN
    RAISE EXCEPTION 'Pembayaran tidak dalam status menunggu verifikasi (status saat ini: %)', v_payment.status USING ERRCODE = 'P0001';
  END IF;

  IF p_approved THEN
    v_new_payment_status := 'payment_verified';
    v_new_reg_status := 'awaiting_form';
    v_audit_action := 'payment_approved';
  ELSE
    IF p_review_notes IS NULL OR TRIM(p_review_notes) = '' THEN
      RAISE EXCEPTION 'Alasan penolakan wajib diisi saat menolak bukti pembayaran' USING ERRCODE = 'P0003';
    END IF;
    v_new_payment_status := 'payment_rejected';
    v_new_reg_status := 'awaiting_payment';
    v_audit_action := 'payment_rejected';
  END IF;

  UPDATE payments
  SET
    status = v_new_payment_status,
    reviewed_at = now(),
    reviewed_by = v_actor_id,
    review_notes = p_review_notes
  WHERE id = p_payment_id;

  UPDATE registrations
  SET
    payment_status = v_new_payment_status,
    status = CASE
      WHEN p_approved AND status = 'awaiting_payment' THEN v_new_reg_status
      WHEN NOT p_approved AND status = 'awaiting_form' THEN 'awaiting_payment'::registration_status
      ELSE status
    END,
    review_notes = CASE WHEN NOT p_approved THEN p_review_notes ELSE review_notes END,
    updated_at = now()
  WHERE id = v_payment.registration_id;

  INSERT INTO audit_events (
    actor_id,
    actor_type,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    v_actor_id,
    'admin',
    v_audit_action,
    'payment',
    p_payment_id,
    jsonb_build_object(
      'registration_id', v_payment.registration_id,
      'approved', p_approved,
      'notes', p_review_notes
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', p_payment_id,
    'registration_id', v_payment.registration_id,
    'new_status', v_new_payment_status
  );
END;
$$;

-- 2. Helper Internal: Verifikasi Kode Akses + Proteksi Timing Attack + Rate Limit (Maks 5x gagal / 15 menit)
CREATE OR REPLACE FUNCTION public.fn_verify_access_or_fail(
  p_registration_number text,
  p_access_code text
)
RETURNS registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
  v_access record;
  v_code text := upper(trim(COALESCE(p_access_code, '')));
  v_reg_num text := upper(trim(COALESCE(p_registration_number, '')));
  v_failed_count integer;
  v_dummy_hash text := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
BEGIN
  IF v_reg_num = '' OR v_code = '' THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  SELECT * INTO v_reg
  FROM registrations
  WHERE registration_number = v_reg_num;

  IF NOT FOUND THEN
    -- Lakukan dummy bcrypt check agar waktu respon sama (mencegah enumerasi nomor pendaftaran)
    PERFORM crypt(v_code, v_dummy_hash);
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  -- Cek jumlah percobaan gagal dalam 15 menit terakhir
  SELECT count(*) INTO v_failed_count
  FROM audit_events
  WHERE entity_type = 'registration'
    AND entity_id = v_reg.id
    AND action = 'verify_access_failed'
    AND created_at >= (now() - interval '15 minutes');

  IF v_failed_count >= 5 THEN
    RAISE EXCEPTION 'Terlalu banyak percobaan gagal. Silakan tunggu 15 menit sebelum mencoba lagi.';
  END IF;

  SELECT access_code_hash INTO v_access
  FROM registration_access
  WHERE registration_id = v_reg.id;

  IF NOT FOUND OR crypt(v_code, v_access.access_code_hash) != v_access.access_code_hash THEN
    INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
    VALUES ('applicant', 'verify_access_failed', 'registration', v_reg.id, jsonb_build_object('registration_number', v_reg_num));
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  RETURN v_reg;
END;
$$;

-- 3. RPC: fn_create_registration (Cek ppdb_config + Atomic Proof Upload)
DROP FUNCTION IF EXISTS public.fn_create_registration(text, text, text);

CREATE OR REPLACE FUNCTION public.fn_create_registration(
  p_child_name text,
  p_parent_name text,
  p_whatsapp_number text,
  p_proof_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg_num text;
  v_access_code text;
  v_hash text;
  v_reg_id uuid;
  v_norm_child text := trim(COALESCE(p_child_name, ''));
  v_norm_parent text := trim(COALESCE(p_parent_name, ''));
  v_norm_wa text := trim(COALESCE(p_whatsapp_number, ''));
  v_norm_proof text := NULLIF(trim(COALESCE(p_proof_url, '')), '');
  v_reg_open jsonb;
  v_period_cfg jsonb;
  v_academic_year text := '2027-2028';
  v_year_prefix text := '2027';
  v_init_status registration_status := 'awaiting_payment';
  v_init_pay_status payment_status := 'payment_pending';
BEGIN
  -- Cek apakah pendaftaran sedang dibuka di ppdb_config
  SELECT value INTO v_reg_open FROM ppdb_config WHERE key = 'registration_open';
  IF v_reg_open IS NOT NULL THEN
    IF (jsonb_typeof(v_reg_open) = 'boolean' AND v_reg_open = 'false'::jsonb)
       OR (jsonb_typeof(v_reg_open) = 'object' AND COALESCE((v_reg_open->>'is_open')::boolean, true) = false) THEN
      RAISE EXCEPTION 'Mohon maaf, pendaftaran PPDB saat ini sedang ditutup';
    END IF;
  END IF;

  -- Ambil tahun ajaran aktif dari ppdb_config jika tersedia
  SELECT value INTO v_period_cfg FROM ppdb_config WHERE key = 'ppdb_period';
  IF v_period_cfg IS NOT NULL AND jsonb_typeof(v_period_cfg) = 'object' AND (v_period_cfg->>'academic_year') IS NOT NULL THEN
    v_academic_year := replace(v_period_cfg->>'academic_year', '/', '-');
    v_year_prefix := substring(v_academic_year from '^[0-9]{4}');
  END IF;

  IF length(v_norm_child) < 2 THEN
    RAISE EXCEPTION 'Nama calon santri minimal 2 karakter';
  END IF;
  IF length(v_norm_parent) < 2 THEN
    RAISE EXCEPTION 'Nama orang tua minimal 2 karakter';
  END IF;
  IF v_norm_wa !~ '^(\+?62|0)8[1-9][0-9]{6,10}$' THEN
    RAISE EXCEPTION 'Format nomor WhatsApp tidak valid';
  END IF;

  IF v_norm_proof IS NOT NULL THEN
    v_init_status := 'awaiting_form';
    v_init_pay_status := 'payment_submitted';
  END IF;

  v_reg_num := generate_registration_number(COALESCE(v_year_prefix, '2027'));
  v_access_code := fn_generate_access_code();
  v_hash := crypt(v_access_code, gen_salt('bf', 10));

  INSERT INTO registrations (registration_number, child_name, parent_name, whatsapp_number, status, payment_status, ppdb_period)
  VALUES (v_reg_num, v_norm_child, v_norm_parent, v_norm_wa, v_init_status, v_init_pay_status, v_academic_year)
  RETURNING id INTO v_reg_id;

  INSERT INTO registration_access (registration_id, access_code_hash)
  VALUES (v_reg_id, v_hash);

  INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
  VALUES ('applicant', 'registration_created', 'registration', v_reg_id, jsonb_build_object('registration_number', v_reg_num));

  -- Jika bukti pembayaran disertakan langsung, simpan dalam transaksi yang sama
  IF v_norm_proof IS NOT NULL THEN
    INSERT INTO payments (registration_id, proof_file_path, status)
    VALUES (v_reg_id, v_norm_proof, 'payment_submitted');

    INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
    VALUES ('applicant', 'payment_proof_submitted', 'registration', v_reg_id, jsonb_build_object('proof_url', v_norm_proof));
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_reg_id,
    'registration_id', v_reg_id,
    'registration_number', v_reg_num,
    'access_code', v_access_code,
    'child_name', v_norm_child,
    'parent_name', v_norm_parent
  );
END;
$$;

-- 4. RPC: fn_verify_registration_access (Menggunakan helper rate-limit)
CREATE OR REPLACE FUNCTION public.fn_verify_registration_access(
  p_registration_number text,
  p_access_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
BEGIN
  BEGIN
    v_reg := public.fn_verify_access_or_fail(p_registration_number, p_access_code);
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_reg.id,
    'registration_number', v_reg.registration_number,
    'child_name', v_reg.child_name,
    'parent_name', v_reg.parent_name,
    'status', v_reg.status,
    'payment_status', v_reg.payment_status,
    'review_notes', v_reg.review_notes,
    'created_at', v_reg.created_at,
    'submitted_at', v_reg.submitted_at
  );
END;
$$;

-- 5. RPC: fn_submit_payment_proof (Jangan menimpa status jika sudah submitted)
CREATE OR REPLACE FUNCTION public.fn_submit_payment_proof(
  p_registration_number text,
  p_access_code text,
  p_proof_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
  v_proof_url text := trim(COALESCE(p_proof_url, ''));
  v_next_status registration_status;
BEGIN
  IF v_proof_url = '' THEN
    RAISE EXCEPTION 'URL bukti transfer wajib diisi';
  END IF;

  v_reg := public.fn_verify_access_or_fail(p_registration_number, p_access_code);

  IF v_reg.payment_status = 'payment_verified' THEN
    RAISE EXCEPTION 'Pembayaran telah diverifikasi';
  END IF;

  v_next_status := CASE
    WHEN v_reg.status = 'awaiting_payment' THEN 'awaiting_form'::registration_status
    ELSE v_reg.status
  END;

  INSERT INTO payments (registration_id, proof_file_path, status)
  VALUES (v_reg.id, v_proof_url, 'payment_submitted');

  UPDATE registrations
  SET payment_status = 'payment_submitted',
      status = v_next_status,
      updated_at = now()
  WHERE id = v_reg.id;

  INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
  VALUES ('applicant', 'payment_proof_submitted', 'registration', v_reg.id, jsonb_build_object('proof_url', v_proof_url));

  RETURN jsonb_build_object(
    'success', true,
    'status', 'payment_submitted',
    'registration_status', v_next_status,
    'message', 'Bukti pembayaran berhasil diunggah'
  );
END;
$$;

-- 6. RPC: fn_upload_registration_document (Wajib sudah unggah bukti bayar)
CREATE OR REPLACE FUNCTION public.fn_upload_registration_document(
  p_registration_number text,
  p_access_code text,
  p_document_type text,
  p_file_url text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
  v_doc_type text := trim(COALESCE(p_document_type, ''));
  v_file_url text := trim(COALESCE(p_file_url, ''));
BEGIN
  IF v_doc_type NOT IN ('kartu_keluarga', 'akte_kelahiran') THEN
    RAISE EXCEPTION 'Tipe dokumen tidak valid: %', v_doc_type;
  END IF;
  IF v_file_url = '' THEN
    RAISE EXCEPTION 'URL dokumen wajib diisi';
  END IF;

  v_reg := public.fn_verify_access_or_fail(p_registration_number, p_access_code);

  IF v_reg.payment_status NOT IN ('payment_submitted', 'payment_verified') THEN
    RAISE EXCEPTION 'Silakan unggah bukti pembayaran terlebih dahulu sebelum mengunggah dokumen persyaratan';
  END IF;

  IF v_reg.status IN ('submitted', 'under_review', 'accepted', 'rejected') THEN
    RAISE EXCEPTION 'Formulir pendaftaran telah dikirim dan tidak dapat diubah';
  END IF;

  INSERT INTO registration_documents (registration_id, document_type, file_path, uploaded_at)
  VALUES (v_reg.id, v_doc_type::document_type, v_file_url, now())
  ON CONFLICT (registration_id, document_type)
  DO UPDATE SET file_path = EXCLUDED.file_path, uploaded_at = now();

  INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
  VALUES ('applicant', 'document_uploaded', 'registration_document', v_reg.id, jsonb_build_object('document_type', v_doc_type, 'file_url', v_file_url));

  RETURN jsonb_build_object(
    'success', true,
    'document_type', v_doc_type,
    'file_path', v_file_url,
    'message', 'Dokumen berhasil diunggah'
  );
END;
$$;

-- 7. RPC: fn_get_registration_full_form (Menggunakan helper rate-limit)
CREATE OR REPLACE FUNCTION public.fn_get_registration_full_form(
  p_registration_number text,
  p_access_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
  v_form record;
  v_docs jsonb := '[]'::jsonb;
  v_form_data jsonb;
BEGIN
  BEGIN
    v_reg := public.fn_verify_access_or_fail(p_registration_number, p_access_code);
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
  END;

  SELECT form_data INTO v_form
  FROM registration_form_data
  WHERE registration_id = v_reg.id;

  v_form_data := COALESCE(v_form.form_data, '{}'::jsonb);

  IF NOT (v_form_data ? 'child') THEN
    v_form_data := jsonb_set(v_form_data, '{child}', jsonb_build_object('full_name', v_reg.child_name));
  ELSIF (v_form_data->'child'->>'full_name') IS NULL OR (v_form_data->'child'->>'full_name') = '' THEN
    v_form_data := jsonb_set(v_form_data, '{child,full_name}', to_jsonb(v_reg.child_name));
  END IF;

  IF NOT (v_form_data ? 'father') THEN
    v_form_data := jsonb_set(
      v_form_data,
      '{father}',
      jsonb_build_object(
        'full_name', CASE WHEN v_reg.parent_name = 'Wali Murid' THEN '' ELSE v_reg.parent_name END,
        'whatsapp_number', v_reg.whatsapp_number
      )
    );
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'document_type', document_type::text,
    'file_path', file_path,
    'uploaded_at', uploaded_at
  )) INTO v_docs
  FROM registration_documents
  WHERE registration_id = v_reg.id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_number', v_reg.registration_number,
    'status', v_reg.status,
    'payment_status', v_reg.payment_status,
    'submitted_at', v_reg.submitted_at,
    'form_data', v_form_data,
    'documents', COALESCE(v_docs, '[]'::jsonb)
  );
END;
$$;

-- 8. RPC: fn_save_registration_draft (Wajib sudah unggah bukti bayar)
CREATE OR REPLACE FUNCTION public.fn_save_registration_draft(
  p_registration_number text,
  p_access_code text,
  p_form_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
BEGIN
  v_reg := public.fn_verify_access_or_fail(p_registration_number, p_access_code);

  IF v_reg.payment_status NOT IN ('payment_submitted', 'payment_verified') THEN
    RAISE EXCEPTION 'Silakan unggah bukti pembayaran terlebih dahulu sebelum menyimpan draf formulir';
  END IF;

  IF v_reg.status IN ('submitted', 'under_review', 'accepted', 'rejected') THEN
    RAISE EXCEPTION 'Formulir telah dikirim dan tidak dapat diubah';
  END IF;

  INSERT INTO registration_form_data (registration_id, form_data, updated_at)
  VALUES (v_reg.id, p_form_data, now())
  ON CONFLICT (registration_id)
  DO UPDATE SET form_data = EXCLUDED.form_data, updated_at = now();

  RETURN jsonb_build_object('success', true, 'message', 'Draf berhasil disimpan');
END;
$$;

-- 9. RPC: fn_submit_registration_final (Wajib bukti bayar + Validasi JSON + Sinkronisasi Nama Siswa & Orang Tua)
CREATE OR REPLACE FUNCTION public.fn_submit_registration_final(
  p_registration_number text,
  p_access_code text,
  p_form_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_reg registrations%ROWTYPE;
  v_doc_count integer;
  v_child_name text;
  v_child_nik text;
  v_father_name text;
  v_mother_name text;
  v_parent_display_name text;
BEGIN
  v_reg := public.fn_verify_access_or_fail(p_registration_number, p_access_code);

  IF v_reg.payment_status NOT IN ('payment_submitted', 'payment_verified') THEN
    RAISE EXCEPTION 'Bukti pembayaran belum diunggah atau ditolak. Silakan unggah bukti pembayaran terlebih dahulu.';
  END IF;

  IF v_reg.status IN ('submitted', 'under_review', 'accepted', 'rejected') THEN
    RAISE EXCEPTION 'Formulir telah dikirim sebelumnya';
  END IF;

  -- Validasi field wajib di p_form_data
  v_child_name := trim(COALESCE(p_form_data->'child'->>'full_name', ''));
  v_child_nik := trim(COALESCE(p_form_data->'child'->>'nik', ''));
  v_father_name := trim(COALESCE(p_form_data->'father'->>'full_name', ''));
  v_mother_name := trim(COALESCE(p_form_data->'mother'->>'full_name', ''));

  IF length(v_child_name) < 2 OR v_child_nik !~ '^[0-9]{16}$' THEN
    RAISE EXCEPTION 'Data calon siswa (Nama Lengkap dan NIK 16 digit) wajib diisi dengan benar';
  END IF;

  IF length(v_father_name) < 2 OR length(v_mother_name) < 2 THEN
    RAISE EXCEPTION 'Data Nama Lengkap Ayah dan Ibu wajib diisi';
  END IF;

  -- Validasi kelengkapan dokumen KK & Akte Kelahiran
  SELECT count(*) INTO v_doc_count
  FROM registration_documents
  WHERE registration_id = v_reg.id
    AND document_type IN ('kartu_keluarga', 'akte_kelahiran');

  IF v_doc_count < 2 THEN
    RAISE EXCEPTION 'Dokumen persyaratan belum lengkap (wajib mengunggah Kartu Keluarga dan Akte Kelahiran)';
  END IF;

  -- Simpan data formulir lengkap
  INSERT INTO registration_form_data (registration_id, form_data, updated_at)
  VALUES (v_reg.id, p_form_data, now())
  ON CONFLICT (registration_id)
  DO UPDATE SET form_data = EXCLUDED.form_data, updated_at = now();

  v_parent_display_name := COALESCE(NULLIF(v_father_name, ''), NULLIF(v_mother_name, ''), v_reg.parent_name);

  -- Update status sekaligus perbarui child_name dan parent_name di tabel registrations
  UPDATE registrations
  SET status = 'submitted',
      child_name = v_child_name,
      parent_name = v_parent_display_name,
      submitted_at = now(),
      updated_at = now()
  WHERE id = v_reg.id;

  INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
  VALUES ('applicant', 'form_submitted', 'registration', v_reg.id, jsonb_build_object('submitted_at', now()));

  RETURN jsonb_build_object(
    'success', true,
    'status', 'submitted',
    'message', 'Formulir pendaftaran berhasil dikirim'
  );
END;
$$;

-- Atur hak akses eksekusi fungsi
REVOKE EXECUTE ON FUNCTION public.fn_verify_access_or_fail(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_create_registration(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_verify_registration_access(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_payment_proof(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_upload_registration_document(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_registration_full_form(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_save_registration_draft(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_registration_final(text, text, jsonb) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_review_payment(UUID, BOOLEAN, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_review_payment(UUID, BOOLEAN, UUID, TEXT) TO authenticated, service_role;
```

---

### Langkah 2: Sederhanakan `src/features/registration/services/registration.ts`
Karena `fn_create_registration` kini menerima `p_proof_url` secara langsung dalam satu transaksi database, ubah fungsi `createRegistration` di `src/features/registration/services/registration.ts` menjadi:

```typescript
import { supabase } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { CreateRegistrationRequest, CreateRegistrationResponse } from "../types";

export async function createRegistration(
  payload: CreateRegistrationRequest
): Promise<CreateRegistrationResponse> {
  // 1. Upload bukti pembayaran ke Cloudinary terlebih dahulu.
  // Jika upload gagal, nomor pendaftaran TIDAK AKAN dibuat di database.
  const uploadRes = await uploadToCloudinary(payload.file, "ppdb-taud/bukti-bayar");

  // 2. Buat pendaftaran + catat bukti pembayaran secara atomic dalam 1 transaksi RPC
  const { data, error } = await supabase.rpc("fn_create_registration", {
    p_child_name: payload.child_name,
    p_parent_name: "Wali Murid",
    p_whatsapp_number: payload.whatsapp_number,
    p_proof_url: uploadRes.secure_url,
  });

  if (error) {
    throw new Error(error.message || "Gagal membuat pendaftaran");
  }

  const res = data as unknown as CreateRegistrationResponse;
  if (!res || !res.registration_number || !res.access_code) {
    throw new Error("Respon server tidak valid");
  }

  return res;
}
```

---

## Files Expected to Change
- `prisma/migrations/20261028000100_rpc_security_and_validation_fixes/migration.sql` (File Baru)
- `src/features/registration/services/registration.ts`

## Acceptance Criteria
- [ ] `fn_review_payment` menolak panggilan dari user yang bukan admin (`NOT public.is_admin()`) dan menggunakan `auth.uid()` sebagai pencatat di `audit_events`.
- [ ] Panggilan kode akses yang salah 5 kali berturut-turut dalam 15 menit pada nomor pendaftaran yang sama akan diblokir sementara oleh `fn_verify_access_or_fail`.
- [ ] `fn_create_registration` menolak pembuatan pendaftaran baru jika `registration_open` di `ppdb_config` bernilai `false`.
- [ ] `fn_create_registration` menyimpan data pendaftaran dan bukti pembayaran awal (`p_proof_url`) dalam satu transaksi database tunggal sehingga tidak ada risiko *orphan registration*.
- [ ] `fn_upload_registration_document`, `fn_save_registration_draft`, dan `fn_submit_registration_final` menolak eksekusi apabila `payment_status` belum `payment_submitted` atau `payment_verified`.
- [ ] Saat `fn_submit_registration_final` berhasil dijalankan, kolom `parent_name` di tabel `registrations` otomatis diperbarui dari nama Ayah/Ibu pada formulir (tidak lagi tertulis `"Wali Murid"`).
- [ ] `npx tsc -b --noEmit`, `npm run lint`, dan `npm run build` berjalan sukses dengan 0 error.

## Verification Commands
```bash
npx tsc -b --noEmit
npm run lint
npm run build
```
