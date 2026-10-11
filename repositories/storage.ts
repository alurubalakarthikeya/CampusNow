import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local storage primitives.
 *
 * Every key the app owns is declared here, so nothing is written under an
 * undocumented name and nothing is duplicated across two keys. Reads and
 * writes never throw: a device that refuses storage must degrade to "nothing
 * saved yet", not crash a screen. Stored documents are versioned so a shape
 * change can be migrated instead of silently misinterpreted.
 *
 * AsyncStorage is prototype/offline storage only. It is not encrypted, so no
 * credential, session token or private address belongs here.
 */
export const STORAGE_KEYS = {
  /** Verified student session (email, USN, name, ID photo reference) */
  session: 'campusnow/session-v1',
  /** Theme and display preferences */
  theme: 'campusnow/theme-v1',
  /** Reports saved on this device, as `{ version, reports }` */
  reports: 'campusnow/reports-v1',
  /** The in-progress report, as `{ version, draft }` */
  draft: 'campusnow/report-draft-v1',
  /** Device push token */
  pushToken: 'campusnow/push-token-v1',
  /** Superseded combined store, read once when migrating older installs */
  legacyStore: 'campusnow/store-v1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Reads and parses a document, or null when it is missing or unusable. */
export async function readJson<T>(key: StorageKey | string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    // A malformed or unreadable document is treated as absent. The caller
    // decides what a fresh state looks like.
    return null;
  }
}

/** Writes a document. Returns false when the device refused the write. */
export async function writeJson(key: StorageKey | string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function removeKey(key: StorageKey | string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
