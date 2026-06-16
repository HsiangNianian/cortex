// Client-side profile sync — upload/download ability profiles to/from cloud
// Premium users get cloud backup; non-premium users use localStorage only.

export interface StoredAbilityProfile {
  overall: { theta: number; standardError: number }
  byType: {
    logic: { theta: number; standardError: number } | null
    math: { theta: number; standardError: number } | null
    vocab: { theta: number; standardError: number } | null
    event: { theta: number; standardError: number } | null
  }
  testDate: string
  questionsAnswered: number
}

const PROFILE_KEY = "cortex:ability-profile"

/** Load the ability profile from localStorage. */
export function loadProfile(): StoredAbilityProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAbilityProfile
  } catch {
    return null
  }
}

/** Save the ability profile to localStorage. */
export function saveProfile(profile: StoredAbilityProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* storage full — non-critical */
  }
}

/** Clear the ability profile from localStorage. */
export function clearProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* ignore */
  }
}

/** Upload the profile to cloud (premium users). Fire-and-forget. */
export async function uploadProfile(
  licenseKey: string,
  profile: StoredAbilityProfile,
): Promise<boolean> {
  try {
    const res = await fetch("/api/profile-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${licenseKey}`,
      },
      body: JSON.stringify({
        profile: {
          overall: profile.overall,
          byType: profile.byType,
          questionsAnswered: profile.questionsAnswered,
        },
      }),
    })
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}

/** Download the profile from cloud (premium users). Returns null if none exists. */
export async function downloadProfile(
  licenseKey: string,
): Promise<StoredAbilityProfile | null> {
  try {
    const res = await fetch("/api/profile-sync", {
      headers: { Authorization: `Bearer ${licenseKey}` },
    })
    const data = await res.json()
    if (data.profile) return data.profile as StoredAbilityProfile
    return null
  } catch {
    return null
  }
}
