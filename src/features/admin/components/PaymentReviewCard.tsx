import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RejectDialog } from './RejectDialog';
import { createPaymentProofSignedUrl, reviewPayment } from '../services/adminPayment';
import type { RegistrantDetail } from '../types';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  Loader2,
  Calendar,
  User,
  Phone,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentReviewCardProps {
  registrant: RegistrantDetail;
  onStatusUpdated?: () => void;
}

export const PaymentReviewCard: React.FC<PaymentReviewCardProps> = ({
  registrant,
  onStatusUpdated,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  const [isApproving, setIsApproving] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Latest payment record
  const latestPayment = registrant.payments && registrant.payments.length > 0
    ? registrant.payments[0]
    : null;

  const isPdf = latestPayment?.proof_file_path.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    let isMounted = true;
    if (latestPayment?.proof_file_path) {
      setLoadingProof(true);
      setProofError(null);
      createPaymentProofSignedUrl(latestPayment.proof_file_path)
        .then((url) => {
          if (isMounted) setSignedUrl(url);
        })
        .catch((err) => {
          if (isMounted) setProofError(err.message || 'Gagal memuat URL berkas bukti');
        })
        .finally(() => {
          if (isMounted) setLoadingProof(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [latestPayment?.proof_file_path]);

  const handleApprove = async () => {
    if (!latestPayment) return;
    setIsApproving(true);
    try {
      await reviewPayment({
        payment_id: latestPayment.id,
        approved: true,
      });
      toast.success(`Pembayaran ${registrant.registration_number} berhasil disetujui!`);
      onStatusUpdated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyetujui pembayaran';
      toast.error(message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectConfirm = async (notes: string) => {
    if (!latestPayment) return;
    setIsRejecting(true);
    try {
      await reviewPayment({
        payment_id: latestPayment.id,
        approved: false,
        review_notes: notes,
      });
      toast.success(`Pembayaran ${registrant.registration_number} telah ditolak dengan catatan.`);
      setIsRejectDialogOpen(false);
      onStatusUpdated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menolak pembayaran';
      toast.error(message);
    } finally {
      setIsRejecting(false);
    }
  };

  const canReview = latestPayment?.status === 'payment_submitted';

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-slate-800">
                  {registrant.registration_number}
                </CardTitle>
                <Badge
                  variant={
                    registrant.payment_status === 'payment_verified'
                      ? 'default'
                      : registrant.payment_status === 'payment_rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className="font-medium"
                >
                  {registrant.payment_status === 'payment_verified' && 'Diverifikasi'}
                  {registrant.payment_status === 'payment_submitted' && 'Menunggu Verifikasi'}
                  {registrant.payment_status === 'payment_rejected' && 'Ditolak'}
                  {registrant.payment_status === 'payment_pending' && 'Belum Bayar'}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Calon Santri: <strong>{registrant.child_name}</strong> • Orang Tua: {registrant.parent_name}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${registrant.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Detail Informasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-sm">
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Nama Santri
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">{registrant.child_name}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Wali Santri
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">{registrant.parent_name}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Tanggal Daftar
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {new Date(registrant.created_at).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> Status Alur
              </span>
              <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                {registrant.status.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Bukti Transfer Review Box */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-primary)]" />
                Berkas Bukti Transfer (Biaya Pendaftaran Rp300.000)
              </h3>
              {latestPayment?.uploaded_at && (
                <span className="text-xs text-slate-500">
                  Diunggah:{' '}
                  {new Date(latestPayment.uploaded_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </div>

            {loadingProof && (
              <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                <span className="text-xs">Membuat secure signed URL berkas bukti...</span>
              </div>
            )}

            {proofError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{proofError}</span>
              </div>
            )}

            {!loadingProof && !proofError && signedUrl && (
              <div className="space-y-3">
                {isPdf ? (
                  <div className="space-y-2">
                    <iframe
                      src={signedUrl}
                      title="Pratinjau Dokumen PDF Bukti Transfer"
                      className="w-full h-96 rounded-lg border border-slate-200"
                    />
                    <div className="flex justify-end">
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        Buka Dokumen PDF di Tab Baru <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="max-h-[500px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <img
                        src={signedUrl}
                        alt={`Bukti transfer ${registrant.registration_number}`}
                        className="max-h-[500px] w-auto object-contain hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(signedUrl, '_blank')}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Klik gambar untuk melihat resolusi penuh di tab baru</span>
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        Buka Gambar <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loadingProof && !latestPayment && (
              <div className="p-8 text-center bg-slate-50 rounded-lg text-slate-500 text-sm">
                Belum ada bukti pembayaran yang diunggah untuk pendaftar ini.
              </div>
            )}

            {/* Riwayat Catatan Review (Jika Ada) */}
            {latestPayment?.review_notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <strong>Catatan Admin Sebelumnya:</strong> {latestPayment.review_notes}
              </div>
            )}

            {/* Action Buttons for Verifier */}
            {canReview && (
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={isApproving || isRejecting}
                >
                  <XCircle className="w-4 h-4" />
                  Tolak Bukti Transfer
                </Button>

                <Button
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyetujui...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Setujui Pembayaran (Valid)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RejectDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleRejectConfirm}
        isSubmitting={isRejecting}
        registrationNumber={registrant.registration_number}
      />
    </div>
  );
};

export default PaymentReviewCard;
