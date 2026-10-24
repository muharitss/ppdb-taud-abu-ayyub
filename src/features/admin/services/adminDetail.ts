import { supabase } from '@/lib/supabase/client';

export interface DocumentItem {
  id: string;
  document_type: 'kartu_keluarga' | 'akte_kelahiran';
  file_path: string;
  uploaded_at: string;
  signed_url?: string;
}

export interface PaymentItem {
  id: string;
  proof_file_path: string;
  uploaded_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
  status: string;
  signed_url?: string;
}

export interface RegistrantFullData {
  registration: {
    id: string;
    registration_number: string;
    child_name: string;
    parent_name: string;
    whatsapp_number: string;
    status: string;
    payment_status: string;
    review_notes?: string | null;
    created_at: string;
    submitted_at?: string | null;
    ppdb_period: string;
  };
  formData: Record<string, Record<string, unknown>> | null;
  documents: DocumentItem[];
  payments: PaymentItem[];
  auditEvents: Array<{
    id: string;
    actor_id: string | null;
    actor_type: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>;
}

export async function getRegistrantFullDetail(id: string): Promise<RegistrantFullData> {
  const [regRes, formRes, docsRes, paymentsRes, auditRes] = await Promise.all([
    supabase.from('registrations').select('*').eq('id', id).single(),
    supabase.from('registration_form_data').select('form_data').eq('registration_id', id).maybeSingle(),
    supabase.from('registration_documents').select('*').eq('registration_id', id),
    supabase.from('payments').select('*').eq('registration_id', id).order('uploaded_at', { ascending: false }),
    supabase.from('audit_events').select('*').eq('entity_id', id).order('created_at', { ascending: false }),
  ]);

  if (regRes.error || !regRes.data) {
    throw new Error('Data pendaftar tidak ditemukan: ' + (regRes.error?.message || ''));
  }

  // Generate signed URLs for documents (or direct Cloudinary URL)
  const docs = (docsRes.data || []) as DocumentItem[];
  const docsWithUrls = await Promise.all(
    docs.map(async (doc) => {
      if (doc.file_path.startsWith('http://') || doc.file_path.startsWith('https://')) {
        return { ...doc, signed_url: doc.file_path };
      }
      try {
        const { data } = await supabase.storage
          .from('registration-documents')
          .createSignedUrl(doc.file_path, 3600);
        return { ...doc, signed_url: data?.signedUrl };
      } catch {
        return doc;
      }
    })
  );

  // Generate signed URLs for payment proofs (or direct Cloudinary URL)
  const payments = (paymentsRes.data || []) as PaymentItem[];
  const paymentsWithUrls = await Promise.all(
    payments.map(async (pmt) => {
      if (pmt.proof_file_path.startsWith('http://') || pmt.proof_file_path.startsWith('https://')) {
        return { ...pmt, signed_url: pmt.proof_file_path };
      }
      try {
        const { data } = await supabase.storage
          .from('payment-proofs')
          .createSignedUrl(pmt.proof_file_path, 3600);
        return { ...pmt, signed_url: data?.signedUrl };
      } catch {
        return pmt;
      }
    })
  );

  return {
    registration: regRes.data,
    formData: formRes.data?.form_data || null,
    documents: docsWithUrls,
    payments: paymentsWithUrls,
    auditEvents: (auditRes.data || []) as RegistrantFullData['auditEvents'],
  };
}

export async function updateRegistrantStatus({
  registrationId,
  registrationNumber,
  newStatus,
  reviewNotes,
  adminId,
}: {
  registrationId: string;
  registrationNumber: string;
  newStatus: 'under_review' | 'accepted' | 'rejected';
  reviewNotes?: string;
  adminId?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('registrations')
    .update({
      status: newStatus,
      review_notes: reviewNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId);

  if (error) {
    throw new Error('Gagal memperbarui status pendaftar: ' + error.message);
  }

  // Attempt to record audit event
  try {
    const action =
      newStatus === 'accepted'
        ? 'registrant_accepted'
        : newStatus === 'rejected'
        ? 'registrant_rejected'
        : 'status_updated';

    await supabase.from('audit_events').insert({
      actor_id: adminId || null,
      actor_type: 'admin',
      action,
      entity_type: 'registration',
      entity_id: registrationId,
      metadata: {
        registration_number: registrationNumber,
        new_status: newStatus,
        review_notes: reviewNotes?.trim() || null,
      },
    });
  } catch {
    // Audit logging is non-blocking on frontend client
  }
}
