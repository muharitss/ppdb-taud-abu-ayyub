import React, { useState } from "react";
import { Building2, Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BankAccountInfo } from "../types";

interface BankInfoCardProps {
  bankInfo: BankAccountInfo;
  registrationNumber?: string;
}

export const BankInfoCard: React.FC<BankInfoCardProps> = ({
  bankInfo,
  registrationNumber,
}) => {
  const [copiedAcc, setCopiedAcc] = useState(false);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(bankInfo.accountNumber);
      setCopiedAcc(true);
      toast.success("Nomor rekening berhasil disalin");
      setTimeout(() => setCopiedAcc(false), 2000);
    } catch {
      toast.error("Gagal menyalin teks");
    }
  };

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(bankInfo.amount);

  return (
    <Card className="border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-emerald-100/60 bg-emerald-50/70">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-600 text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg text-emerald-950">
              Instruksi Transfer Bank
            </CardTitle>
            <p className="text-xs text-emerald-800/80">
              Transfer manual biaya pendaftaran santri baru
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Nominal Transfer */}
        <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80">
          <span className="text-xs font-medium text-emerald-800 uppercase tracking-wide">
            Biaya Pendaftaran
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {formattedAmount}
          </div>
        </div>

        {/* Bank & Rekening Detail */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-1 border-b border-dashed border-emerald-100">
            <span className="text-gray-600">Bank Tujuan</span>
            <span className="font-semibold text-gray-900">{bankInfo.bankName}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-dashed border-emerald-100">
            <span className="text-gray-600">Atas Nama</span>
            <span className="font-semibold text-gray-900">{bankInfo.accountHolder}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <div>
              <span className="text-gray-600 block text-xs">Nomor Rekening</span>
              <span className="font-mono font-bold text-base sm:text-lg text-gray-900 tracking-wider">
                {bankInfo.accountNumber}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyAccount}
              className="text-xs h-8 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            >
              {copiedAcc ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Salin Rekening
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Transfer Note / Berita Transfer */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Catatan / Berita Transfer:</span>
            {registrationNumber ? (
              <span>
                Mohon sertakan <strong className="font-mono text-amber-950">{registrationNumber}</strong> pada kolom catatan/berita transfer Anda.
              </span>
            ) : (
              <span>Mohon sertakan Nomor Pendaftaran Anda pada kolom berita transfer.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default BankInfoCard;
