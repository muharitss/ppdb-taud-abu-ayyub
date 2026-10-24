import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getAuditLogs,
  type AuditLogResult,
} from '../services/adminAudit';
import {
  History,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
} from 'lucide-react';

const ACTION_OPTIONS = [
  { value: 'all', label: 'Semua Tipe Aksi' },
  { value: 'registration_created', label: 'Pendaftaran Dibuat' },
  { value: 'access_code_verified', label: 'Verifikasi Kode Akses' },
  { value: 'access_code_failed', label: 'Percobaan Akses Gagal' },
  { value: 'payment_proof_submitted', label: 'Bukti Pembayaran Diunggah' },
  { value: 'payment_verified', label: 'Pembayaran Diterima' },
  { value: 'payment_rejected', label: 'Pembayaran Ditolak' },
  { value: 'document_uploaded', label: 'Dokumen Diunggah' },
  { value: 'form_draft_saved', label: 'Draf Formulir Disimpan' },
  { value: 'form_submitted', label: 'Formulir Final Dikirim' },
  { value: 'registrant_accepted', label: 'Pendaftar Diterima' },
  { value: 'registrant_rejected', label: 'Pendaftar Ditolak' },
  { value: 'config_updated', label: 'Pengaturan Diperbarui' },
];

const ACTION_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  registration_created: { label: 'Pendaftaran Dibuat', variant: 'secondary' },
  access_code_verified: { label: 'Akses Sukses', variant: 'outline' },
  access_code_failed: { label: 'Akses Gagal', variant: 'destructive' },
  payment_proof_submitted: { label: 'Bukti Diunggah', variant: 'secondary' },
  payment_verified: { label: 'Pembayaran Diterima', variant: 'default' },
  payment_rejected: { label: 'Pembayaran Ditolak', variant: 'destructive' },
  document_uploaded: { label: 'Dokumen Diunggah', variant: 'secondary' },
  form_draft_saved: { label: 'Draf Disimpan', variant: 'outline' },
  form_submitted: { label: 'Formulir Dikirim', variant: 'default' },
  registrant_accepted: { label: 'Pendaftar Diterima', variant: 'default' },
  registrant_rejected: { label: 'Pendaftar Ditolak', variant: 'destructive' },
  config_updated: { label: 'Pengaturan Diperbarui', variant: 'secondary' },
};

export const AdminAuditLogPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AuditLogResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditLogs({
        action: actionFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        pageSize: 20,
      });
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat log audit');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, startDate, endDate, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetFilters = () => {
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--color-primary)]" />
            Log Jejak Audit Keamanan Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekaman aktivitas sistem, akses kode verifikasi, status pembayaran, dan modifikasi data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            {data ? `${data.total} Catatan Audit` : '...'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Perbarui
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 w-full md:w-[220px] rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 shadow-xs focus:ring-1 focus:ring-emerald-500"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Dari:</span>
          <Input
            type="date"
            className="h-9 text-xs w-full sm:w-[150px]"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Sampai:</span>
          <Input
            type="date"
            className="h-9 text-xs w-full sm:w-[150px]"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {(actionFilter !== 'all' || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 gap-1 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filter
          </Button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="text-xs">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading && (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
            <span className="text-xs">Memuat rekaman log audit...</span>
          </div>
        )}

        {!loading && !error && (!data || data.items.length === 0) && (
          <div className="p-16 text-center space-y-2 text-slate-500">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada log audit ditemukan</p>
            <p className="text-xs max-w-sm mx-auto">
              Tidak ada aktivitas sistem yang cocok dengan kriteria filter yang dipilih.
            </p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[180px] font-semibold text-slate-700">Waktu</TableHead>
                  <TableHead className="font-semibold text-slate-700">Aksi</TableHead>
                  <TableHead className="font-semibold text-slate-700">Pelaku</TableHead>
                  <TableHead className="font-semibold text-slate-700">Entitas / Link</TableHead>
                  <TableHead className="font-semibold text-slate-700">Detail & Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((ev) => {
                  const meta = ev.metadata || {};
                  const actionBadge = ACTION_BADGES[ev.action] || {
                    label: ev.action.replace(/_/g, ' '),
                    variant: 'outline' as const,
                  };

                  const formattedTime = new Date(ev.created_at).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  });

                  // Detect registrant ID link
                  const targetRegId =
                    ev.entity_type === 'registration'
                      ? ev.entity_id
                      : (meta.registration_id as string | undefined);

                  let detailSummary = '';
                  if (meta.registration_number) detailSummary += `No: ${meta.registration_number} `;
                  if (meta.child_name) detailSummary += `(${meta.child_name}) `;
                  if (meta.review_notes) detailSummary += `"${meta.review_notes}" `;
                  if (meta.document_type) detailSummary += `Dok: ${meta.document_type} `;
                  if (meta.key) detailSummary += `Key: ${meta.key} `;
                  if (!detailSummary && Object.keys(meta).length > 0) {
                    detailSummary = JSON.stringify(meta);
                  }

                  return (
                    <TableRow key={ev.id} className="hover:bg-slate-50/80">
                      <TableCell className="text-xs text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formattedTime}
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionBadge.variant} className="text-xs font-normal">
                          {actionBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium capitalize">
                        {ev.actor_type === 'admin' ? 'Administrator' : ev.actor_type}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {targetRegId ? (
                          <Link
                            to={`/admin/pendaftar/${targetRegId}`}
                            className="text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>{ev.entity_type}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                        ) : (
                          <span className="text-slate-500">{ev.entity_type}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 truncate max-w-sm">
                        {detailSummary || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>
                Menampilkan {(data.page - 1) * data.pageSize + 1} -{' '}
                {Math.min(data.page * data.pageSize, data.total)} dari {data.total} catatan
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1}
                  className="h-8 px-2 gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </Button>
                <span className="px-2">
                  Halaman {data.page} dari {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={data.page >= data.totalPages}
                  className="h-8 px-2 gap-1"
                >
                  Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogPage;
