import { supabase } from '@/lib/supabase/client';

export interface DashboardStats {
  total: number;
  paymentSubmitted: number;
  awaitingForm: number;
  submitted: number;
  accepted: number;
  rejected: number;
}

export interface AuditEventItem {
  id: string;
  actor_id: string | null;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from('registrations')
    .select('status, payment_status');

  if (error) {
    throw new Error('Gagal memuat statistik pendaftaran: ' + error.message);
  }

  const rows = data || [];
  const stats: DashboardStats = {
    total: rows.length,
    paymentSubmitted: 0,
    awaitingForm: 0,
    submitted: 0,
    accepted: 0,
    rejected: 0,
  };

  for (const row of rows) {
    if (row.payment_status === 'payment_submitted') stats.paymentSubmitted++;
    if (row.status === 'awaiting_form') stats.awaitingForm++;
    if (row.status === 'submitted' || row.status === 'under_review') stats.submitted++;
    if (row.status === 'accepted') stats.accepted++;
    if (row.status === 'rejected') stats.rejected++;
  }

  return stats;
}

export async function getRecentAuditEvents(limit = 10): Promise<AuditEventItem[]> {
  const { data, error } = await supabase
    .from('audit_events')
    .select('id, actor_id, actor_type, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error('Gagal memuat riwayat aktivitas: ' + error.message);
  }

  return (data || []) as AuditEventItem[];
}
