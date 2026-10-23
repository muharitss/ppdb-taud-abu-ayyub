import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRegistrantDetail } from '../services/adminPayment';
import type { RegistrantDetail } from '../types';
import { PaymentReviewCard } from '../components/PaymentReviewCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export const AdminRegistrantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [registrant, setRegistrant] = useState<RegistrantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRegistrantDetail(id);
      setRegistrant(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat detail pendaftar';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm">Memuat data pendaftar & berkas bukti...</p>
      </div>
    );
  }

  if (error || !registrant) {
    return (
      <div className="space-y-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Antrean
          </Button>
        </Link>
        <div className="p-8 bg-white border border-red-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Gagal Menampilkan Pendaftar</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {error || 'Data pendaftar dengan ID yang diminta tidak ditemukan.'}
          </p>
          <Button onClick={fetchDetail} variant="outline" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Antrean
          </Button>
        </Link>
      </div>

      <PaymentReviewCard registrant={registrant} onStatusUpdated={fetchDetail} />
    </div>
  );
};

export default AdminRegistrantDetailPage;
