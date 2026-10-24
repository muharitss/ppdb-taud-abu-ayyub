import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getRegistrants,
  deleteRegistrant,
  type RegistrantsResult,
  type RegistrantListItem,
} from "../services/adminRegistrants";
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  Phone,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status Pendaftaran" },
  { value: "awaiting_payment", label: "Menunggu Pembayaran" },
  { value: "awaiting_form", label: "Menunggu Pengisian Formulir" },
  { value: "submitted", label: "Formulir Masuk" },
  { value: "under_review", label: "Sedang Ditinjau" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
];

const REG_STATUS_BADGES: Record<string, { label: string; className: string }> =
  {
    draft: { label: "Draf", className: "bg-slate-100 text-slate-700" },
    awaiting_payment: {
      label: "Menunggu Transfer",
      className: "bg-amber-100 text-amber-800",
    },
    awaiting_form: {
      label: "Menunggu Formulir",
      className: "bg-blue-100 text-blue-800",
    },
    submitted: {
      label: "Formulir Masuk",
      className: "bg-purple-100 text-purple-800",
    },
    under_review: {
      label: "Sedang Ditinjau",
      className: "bg-indigo-100 text-indigo-800",
    },
    accepted: {
      label: "Diterima",
      className: "bg-emerald-100 text-emerald-800",
    },
    rejected: { label: "Ditolak", className: "bg-rose-100 text-rose-800" },
  };

const PAY_STATUS_BADGES: Record<string, { label: string; className: string }> =
  {
    payment_pending: {
      label: "Belum Bayar",
      className: "bg-slate-100 text-slate-600",
    },
    payment_submitted: {
      label: "Menunggu Verifikasi",
      className: "bg-amber-100 text-amber-800",
    },
    payment_verified: {
      label: "Lunas",
      className: "bg-emerald-100 text-emerald-800",
    },
    payment_rejected: {
      label: "Ditolak",
      className: "bg-rose-100 text-rose-800",
    },
  };

export const AdminRegistrantListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<RegistrantsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<RegistrantListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Sync state if URL searchParams change
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
      setPage(1);
    }
  }, [searchParams, statusFilter]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRegistrants({
        status: statusFilter,
        search: activeSearch,
        page,
        pageSize: 15,
      });
      setData(res);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data pendaftar",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, activeSearch, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    if (val === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", val);
    }
    setSearchParams(searchParams);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteRegistrant(deletingItem.id);
      toast.success(
        `Pendaftar ${deletingItem.registration_number} berhasil dihapus`,
      );
      setDeletingItem(null);
      fetchData();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menghapus pendaftar",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-primary)]" />
            Daftar Seluruh Pendaftar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola, telusuri, dan periksa data calon siswa PPDB TAUD Abu Ayyub
            TP 2027/2028.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            {data ? `${data.total} Pendaftar` : "..."}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Perbarui
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nomor pendaftaran, nama calon siswa, atau orang tua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 w-full sm:w-[240px] rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading && (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
            <span className="text-xs">Memuat daftar pendaftar...</span>
          </div>
        )}

        {!loading && !error && (!data || data.items.length === 0) && (
          <div className="p-16 text-center space-y-2 text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              Tidak ada pendaftar ditemukan
            </p>
            <p className="text-xs max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "Tidak ada data pendaftar yang cocok dengan filter atau kata kunci pencarian."
                : "Belum ada pendaftar yang masuk ke sistem."}
            </p>
          </div>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
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
                    Orang Tua / Wali
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Status Pendaftaran
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Pembayaran
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Tgl Masuk
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => {
                  const regBadge = REG_STATUS_BADGES[item.status] || {
                    label: item.status,
                    className: "bg-slate-100 text-slate-700",
                  };
                  const payBadge = PAY_STATUS_BADGES[item.payment_status] || {
                    label: item.payment_status,
                    className: "bg-slate-100 text-slate-700",
                  };
                  const formattedDate = new Date(
                    item.created_at,
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-bold text-slate-900 tracking-tight font-mono text-sm">
                        {item.registration_number}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {item.child_name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex flex-col">
                          <span>{item.parent_name}</span>
                          <a
                            href={`https://wa.me/${item.whatsapp_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {item.whatsapp_number}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${regBadge.className}`}
                        >
                          {regBadge.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${payBadge.className}`}
                        >
                          {payBadge.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            >
                              <span className="sr-only">Buka menu aksi</span>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/admin/pendaftar/${item.id}`}
                                className="flex items-center gap-2 w-full text-slate-700 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-slate-500" />
                                <span>Lihat Detail</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingItem(item)}
                              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                              <span>Hapus Pendaftar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>
                Menampilkan {(data.page - 1) * data.pageSize + 1} -{" "}
                {Math.min(data.page * data.pageSize, data.total)} dari{" "}
                {data.total} pendaftar
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
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
                  }
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
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              Hapus Pendaftar
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2 space-y-2">
              <span>
                Apakah Anda yakin ingin menghapus data calon siswa{" "}
                <strong className="text-slate-900">{deletingItem?.child_name}</strong> (No. Reg:{" "}
                <strong className="text-slate-900">{deletingItem?.registration_number}</strong>)?
              </span>
              <span className="text-xs text-rose-600 font-medium block">
                Peringatan: Tindakan ini permanen. Semua berkas, pembayaran, dan formulir pendaftar ini akan dihapus dari sistem.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Ya, Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRegistrantListPage;
