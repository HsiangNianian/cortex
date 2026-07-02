// Local ability-profile storage (localStorage).
// Shared across both branches — not premium-specific.

export interface StoredAbilityProfile {
  overall: { theta: number; standardError: number };
  byType: {
    logic: { theta: number; standardError: number } | null;
    math: { theta: number; standardError: number } | null;
    vocab: { theta: number; standardError: number } | null;
    event: { theta: number; standardError: number } | null;
  };
  testDate: string;
  questionsAnswered: number;
}

const PROFILE_KEY = "cortex:ability-profile";

/** Load the ability profile from localStorage. */
export function loadProfile(): StoredAbilityProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAbilityProfile;
  } catch {
    return null;
  }
}

/** Save the ability profile to localStorage. */
export function saveProfile(profile: StoredAbilityProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* storage full — non-critical */
  }
}

/** Clear the ability profile from localStorage. */
export function clearProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}
