import type { AbilityProfile } from "./irt/types";

const PROFILE_KEY = "cortex:ability-profile";

export function loadProfile(): AbilityProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AbilityProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: AbilityProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* storage full – non‑critical */
  }
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}
