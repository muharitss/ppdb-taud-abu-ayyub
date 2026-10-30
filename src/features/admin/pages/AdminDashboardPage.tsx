import React, { useEffect, useState, useCallback, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteRegistrant,
  getRegistrants,
  type RegistrantListItem,
  type RegistrantsResult,
} from "../services/adminRegistrants";
import {
  getDashboardStats,
  type DashboardStats,
} from "../services/adminDashboard";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  Phone,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
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

const REG_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  draft: {
    label: "Draf",
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-700 border-slate-200/80",
  },
  awaiting_payment: {
    label: "Menunggu Pembayaran",
    dot: "bg-amber-400",
    badge: "bg-amber-50/70 text-amber-800 border-amber-200/80",
  },
  awaiting_form: {
    label: "Menunggu Formulir",
    dot: "bg-blue-400",
    badge: "bg-blue-50/70 text-blue-800 border-blue-200/80",
  },
  submitted: {
    label: "Formulir Masuk",
    dot: "bg-purple-500",
    badge: "bg-purple-50/70 text-purple-800 border-purple-200/80",
  },
  under_review: {
    label: "Sedang Ditinjau",
    dot: "bg-indigo-400",
    badge: "bg-indigo-50/70 text-indigo-800 border-indigo-200/80",
  },
  accepted: {
    label: "Diterima",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50/80 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    dot: "bg-rose-400",
    badge: "bg-rose-50/70 text-rose-800 border-rose-200/80",
  },
};

const PAY_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  payment_pending: {
    label: "Belum Bayar",
    dot: "bg-slate-300",
    text: "text-slate-500",
  },
  payment_submitted: {
    label: "Verifikasi Bukti",
    dot: "bg-amber-500",
    text: "text-amber-800 font-medium",
  },
  payment_verified: {
    label: "Lunas",
    dot: "bg-emerald-500",
    text: "text-emerald-700 font-medium",
  },
  payment_rejected: {
    label: "Bukti Ditolak",
    dot: "bg-rose-500",
    text: "text-rose-700 font-medium",
  },
};

const FILTER_TABS = [
  { id: "all", label: "Semua" },
  { id: "awaiting_form", label: "Pengisian Formulir" },
  { id: "awaiting_payment", label: "Menunggu Bayar" },
  { id: "accepted", label: "Diterima" },
  { id: "rejected", label: "Ditolak" },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function cleanWhatsappNumber(raw: string): string {
  let cleaned = raw.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

function getInitials(name: string): string {
  if (!name) return "S";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [data, setData] = useState<RegistrantsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<RegistrantListItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setActiveSearch(searchTerm);
        setPage(1);
      });
    }, 280);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadStats = useCallback(async () => {
    try {
      const s = await getDashboardStats();
      setStats(s);
    } catch {
      // Non-blocking for list table
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const registrantsRes = await getRegistrants({
        status: statusFilter,
        search: activeSearch,
        page,
        pageSize,
      });
      setData(registrantsRes);
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

  const handleTabChange = (id: string) => {
    setStatusFilter(id);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setPage(1);
  };

  const pendingVerificationCount =
    (stats?.paymentSubmitted ?? 0) + (stats?.submitted ?? 0);

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteRegistrant(deletingItem.id);
      toast.success(
        `Pendaftar ${deletingItem.registration_number} berhasil dihapus`,
      );
      setDeletingItem(null);
      loadStats();
      if (data && data.items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchData();
      }
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
      {/* 1. Header Bar: Minimalist Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pendaftar Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau dan kelola pendaftaran calon siswa TAUD SaQu Abu Ayyub.
          </p>
        </div>
      </div>

      {/* 2. Minimalist KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <button
          type="button"
          onClick={() => handleTabChange("all")}
          className={`text-left p-4 rounded-xl border bg-white transition-all ${
            statusFilter === "all"
              ? "border-slate-900 ring-1 ring-slate-900 shadow-xs"
              : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Pendaftar
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats ? stats.total : (data?.total ?? "-")}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Seluruh akun terdaftar
          </p>
        </button>

        {/* Perlu Tindakan */}
        {/* <button
          type="button"
          onClick={() => handleTabChange("needs_action")}
          className={`text-left p-4 rounded-xl border bg-white transition-all ${
            statusFilter === "needs_action"
              ? "border-amber-500 ring-1 ring-amber-500 shadow-xs"
              : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Perlu Verifikasi
            </span>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{stats ? pendingVerificationCount : "-"}</span>
            {pendingVerificationCount > 0 && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">
                Antrean
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bukti bayar & formulir masuk
          </p>
        </button> */}

        {/* Menunggu Formulir */}
        <button
          type="button"
          onClick={() => handleTabChange("awaiting_form")}
          className={`text-left p-4 rounded-xl border bg-white transition-all ${
            statusFilter === "awaiting_form"
              ? "border-blue-500 ring-1 ring-blue-500 shadow-xs"
              : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Pengisian Berkas
            </span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats ? stats.awaitingForm : "-"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Lunas, isi data siswa
          </p>
        </button>

        {/* Diterima */}
        <button
          type="button"
          onClick={() => handleTabChange("accepted")}
          className={`text-left p-4 rounded-xl border bg-white transition-all ${
            statusFilter === "accepted"
              ? "border-emerald-600 ring-1 ring-emerald-600 shadow-xs"
              : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Siswa Diterima
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {stats ? stats.accepted : "-"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lolos seleksi masuk</p>
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search Box */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari siswa, orang tua, no. registrasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-white border-slate-200 rounded-lg placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-1.5 border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex-shrink-0"
            >
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-700">Filter</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1">
              {FILTER_TABS.map((tab) => {
                const isActive = statusFilter === tab.id;
                const badgeCount =
                  tab.id === "needs_action" && pendingVerificationCount > 0
                    ? pendingVerificationCount
                    : null;

                return (
                  <DropdownMenuItem
                    key={tab.id}
                    onSelect={() => handleTabChange(tab.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {badgeCount !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-white text-slate-900 font-bold"
                            : "bg-amber-100 text-amber-900 font-bold"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

        {/* Total count info */}
        <div className="text-xs text-slate-500 self-center hidden md:block flex-shrink-0 ml-auto">
          {data ? (
            <span>
              Total <strong>{data.total}</strong> data ditemukan
            </span>
          ) : null}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            className="text-xs h-7 px-2.5 bg-white border-rose-200 text-rose-800 hover:bg-rose-50"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* 4. Professional Minimalist Registrant Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2.5 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
            <span className="text-xs font-medium text-slate-500">
              Memuat data pendaftar...
            </span>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs sm:text-sm px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <p className="font-medium text-slate-800">
              Tidak ada data pendaftar ditemukan
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeSearch || statusFilter !== "all"
                ? "Tidak ada data yang cocok dengan kriteria filter atau kata kunci saat ini."
                : "Belum ada pendaftaran calon siswa yang masuk ke dalam sistem."}
            </p>
            {(activeSearch || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearSearch();
                  setStatusFilter("all");
                }}
                className="mt-4 text-xs h-8"
              >
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-slate-50/75 border-b border-slate-200/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-3 px-4 font-semibold text-xs text-slate-700 w-[280px]">
                      Calon Siswa
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-xs text-slate-700">
                      Kontak
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-xs text-slate-700">
                      Pembayaran
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-xs text-slate-700">
                      Status Pendaftaran
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-xs text-slate-700 whitespace-nowrap">
                      Waktu Daftar
                    </TableHead>
                    <TableHead className="py-3 px-4 font-semibold text-xs text-slate-700 text-right w-[80px]">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {data.items.map((item) => {
                    const regBadge = REG_STATUS_CONFIG[item.status] || {
                      label: item.status,
                      dot: "bg-slate-400",
                      badge: "bg-slate-50 text-slate-700 border-slate-200",
                    };

                    const payBadge = PAY_STATUS_CONFIG[item.payment_status] || {
                      label: item.payment_status || "Belum Bayar",
                      dot: "bg-slate-300",
                      text: "text-slate-600",
                    };

                    const initials = getInitials(item.child_name);
                    const waClean = cleanWhatsappNumber(item.whatsapp_number);

                    return (
                      <TableRow
                        key={item.id}
                        onClick={() => navigate(`/admin/pendaftar/${item.id}`)}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Calon Siswa: Name & Reg Number */}
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 font-semibold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate group-hover:text-[var(--color-primary)] transition-colors">
                                {item.child_name || "Tanpa Nama"}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400 tracking-tight">
                                {item.registration_number}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Kontak WhatsApp */}
                        <TableCell className="py-3.5 px-4">
                          <div className="text-xs">
                            {waClean && item.whatsapp_number ? (
                              <a
                                href={`https://wa.me/${waClean}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Chat WhatsApp"
                                className="font-mono text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors"
                              >
                                {item.whatsapp_number}
                              </a>
                            ) : (
                              <span className="font-mono text-slate-400 text-[11px]">
                                {item.whatsapp_number || "-"}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status Pembayaran */}
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${payBadge.dot}`}
                            />
                            <span className={payBadge.text}>
                              {payBadge.label}
                            </span>
                          </div>
                        </TableCell>

                        {/* Status Pendaftaran Badge */}
                        <TableCell className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${regBadge.badge}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${regBadge.dot}`}
                            />
                            {regBadge.label}
                          </span>
                        </TableCell>

                        {/* Waktu Daftar */}
                        <TableCell className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(item.created_at)}
                        </TableCell>

                        {/* Aksi */}
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                                onSelect={() => setDeletingItem(item)}
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
            </div>

            {/* 5. Minimalist Pagination Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Menampilkan{" "}
                <strong className="font-semibold text-slate-800">
                  {Math.min((data.page - 1) * data.pageSize + 1, data.total)}
                </strong>
                -
                <strong className="font-semibold text-slate-800">
                  {Math.min(data.page * data.pageSize, data.total)}
                </strong>{" "}
                dari{" "}
                <strong className="font-semibold text-slate-800">
                  {data.total}
                </strong>{" "}
                siswa
              </div>

              {data.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 mr-1">
                    Hal. {data.page} dari {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={data.page <= 1}
                    className="h-7 px-2 text-xs border-slate-200"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }
                    disabled={data.page >= data.totalPages}
                    className="h-7 px-2 text-xs border-slate-200"
                  >
                    Selanjutnya
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Dialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingItem(null);
        }}
      >
        <DialogContent className="sm:max-w-md p-6 gap-5 bg-white border border-slate-200 shadow-2xl rounded-2xl">
          <DialogHeader className="gap-2 sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                  Hapus Data Pendaftar
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Registrant detail preview */}
          {deletingItem && (
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Calon Siswa:</span>
                <span className="font-semibold text-slate-900">
                  {deletingItem.child_name || "Tanpa Nama"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">No. Registrasi:</span>
                <span className="font-mono font-medium text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {deletingItem.registration_number}
                </span>
              </div>
              {deletingItem.parent_name && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Wali / Orang Tua:</span>
                  <span className="text-slate-700 font-medium">
                    {deletingItem.parent_name}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>
              Semua berkas dokumen, bukti pembayaran, dan formulir pendaftaran milik siswa ini akan dihapus seluruhnya dari database.
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingItem(null)}
              disabled={isDeleting}
              className="text-xs sm:text-sm h-9 px-4 font-medium"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="text-xs sm:text-sm h-9 px-4 font-medium"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Ya, Hapus Pendaftar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
