function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const localStore = new MemoryStorage();
const sessionStore = new MemoryStorage();

Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: localStore,
    sessionStorage: sessionStore,
  },
  writable: true,
});

import {
  saveSessionCredentials,
  getSessionCredentials,
  clearSessionCredentials,
  saveLocalFormDraft,
  getLocalFormDraft,
  clearLocalFormDraft,
} from "../../../lib/sessionCredentials.ts";

console.log("Running sessionCredentials & localFormDraft tests...");

// 1. Saves credentials to localStorage so closing tab (clearing sessionStorage) keeps session
saveSessionCredentials("ppdb-2027-0001", "abcd1234", "Fatih");
sessionStore.clear(); // Simulate tab close
const creds = getSessionCredentials();
assert(creds !== null, "Credentials should persist in localStorage after tab close");
assert(creds.registrationNumber === "PPDB-2027-0001", "Registration number should be normalized");
assert(creds.accessCode === "ABCD1234", "Access code should be normalized");
assert(creds.childName === "Fatih", "Child name should be preserved");

// 2. Subsequent save without childName keeps existing childName for same registrationNumber
saveSessionCredentials("PPDB-2027-0001", "ABCD1234");
assert(getSessionCredentials()?.childName === "Fatih", "Child name should be retained on re-save");

// 3. Local form draft is isolated per registrationNumber and survives tab close
saveLocalFormDraft("PPDB-2027-0001", { child: { full_name: "Fatih", nickname: "Atih" } }, 2);
saveLocalFormDraft("PPDB-2027-0002", { child: { full_name: "Aisyah" } }, 1);

const draft1 = getLocalFormDraft<{ child: { full_name: string; nickname: string } }>("ppdb-2027-0001");
const draft2 = getLocalFormDraft<{ child: { full_name: string } }>("PPDB-2027-0002");
assert(draft1?.currentStep === 2, "Draft 1 step should be 2");
assert(draft1?.formData.child.nickname === "Atih", "Draft 1 nickname should be preserved");
assert(draft2?.currentStep === 1, "Draft 2 step should be 1");

// 4. Clearing draft and credentials works cleanly
clearLocalFormDraft("PPDB-2027-0001");
assert(getLocalFormDraft("PPDB-2027-0001") === null, "Draft 1 should be cleared");
assert(getLocalFormDraft("PPDB-2027-0002") !== null, "Draft 2 should remain untouched");

clearSessionCredentials();
assert(getSessionCredentials() === null, "Credentials should be cleared");

console.log("All sessionCredentials & localFormDraft tests passed!");
