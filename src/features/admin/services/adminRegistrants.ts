import { supabase } from '@/lib/supabase/client';

export interface RegistrantListItem {
  id: string;
  registration_number: string;
  child_name: string;
  parent_name: string;
  whatsapp_number: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface RegistrantQueryOptions {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface RegistrantsResult {
  items: RegistrantListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getRegistrants({
  status,
  paymentStatus,
  search,
  page = 1,
  pageSize = 15,
}: RegistrantQueryOptions): Promise<RegistrantsResult> {
  let query = supabase
    .from('registrations')
    .select(
      'id, registration_number, child_name, parent_name, whatsapp_number, status, payment_status, created_at',
      { count: 'exact' }
    );

  if (paymentStatus && paymentStatus !== 'all') {
    query = query.eq('payment_status', paymentStatus);
  }

  if (status && status !== 'all') {
    if (status === 'needs_action') {
      query = query.or('payment_status.eq.payment_submitted,status.eq.submitted,status.eq.under_review');
    } else if (
      status === 'payment_submitted' ||
      status === 'payment_pending' ||
      status === 'payment_verified' ||
      status === 'payment_rejected'
    ) {
      query = query.eq('payment_status', status);
    } else {
      query = query.eq('status', status);
    }
  }

  if (search && search.trim()) {
    const cleanSearch = search.trim().replace(/[,()"\\]/g, "");
    if (cleanSearch) {
      const term = `%${cleanSearch}%`;
      query = query.or(
        `registration_number.ilike.${term},child_name.ilike.${term},parent_name.ilike.${term}`
      );
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error('Gagal memuat daftar pendaftar: ' + error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    items: (data || []) as RegistrantListItem[],
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function deleteRegistrant(id: string): Promise<void> {
  // Fetch details before deletion so audit trail maintains human-readable context
  let registrantInfo: { registration_number?: string; child_name?: string } | null = null;
  try {
    const { data } = await supabase
      .from('registrations')
      .select('registration_number, child_name')
      .eq('id', id)
      .maybeSingle();
    registrantInfo = data;
  } catch {
    // Non-blocking metadata pre-fetch
  }

  const { error } = await supabase.from('registrations').delete().eq('id', id);

  if (error) {
    throw new Error('Gagal menghapus pendaftar: ' + error.message);
  }

  // Attempt to record audit event
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('audit_events').insert({
      actor_id: userData.user?.id || null,
      actor_type: 'admin',
      action: 'registrant_deleted',
      entity_type: 'registration',
      entity_id: id,
      metadata: registrantInfo
        ? {
            registration_number: registrantInfo.registration_number,
            child_name: registrantInfo.child_name,
          }
        : null,
    });
  } catch {
    // Audit logging is non-blocking on frontend client
  }
}

