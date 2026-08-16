"use server";

import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  settingsToProfile,
  type UserProfilePrefs,
} from "@/lib/user-preferences";
import type { SettingsState } from "@/lib/settings-store";

export type RegionUpdateResult = {
  error?: string;
};

export async function updateRegionAction(
  input: Pick<SettingsState, "countryCode" | "currency" | "locale">,
): Promise<RegionUpdateResult> {
  const insforge = await createInsForgeServerClient();
  const { data: current, error: userError } = await insforge.auth.getCurrentUser();
  if (userError || !current?.user) {
    return { error: "Sign in to update region settings." };
  }

  const existing = (current.user.profile ?? {}) as UserProfilePrefs;
  const profile = {
    ...existing,
    ...settingsToProfile({
      countryCode: input.countryCode,
      currency: input.currency,
      locale: input.locale,
    } as SettingsState),
    onboarding_completed: true,
  };

  const { error } = await insforge.auth.setProfile(profile);
  if (error) {
    return { error: error.message ?? "Could not save region." };
  }

  return {};
}
