// Client-side profile sync — upload/download ability profiles to/from cloud
// Premium users get cloud backup; non-premium users use localStorage only.

import type { StoredAbilityProfile } from "@/lib/profile-local";

export {
  loadProfile,
  saveProfile,
  clearProfile,
  type StoredAbilityProfile,
} from "@/lib/profile-local";

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
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

/** Download the profile from cloud (premium users). Returns null if none exists. */
export async function downloadProfile(licenseKey: string): Promise<StoredAbilityProfile | null> {
  try {
    const res = await fetch("/api/profile-sync", {
      headers: { Authorization: `Bearer ${licenseKey}` },
    });
    const data = await res.json();
    if (data.profile) return data.profile as StoredAbilityProfile;
    return null;
  } catch {
    return null;
  }
}
