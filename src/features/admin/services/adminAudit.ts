import { supabase } from '@/lib/supabase/client';

export interface AuditLogOptions {
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogItem {
  id: string;
  actor_id: string | null;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogResult {
  items: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAuditLogs({
  action,
  startDate,
  endDate,
  page = 1,
  pageSize = 20,
}: AuditLogOptions): Promise<AuditLogResult> {
  let query = supabase
    .from('audit_events')
    .select('id, actor_id, actor_type, action, entity_type, entity_id, metadata, created_at', {
      count: 'exact',
    });

  if (action && action !== 'all') {
    query = query.eq('action', action);
  }

  if (startDate) {
    query = query.gte('created_at', `${startDate}T00:00:00.000Z`);
  }

  if (endDate) {
    query = query.lte('created_at', `${endDate}T23:59:59.999Z`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error('Gagal memuat log audit: ' + error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    items: (data || []) as AuditLogItem[],
    total,
    page,
    pageSize,
    totalPages,
  };
}
