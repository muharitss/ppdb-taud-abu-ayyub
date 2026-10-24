-- Migration: RPC functions for public registration workflows with Cloudinary support
-- Solves undeployed Edge Functions dependency while preserving exact security boundaries (bcrypt, status validations, audit events).

-- 1. Helper function: generate random alphanumeric access code (8 chars, unambiguous)
CREATE OR REPLACE FUNCTION public.fn_generate_access_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2. RPC: create_registration
CREATE OR REPLACE FUNCTION public.fn_create_registration(
  p_child_name text,
  p_parent_name text,
  p_whatsapp_number text
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
  v_norm_child text := trim(p_child_name);
  v_norm_parent text := trim(p_parent_name);
  v_norm_wa text := trim(p_whatsapp_number);
BEGIN
  IF length(v_norm_child) < 2 THEN
    RAISE EXCEPTION 'Nama calon santri minimal 2 karakter';
  END IF;
  IF length(v_norm_parent) < 2 THEN
    RAISE EXCEPTION 'Nama orang tua minimal 2 karakter';
  END IF;
  IF v_norm_wa !~ '^(\+?62|0)8[1-9][0-9]{6,10}$' THEN
    RAISE EXCEPTION 'Format nomor WhatsApp tidak valid';
  END IF;

  v_reg_num := generate_registration_number('2027');
  v_access_code := fn_generate_access_code();
  v_hash := crypt(v_access_code, gen_salt('bf', 10));

  INSERT INTO registrations (registration_number, child_name, parent_name, whatsapp_number, status, payment_status, ppdb_period)
  VALUES (v_reg_num, v_norm_child, v_norm_parent, v_norm_wa, 'awaiting_payment', 'payment_pending', '2027-2028')
  RETURNING id INTO v_reg_id;

  INSERT INTO registration_access (registration_id, access_code_hash)
  VALUES (v_reg_id, v_hash);

  INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
  VALUES ('applicant', 'registration_created', 'registration', v_reg_id, jsonb_build_object('registration_number', v_reg_num));

  RETURN jsonb_build_object(
    'success', true,
    'id', v_reg_id,
    'registration_number', v_reg_num,
    'access_code', v_access_code,
    'child_name', v_norm_child,
    'parent_name', v_norm_parent
  );
END;
$$;

-- 3. RPC: verify_registration_access
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
  v_reg record;
  v_access record;
  v_code text := upper(trim(p_access_code));
  v_reg_num text := upper(trim(p_registration_number));
BEGIN
  SELECT id, registration_number, child_name, parent_name, status, payment_status, review_notes, created_at, submitted_at
  INTO v_reg
  FROM registrations
  WHERE registration_number = v_reg_num;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nomor pendaftaran atau kode akses tidak sesuai');
  END IF;

  SELECT access_code_hash INTO v_access
  FROM registration_access
  WHERE registration_id = v_reg.id;

  IF NOT FOUND OR crypt(v_code, v_access.access_code_hash) != v_access.access_code_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nomor pendaftaran atau kode akses tidak sesuai');
  END IF;

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

-- 4. RPC: submit_payment_proof
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
  v_reg record;
  v_access record;
  v_code text := upper(trim(p_access_code));
  v_reg_num text := upper(trim(p_registration_number));
  v_proof_url text := trim(p_proof_url);
BEGIN
  IF v_proof_url = '' THEN
    RAISE EXCEPTION 'URL bukti transfer wajib diisi';
  END IF;

  SELECT id, registration_number, status, payment_status INTO v_reg
  FROM registrations
  WHERE registration_number = v_reg_num;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  SELECT access_code_hash INTO v_access
  FROM registration_access
  WHERE registration_id = v_reg.id;

  IF NOT FOUND OR crypt(v_code, v_access.access_code_hash) != v_access.access_code_hash THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  IF v_reg.payment_status = 'payment_verified' THEN
    RAISE EXCEPTION 'Pembayaran telah diverifikasi';
  END IF;

  INSERT INTO payments (registration_id, proof_file_path, status)
  VALUES (v_reg.id, v_proof_url, 'payment_submitted');

  UPDATE registrations
  SET payment_status = 'payment_submitted',
      status = 'awaiting_form',
      updated_at = now()
  WHERE id = v_reg.id;

  INSERT INTO audit_events (actor_type, action, entity_type, entity_id, metadata)
  VALUES ('applicant', 'payment_proof_submitted', 'registration', v_reg.id, jsonb_build_object('proof_url', v_proof_url));

  RETURN jsonb_build_object(
    'success', true,
    'status', 'payment_submitted',
    'registration_status', 'awaiting_form',
    'message', 'Bukti pembayaran berhasil diunggah'
  );
END;
$$;

-- 5. RPC: upload_registration_document
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
  v_reg record;
  v_access record;
  v_code text := upper(trim(p_access_code));
  v_reg_num text := upper(trim(p_registration_number));
  v_doc_type text := trim(p_document_type);
  v_file_url text := trim(p_file_url);
BEGIN
  IF v_doc_type NOT IN ('kartu_keluarga', 'akte_kelahiran') THEN
    RAISE EXCEPTION 'Tipe dokumen tidak valid: %', v_doc_type;
  END IF;
  IF v_file_url = '' THEN
    RAISE EXCEPTION 'URL dokumen wajib diisi';
  END IF;

  SELECT id, registration_number, status, payment_status INTO v_reg
  FROM registrations
  WHERE registration_number = v_reg_num;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  SELECT access_code_hash INTO v_access
  FROM registration_access
  WHERE registration_id = v_reg.id;

  IF NOT FOUND OR crypt(v_code, v_access.access_code_hash) != v_access.access_code_hash THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
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

-- 6. RPC: get_registration_full_form
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
  v_reg record;
  v_access record;
  v_form record;
  v_docs jsonb := '[]'::jsonb;
  v_code text := upper(trim(p_access_code));
  v_reg_num text := upper(trim(p_registration_number));
  v_form_data jsonb;
BEGIN
  SELECT id, registration_number, child_name, parent_name, whatsapp_number, status, payment_status, submitted_at
  INTO v_reg
  FROM registrations
  WHERE registration_number = v_reg_num;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nomor pendaftaran atau kode akses tidak sesuai');
  END IF;

  SELECT access_code_hash INTO v_access
  FROM registration_access
  WHERE registration_id = v_reg.id;

  IF NOT FOUND OR crypt(v_code, v_access.access_code_hash) != v_access.access_code_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nomor pendaftaran atau kode akses tidak sesuai');
  END IF;

  SELECT form_data INTO v_form
  FROM registration_form_data
  WHERE registration_id = v_reg.id;

  v_form_data := COALESCE(v_form.form_data, '{}'::jsonb);

  -- Pre-fill initial registration data into draft if empty
  IF NOT (v_form_data ? 'child') THEN
    v_form_data := jsonb_set(v_form_data, '{child}', jsonb_build_object('full_name', v_reg.child_name));
  ELSIF (v_form_data->'child'->>'full_name') IS NULL OR (v_form_data->'child'->>'full_name') = '' THEN
    v_form_data := jsonb_set(v_form_data, '{child,full_name}', to_jsonb(v_reg.child_name));
  END IF;

  IF NOT (v_form_data ? 'father') THEN
    v_form_data := jsonb_set(v_form_data, '{father}', jsonb_build_object('full_name', v_reg.parent_name, 'whatsapp_number', v_reg.whatsapp_number));
  END IF;

  -- Fetch uploaded documents
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

-- 7. RPC: save_registration_draft
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
  v_reg record;
  v_access record;
  v_code text := upper(trim(p_access_code));
  v_reg_num text := upper(trim(p_registration_number));
BEGIN
  SELECT id, status INTO v_reg
  FROM registrations
  WHERE registration_number = v_reg_num;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  SELECT access_code_hash INTO v_access
  FROM registration_access
  WHERE registration_id = v_reg.id;

  IF NOT FOUND OR crypt(v_code, v_access.access_code_hash) != v_access.access_code_hash THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
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

-- 8. RPC: submit_registration_final
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
  v_reg record;
  v_access record;
  v_code text := upper(trim(p_access_code));
  v_reg_num text := upper(trim(p_registration_number));
  v_doc_count integer;
BEGIN
  SELECT id, status, payment_status INTO v_reg
  FROM registrations
  WHERE registration_number = v_reg_num;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  SELECT access_code_hash INTO v_access
  FROM registration_access
  WHERE registration_id = v_reg.id;

  IF NOT FOUND OR crypt(v_code, v_access.access_code_hash) != v_access.access_code_hash THEN
    RAISE EXCEPTION 'Nomor pendaftaran atau kode akses tidak sesuai';
  END IF;

  IF v_reg.status IN ('submitted', 'under_review', 'accepted', 'rejected') THEN
    RAISE EXCEPTION 'Formulir telah dikirim sebelumnya';
  END IF;

  -- Validate that both KK and Akte are uploaded
  SELECT count(*) INTO v_doc_count
  FROM registration_documents
  WHERE registration_id = v_reg.id
    AND document_type IN ('kartu_keluarga', 'akte_kelahiran');

  IF v_doc_count < 2 THEN
    RAISE EXCEPTION 'Dokumen persyaratan belum lengkap (wajib mengunggah Kartu Keluarga dan Akte Kelahiran)';
  END IF;

  -- Save full form data
  INSERT INTO registration_form_data (registration_id, form_data, updated_at)
  VALUES (v_reg.id, p_form_data, now())
  ON CONFLICT (registration_id)
  DO UPDATE SET form_data = EXCLUDED.form_data, updated_at = now();

  -- Advance status to submitted
  UPDATE registrations
  SET status = 'submitted',
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

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.fn_generate_access_code() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_create_registration(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_verify_registration_access(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_payment_proof(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_upload_registration_document(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_get_registration_full_form(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_save_registration_draft(text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_submit_registration_final(text, text, jsonb) TO anon, authenticated;
