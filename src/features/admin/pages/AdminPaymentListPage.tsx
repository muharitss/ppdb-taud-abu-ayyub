import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPendingPayments } from "../services/adminPayment";
import type { RegistrantPaymentItem } from "../types";
import {
  CreditCard,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  Inbox,
  Clock,
  Phone,
} from "lucide-react";

export const AdminPaymentListPage: React.FC = () => {
  const [items, setItems] = useState<RegistrantPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingPayments();
      setItems(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memuat antrean pembayaran";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Antrean Verifikasi Pembayaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pendaftar yang telah mengunggah bukti transfer biaya
            pendaftaran Rp300.000.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-2.5 py-1 text-xs">
            {items.length} Pendaftar Menunggu
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Muat Ulang
          </Button>
        </div>
      </div>

      {loading && (
        <div className="p-12 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <span className="text-xs">Mengambil data antrean pembayaran...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            className="text-xs"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Tidak Ada Antrean</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Semua bukti transfer telah diverifikasi. Antrean baru akan muncul
              otomatis ketika orang tua siswa mengunggah bukti pembayaran.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">
                  No. Pendaftaran
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Calon Siswa
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Nama Orang Tua
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  WhatsApp
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Waktu Unggah
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const latestPayment =
                  item.payments && item.payments.length > 0
                    ? item.payments[0]
                    : null;
                const uploadTime = latestPayment?.uploaded_at
                  ? new Date(latestPayment.uploaded_at).toLocaleString(
                      "id-ID",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      },
                    )
                  : "-";

                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-bold text-slate-900 tracking-tight">
                      {item.registration_number}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {item.child_name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item.parent_name}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://wa.me/${item.whatsapp_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        {item.whatsapp_number}
                      </a>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {uploadTime}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-normal text-xs bg-amber-50 text-amber-800 border-amber-200"
                      >
                        Menunggu Review
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/pendaftar/${item.id}`}>
                        <Button
                          size="sm"
                          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs gap-1.5"
                        >
                          Tinjau Bukti
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentListPage;
