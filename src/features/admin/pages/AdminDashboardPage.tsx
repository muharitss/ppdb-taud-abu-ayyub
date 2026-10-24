import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getRegistrants,
  type RegistrantsResult,
} from '../services/adminRegistrants';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const REG_STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draf', className: 'bg-slate-100 text-slate-700' },
  awaiting_payment: { label: 'Menunggu Transfer', className: 'bg-amber-100 text-amber-800' },
  awaiting_form: { label: 'Menunggu Formulir', className: 'bg-blue-100 text-blue-800' },
  submitted: { label: 'Formulir Masuk', className: 'bg-purple-100 text-purple-800' },
  under_review: { label: 'Sedang Ditinjau', className: 'bg-indigo-100 text-indigo-800' },
  accepted: { label: 'Diterima', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Ditolak', className: 'bg-rose-100 text-rose-800' },
};

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<RegistrantsResult | null>(null);
  const [totalRegistrants, setTotalRegistrants] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRegistrants({
        search: activeSearch,
        page,
        pageSize: 20,
      });
      setData(res);
      if (!activeSearch) {
        setTotalRegistrants(res.total);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pendaftar');
    } finally {
      setLoading(false);
    }
  }, [activeSearch, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* 1. Only 1 summary info at the top: Total Pendaftar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Pendaftar
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {totalRegistrants ?? data?.total ?? 0}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Cari nama santri, wali, atau nomor pendaftaran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white text-sm"
        />
      </div>

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

      {/* 2. Simple Registrant Table (clicking row navigates to detail) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
            <span className="text-xs">Memuat daftar pendaftar...</span>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Belum ada data pendaftar.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Nama Calon Santri</TableHead>
                  <TableHead className="font-semibold text-slate-700">Nama Wali</TableHead>
                  <TableHead className="font-semibold text-slate-700">No. WA</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => {
                  const regBadge = REG_STATUS_BADGES[item.status] || {
                    label: item.status,
                    className: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => navigate(`/admin/pendaftar/${item.id}`)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <TableCell className="font-semibold text-slate-900">
                        {item.child_name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {item.parent_name}
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs font-mono">
                        {item.whatsapp_number}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${regBadge.className}`}
                        >
                          {regBadge.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {data.totalPages > 1 && (
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Halaman {data.page} dari {data.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={data.page <= 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={data.page >= data.totalPages}
                    className="h-8 px-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
