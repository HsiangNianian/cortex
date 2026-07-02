/**
 * Premium integration seam — server/logic layer.
 *
 * Core files import premium-dependent logic from this module so they stay
 * identical across branches:
 *   - dev branch:  real implementation (cloud sync, license, free-test limit)
 *   - main branch: no-op stubs (free-only, local storage, no monetization)
 */

// Local profile storage — shared (identical in both branches).
export { loadProfile, saveProfile, clearProfile, type StoredAbilityProfile } from "./profile-local";

// Cloud profile sync — premium only.
export { uploadProfile, downloadProfile } from "./sync/profile-sync";
export { performSync, type SyncResult, type LocalHistoryEntry } from "./sync/sync-engine";

// ─── Free-test limit (7-day / 3-test window for non-premium users) ───

export const FREE_LIMIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_FREE_TESTS = 3;
const FREE_TEST_TIMESTAMPS_KEY = "cortex:free-test-timestamps";
const OLD_FREE_TEST_KEY = "cortex:last-free-test";

function readTimestamps(): number[] {
  const raw = localStorage.getItem(FREE_TEST_TIMESTAMPS_KEY);
  const timestamps: number[] = raw ? JSON.parse(raw) : [];
  return Array.isArray(timestamps) ? timestamps : [];
}

function saveTimestamps(timestamps: number[]): void {
  const now = Date.now();
  const windowStart = now - FREE_LIMIT_WINDOW_MS;
  const valid = timestamps.filter((ts) => typeof ts === "number" && ts > windowStart);
  localStorage.setItem(FREE_TEST_TIMESTAMPS_KEY, JSON.stringify(valid));
}

/** Migrate old single-timestamp key into the new array, then remove it. */
function migrateOldCooldown(): void {
  try {
    const oldRaw = localStorage.getItem(OLD_FREE_TEST_KEY);
    if (!oldRaw) return;
    const oldTs = parseInt(oldRaw, 10);
    if (isNaN(oldTs)) {
      localStorage.removeItem(OLD_FREE_TEST_KEY);
      return;
    }
    if (Date.now() - oldTs < FREE_LIMIT_WINDOW_MS) {
      const timestamps = readTimestamps();
      if (!timestamps.includes(oldTs)) {
        timestamps.push(oldTs);
        saveTimestamps(timestamps);
      }
    }
    localStorage.removeItem(OLD_FREE_TEST_KEY);
  } catch {
    /* ignore */
  }
}

export function getFreeTestCooldownEndsAt(): number | null {
  try {
    migrateOldCooldown();
    const timestamps = readTimestamps();
    const now = Date.now();
    const windowStart = now - FREE_LIMIT_WINDOW_MS;
    const valid = timestamps.filter((ts) => ts > windowStart);
    if (valid.length >= MAX_FREE_TESTS) {
      const oldest = Math.min(...valid);
      return oldest + FREE_LIMIT_WINDOW_MS;
    }
    return null;
  } catch {
    return null;
  }
}

export function recordFreeTest(): void {
  try {
    migrateOldCooldown();
    const timestamps = readTimestamps();
    timestamps.push(Date.now());
    saveTimestamps(timestamps);
  } catch {
    /* ignore */
  }
}

export function getFreeTestUsedCount(): number {
  try {
    migrateOldCooldown();
    const timestamps = readTimestamps();
    const now = Date.now();
    const windowStart = now - FREE_LIMIT_WINDOW_MS;
    return timestamps.filter((ts) => ts > windowStart).length;
  } catch {
    return 0;
  }
}

/** Clear free-test timestamps (called when a user becomes premium). */
export function clearFreeTestTimestamps(): void {
  try {
    localStorage.removeItem(FREE_TEST_TIMESTAMPS_KEY);
    localStorage.removeItem(OLD_FREE_TEST_KEY);
  } catch {
    /* ignore */
  }
}

// ─── License validation (premium only) ───

/**
 * Validate the license server-side before bypassing the free limit.
 * Returns true if valid or on transient network error (don't block users).
 */
export async function validateLicenseBeforeStart(licenseKey: string): Promise<boolean> {
  try {
    const deviceId = (() => {
      try {
        return localStorage.getItem("cortex:device-id") ?? "anon";
      } catch {
        return "anon";
      }
    })();
    const res = await fetch("/api/license/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey, deviceId }),
    });
    const data = await res.json();
    return data.valid === true;
  } catch {
    // Network error — allow through (don't block legitimate users).
    return true;
  }
}
