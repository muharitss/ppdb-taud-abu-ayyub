/**
 * Persistent storage helper for active registration credentials and form drafts.
 * Uses localStorage (with sessionStorage fallback) so closing the tab or
 * switching mobile apps does not lose the applicant's active registration.
 */

const STORAGE_KEY = "ppdb_active_credentials";
const DRAFT_PREFIX = "ppdb_draft_";

export interface SessionCredentials {
  registrationNumber: string;
  accessCode: string;
  childName?: string;
  paymentStatus?: string;
  timestamp: number;
}

export interface LocalFormDraft<T = Record<string, unknown>> {
  formData: T;
  currentStep: number;
  updatedAt: number;
}

export function saveSessionCredentials(
  registrationNumber: string,
  accessCode: string,
  childName?: string,
  paymentStatus?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const cleanReg = registrationNumber.trim().toUpperCase();
    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanReg || !cleanCode) return;

    const existing = getSessionCredentials();
    const sameReg = existing?.registrationNumber === cleanReg;
    const resolvedChildName =
      childName?.trim() ||
      (sameReg ? existing.childName : undefined);
    const resolvedPaymentStatus =
      paymentStatus ||
      (sameReg ? existing.paymentStatus : undefined);

    const payload: SessionCredentials = {
      registrationNumber: cleanReg,
      accessCode: cleanCode,
      ...(resolvedChildName ? { childName: resolvedChildName } : {}),
      ...(resolvedPaymentStatus ? { paymentStatus: resolvedPaymentStatus } : {}),
      timestamp: Date.now(),
    };
    const serialized = JSON.stringify(payload);
    window.localStorage?.setItem(STORAGE_KEY, serialized);
    window.sessionStorage?.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore storage quota or security errors
  }
}

export function getResumeUrl(creds: SessionCredentials | null): string {
  if (!creds) return "/daftar";
  if (creds.paymentStatus === "payment_submitted" || creds.paymentStatus === "payment_verified") {
    return `/daftar/formulir/${encodeURIComponent(creds.registrationNumber)}`;
  }
  return `/bayar/${encodeURIComponent(creds.registrationNumber)}`;
}

export function getSessionCredentials(): SessionCredentials | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage?.getItem(STORAGE_KEY) ||
      window.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.registrationNumber === "string" &&
      typeof parsed.accessCode === "string"
    ) {
      return parsed as SessionCredentials;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function clearSessionCredentials(registrationNumber?: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSessionCredentials();
    const cleanReg = (registrationNumber || current?.registrationNumber)?.trim().toUpperCase();

    window.localStorage?.removeItem(STORAGE_KEY);
    window.sessionStorage?.removeItem(STORAGE_KEY);

    if (cleanReg) {
      clearLocalFormDraft(cleanReg);
    }

    // Also remove draft keys matching the registration or all if no active registration
    if (window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(DRAFT_PREFIX)) {
          if (!cleanReg || key === `${DRAFT_PREFIX}${cleanReg}`) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }
  } catch {
    // Ignore errors
  }
}

export function saveLocalFormDraft<T>(
  registrationNumber: string,
  formData: T,
  currentStep: number
): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const cleanReg = registrationNumber.trim().toUpperCase();
    if (!cleanReg) return;
    const payload: LocalFormDraft<T> = {
      formData,
      currentStep,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(`${DRAFT_PREFIX}${cleanReg}`, JSON.stringify(payload));
  } catch {
    // Ignore storage errors
  }
}

export function getLocalFormDraft<T>(registrationNumber: string): LocalFormDraft<T> | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const cleanReg = registrationNumber.trim().toUpperCase();
    if (!cleanReg) return null;
    const raw = window.localStorage.getItem(`${DRAFT_PREFIX}${cleanReg}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.formData) {
      return parsed as LocalFormDraft<T>;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function clearLocalFormDraft(registrationNumber: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const cleanReg = registrationNumber.trim().toUpperCase();
    if (!cleanReg) return;
    window.localStorage.removeItem(`${DRAFT_PREFIX}${cleanReg}`);
  } catch {
    // Ignore errors
  }
}
