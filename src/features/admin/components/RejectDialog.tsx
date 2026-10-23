import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  isSubmitting: boolean;
  registrationNumber: string;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  registrationNumber,
}) => {
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = notes.trim();
    if (!trimmed) {
      setValidationError('Alasan penolakan wajib diisi untuk pendaftar.');
      return;
    }
    setValidationError(null);
    await onConfirm(trimmed);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      setNotes('');
      setValidationError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              Tolak Bukti Pembayaran
            </DialogTitle>
            <DialogDescription>
              Pendaftar <strong>{registrationNumber}</strong> akan diminta untuk mengunggah ulang bukti transfer baru sesuai catatan Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Label htmlFor="review-notes" className="text-sm font-medium text-slate-700">
              Alasan Penolakan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="review-notes"
              placeholder="Contoh: Foto buram, nominal transfer kurang, atau nama pengirim tidak terbaca..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (validationError) setValidationError(null);
              }}
              rows={4}
              disabled={isSubmitting}
              className="resize-none"
            />
            {validationError && (
              <p className="text-xs text-red-600 font-medium">{validationError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || !notes.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Konfirmasi Penolakan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RejectDialog;
