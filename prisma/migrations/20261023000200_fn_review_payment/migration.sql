-- Migration: Add atomic fn_review_payment RPC function
-- Task: Task 019
-- Specs: specs/04-data-model.md, specs/05-business-workflows.md

CREATE OR REPLACE FUNCTION public.fn_review_payment(
  p_payment_id UUID,
  p_approved BOOLEAN,
  p_admin_id UUID,
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
BEGIN
  -- 1. Lock and fetch payment row
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Validate current status
  IF v_payment.status != 'payment_submitted' THEN
    RAISE EXCEPTION 'Payment is not in submitted status (current status: %)', v_payment.status USING ERRCODE = 'P0001';
  END IF;

  -- 3. Determine new statuses and audit action
  IF p_approved THEN
    v_new_payment_status := 'payment_verified';
    v_new_reg_status := 'awaiting_form';
    v_audit_action := 'payment_approved';
  ELSE
    IF p_review_notes IS NULL OR TRIM(p_review_notes) = '' THEN
      RAISE EXCEPTION 'Review notes are required when rejecting payment' USING ERRCODE = 'P0003';
    END IF;
    v_new_payment_status := 'payment_rejected';
    v_new_reg_status := 'awaiting_payment';
    v_audit_action := 'payment_rejected';
  END IF;

  -- 4. Update payments
  UPDATE payments
  SET
    status = v_new_payment_status,
    reviewed_at = now(),
    reviewed_by = p_admin_id,
    review_notes = p_review_notes
  WHERE id = p_payment_id;

  -- 5. Update registrations
  UPDATE registrations
  SET
    payment_status = v_new_payment_status,
    status = CASE WHEN p_approved THEN v_new_reg_status ELSE status END,
    review_notes = CASE WHEN NOT p_approved THEN p_review_notes ELSE review_notes END,
    updated_at = now()
  WHERE id = v_payment.registration_id;

  -- 6. Insert audit event
  INSERT INTO audit_events (
    actor_id,
    actor_type,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_admin_id,
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

-- Grant execution to authenticated users and service_role
REVOKE EXECUTE ON FUNCTION public.fn_review_payment(UUID, BOOLEAN, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_review_payment(UUID, BOOLEAN, UUID, TEXT) TO authenticated, service_role;
