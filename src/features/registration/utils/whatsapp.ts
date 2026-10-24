import { ADMIN_CONTACTS } from "../../../config/schoolInfo.ts";

export interface BuildWaMessageParams {
  childName?: string;
  registrationNumber: string;
  accessCode?: string;
  statusUrl?: string;
}

export function buildWaMessage({
  childName,
  registrationNumber,
  accessCode,
  statusUrl,
}: BuildWaMessageParams): string {
  const finalStatusUrl =
    statusUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/status`
      : "https://ppdb-taud-abu-ayyub.vercel.app/status");

  let msg = `Assalamu'alaikum Admin PPDB TAUD SaQu Abu Ayyub,\n\nAlhamdulillah formulir pendaftaran santri baru TP.2027/2028 telah selesai diisi.\n\n`;
  if (childName) {
    msg += `Nama Santri: ${childName}\n`;
  }
  msg += `Nomor Pendaftaran: ${registrationNumber}\n`;
  if (accessCode) {
    msg += `Kode Akses: ${accessCode}\n`;
  }
  msg += `\nCek Status Pendaftaran:\n${finalStatusUrl}\n\nMohon untuk diverifikasi berkas pendaftaran kami. Jazaakumullahu khairan.`;
  return msg;
}

export function buildWaLink(
  params: BuildWaMessageParams,
  whatsappNumber = ADMIN_CONTACTS.primary.whatsappNumber
): string {
  const message = buildWaMessage(params);
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
