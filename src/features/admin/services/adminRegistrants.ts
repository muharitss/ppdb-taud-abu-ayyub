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

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `registration_number.ilike.${term},child_name.ilike.${term},parent_name.ilike.${term}`
    );
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
