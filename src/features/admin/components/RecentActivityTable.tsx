import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AuditEventItem } from '../services/adminDashboard';
import { Clock, History } from 'lucide-react';

interface RecentActivityTableProps {
  events: AuditEventItem[];
  loading?: boolean;
}

const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  registration_created: { label: 'Pendaftaran Dibuat', variant: 'secondary' },
  access_code_verified: { label: 'Verifikasi Kode Akses', variant: 'outline' },
  access_code_failed: { label: 'Akses Gagal', variant: 'destructive' },
  payment_proof_submitted: { label: 'Bukti Pembayaran Diunggah', variant: 'secondary' },
  payment_verified: { label: 'Pembayaran Diterima', variant: 'default' },
  payment_rejected: { label: 'Pembayaran Ditolak', variant: 'destructive' },
  document_uploaded: { label: 'Dokumen Diunggah', variant: 'secondary' },
  form_draft_saved: { label: 'Draf Formulir Disimpan', variant: 'outline' },
  form_submitted: { label: 'Formulir Lengkap Terkirim', variant: 'default' },
  registrant_accepted: { label: 'Pendaftar Diterima', variant: 'default' },
  registrant_rejected: { label: 'Pendaftar Ditolak', variant: 'destructive' },
  config_updated: { label: 'Pengaturan Diperbarui', variant: 'secondary' },
};

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Memuat aktivitas terbaru...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
        <History className="w-8 h-8 text-slate-300" />
        Belum ada aktivitas tercatat di sistem.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[180px] font-semibold text-slate-700">Waktu</TableHead>
            <TableHead className="font-semibold text-slate-700">Aksi</TableHead>
            <TableHead className="font-semibold text-slate-700">Pelaku</TableHead>
            <TableHead className="font-semibold text-slate-700">Entitas</TableHead>
            <TableHead className="font-semibold text-slate-700">Detail Ringkas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((ev) => {
            const meta = ev.metadata || {};
            const actionInfo = ACTION_LABELS[ev.action] || {
              label: ev.action.replace(/_/g, ' '),
              variant: 'outline' as const,
            };

            const formattedTime = new Date(ev.created_at).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            let detail = '';
            if (meta.registration_number) detail += `No: ${meta.registration_number} `;
            if (meta.child_name) detail += `(${meta.child_name}) `;
            if (meta.review_notes) detail += `"${meta.review_notes}" `;
            if (meta.document_type) detail += `Tipe: ${meta.document_type} `;
            if (meta.key) detail += `Kunci: ${meta.key} `;
            if (!detail && Object.keys(meta).length > 0) {
              detail = JSON.stringify(meta);
            }

            return (
              <TableRow key={ev.id} className="hover:bg-slate-50/80">
                <TableCell className="text-xs text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {formattedTime}
                </TableCell>
                <TableCell>
                  <Badge variant={actionInfo.variant} className="text-xs font-normal">
                    {actionInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-700 font-medium capitalize">
                  {ev.actor_type === 'admin' ? 'Administrator' : ev.actor_type}
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-mono">
                  {ev.entity_type}
                </TableCell>
                <TableCell className="text-xs text-slate-600 truncate max-w-xs">
                  {detail || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentActivityTable;
