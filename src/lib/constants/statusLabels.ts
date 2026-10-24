export interface StatusMeta {
  label: string;
  description: string;
  badgeClassName: string;
}

export const REGISTRATION_STATUS_LABELS: Record<string, StatusMeta> = {
  draft: {
    label: "Draf Pendaftaran",
    description: "Pendaftaran awal telah dibuat namun belum menyelesaikan pembayaran.",
    badgeClassName: "border-slate-300 text-slate-700 bg-slate-50",
  },
  awaiting_payment: {
    label: "Menunggu Pembayaran",
    description: "Silakan lakukan pembayaran biaya pendaftaran dan unggah foto bukti transfer.",
    badgeClassName: "border-amber-300 text-amber-800 bg-amber-50",
  },
  awaiting_form: {
    label: "Pengisian Formulir",
    description: "Bukti transfer telah diterima. Silakan lengkapi formulir pendaftaran dan berkas KK & Akte.",
    badgeClassName: "border-blue-300 text-blue-800 bg-blue-50",
  },
  submitted: {
    label: "Formulir Terkirim",
    description: "Formulir dan berkas telah lengkap diterima. Menunggu verifikasi dari panitia PPDB.",
    badgeClassName: "border-emerald-300 text-emerald-800 bg-emerald-50",
  },
  under_review: {
    label: "Sedang Diverifikasi",
    description: "Panitia PPDB sedang memeriksa kelengkapan berkas dan data calon santri.",
    badgeClassName: "border-purple-300 text-purple-800 bg-purple-50",
  },
  accepted: {
    label: "Diterima (Lulus Seleksi)",
    description: "Selamat! Calon santri telah dinyatakan diterima di TAUD SaQu Abu Ayyub.",
    badgeClassName: "border-emerald-400 text-emerald-900 bg-emerald-100 font-bold",
  },
  rejected: {
    label: "Belum Diterima",
    description: "Mohon maaf, pendaftaran calon santri belum dapat diterima untuk periode ini.",
    badgeClassName: "border-red-300 text-red-800 bg-red-50",
  },
  withdrawn: {
    label: "Dibatalkan",
    description: "Pendaftaran telah dibatalkan atas permintaan orang tua/wali santri.",
    badgeClassName: "border-gray-300 text-gray-700 bg-gray-50",
  },
};

export const PAYMENT_STATUS_LABELS: Record<string, StatusMeta> = {
  payment_pending: {
    label: "Belum Dibayar",
    description: "Biaya pendaftaran Rp300.000 belum ditransfer atau belum mengunggah bukti.",
    badgeClassName: "border-amber-300 text-amber-800 bg-amber-50",
  },
  payment_submitted: {
    label: "Bukti Transfer Diunggah",
    description: "Bukti transfer telah diunggah dan sedang dalam antrean verifikasi admin.",
    badgeClassName: "border-blue-300 text-blue-800 bg-blue-50",
  },
  payment_verified: {
    label: "Pembayaran Terverifikasi",
    description: "Pembayaran telah diverifikasi sah oleh admin panitia PPDB.",
    badgeClassName: "border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold",
  },
  payment_rejected: {
    label: "Pembayaran Ditolak",
    description: "Bukti transfer tidak sesuai. Silakan unggah ulang bukti transfer yang valid.",
    badgeClassName: "border-red-300 text-red-800 bg-red-50",
  },
};

export function getRegistrationStatusMeta(status?: string): StatusMeta {
  if (!status) {
    return {
      label: "Tidak Diketahui",
      description: "Status pendaftaran belum dapat ditentukan.",
      badgeClassName: "border-gray-300 text-gray-700 bg-gray-50",
    };
  }
  return (
    REGISTRATION_STATUS_LABELS[status] || {
      label: status,
      description: "Status pendaftaran dalam proses.",
      badgeClassName: "border-gray-300 text-gray-700 bg-gray-50",
    }
  );
}

export function getPaymentStatusMeta(status?: string): StatusMeta {
  if (!status) {
    return {
      label: "Tidak Diketahui",
      description: "Status pembayaran belum tercatat.",
      badgeClassName: "border-gray-300 text-gray-700 bg-gray-50",
    };
  }
  return (
    PAYMENT_STATUS_LABELS[status] || {
      label: status,
      description: "Status pembayaran dalam proses.",
      badgeClassName: "border-gray-300 text-gray-700 bg-gray-50",
    }
  );
}
