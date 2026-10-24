import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, History } from "lucide-react";

interface AuditEvent {
  id: string;
  actor_id: string | null;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface AuditLogSectionProps {
  events: AuditEvent[];
}

const ACTION_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  registration_created: { label: "Pendaftaran Dibuat", variant: "secondary" },
  access_code_verified: { label: "Akses Terverifikasi", variant: "outline" },
  access_code_failed: { label: "Akses Gagal", variant: "destructive" },
  payment_proof_submitted: {
    label: "Bukti Pembayaran Diunggah",
    variant: "secondary",
  },
  payment_verified: { label: "Pembayaran Diterima", variant: "default" },
  payment_rejected: { label: "Pembayaran Ditolak", variant: "destructive" },
  document_uploaded: { label: "Dokumen Diunggah", variant: "secondary" },
  form_draft_saved: { label: "Draf Disimpan", variant: "outline" },
  form_submitted: { label: "Formulir Dikirim", variant: "default" },
  registrant_accepted: { label: "Siswa Diterima", variant: "default" },
  registrant_rejected: { label: "Pendaftar Ditolak", variant: "destructive" },
  status_updated: { label: "Status Diperbarui", variant: "secondary" },
};

export const AuditLogSection: React.FC<AuditLogSectionProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400 border border-slate-200 rounded-xl bg-white">
        <History className="w-6 h-6 mx-auto mb-2 text-slate-300" />
        Belum ada riwayat audit tercatat untuk pendaftaran ini.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[180px] font-semibold text-slate-700">
              Waktu
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Aksi</TableHead>
            <TableHead className="font-semibold text-slate-700">
              Pelaku
            </TableHead>
            <TableHead className="font-semibold text-slate-700">
              Catatan / Detail
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((ev) => {
            const meta = ev.metadata || {};
            const item = ACTION_MAP[ev.action] || {
              label: ev.action.replace(/_/g, " "),
              variant: "outline" as const,
            };

            const formattedTime = new Date(ev.created_at).toLocaleString(
              "id-ID",
              {
                dateStyle: "medium",
                timeStyle: "short",
              },
            );

            let details = "";
            if (meta.notes) details += String(meta.notes) + " ";
            if (meta.review_notes) details += `"${meta.review_notes}" `;
            if (meta.document_type) details += `Berkas: ${meta.document_type} `;
            if (meta.new_status) details += `Status baru: ${meta.new_status} `;
            if (!details && Object.keys(meta).length > 0) {
              details = JSON.stringify(meta);
            }

            return (
              <TableRow key={ev.id} className="hover:bg-slate-50/80">
                <TableCell className="text-xs text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {formattedTime}
                </TableCell>
                <TableCell>
                  <Badge variant={item.variant} className="text-xs font-normal">
                    {item.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-700 capitalize">
                  {ev.actor_type === "admin" ? "Administrator" : ev.actor_type}
                </TableCell>
                <TableCell className="text-xs text-slate-600 truncate max-w-sm">
                  {details || "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditLogSection;
