import { supabase } from '@/lib/supabase/client';

export interface DashboardStats {
  total: number;
  paymentSubmitted: number;
  awaitingForm: number;
  submitted: number;
  accepted: number;
  rejected: number;
}

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
