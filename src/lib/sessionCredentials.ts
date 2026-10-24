/**
 * Safe in-session storage helper for active registration credentials.
 * Scoped strictly to the browser tab's sessionStorage (cleared on tab close).
 * Prevents mobile users from lockout when app switches trigger page reload.
 */

const STORAGE_KEY = "ppdb_active_credentials";

export interface SessionCredentials {
  registrationNumber: string;
  accessCode: string;
  timestamp: number;
}

export function saveSessionCredentials(
  registrationNumber: string,
  accessCode: string
): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    const cleanReg = registrationNumber.trim().toUpperCase();
    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanReg || !cleanCode) return;
    const payload: SessionCredentials = {
      registrationNumber: cleanReg,
      accessCode: cleanCode,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or security errors
  }
}

export function getSessionCredentials(): SessionCredentials | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
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

export function clearSessionCredentials(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}
