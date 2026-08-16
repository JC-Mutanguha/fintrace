import type { SettingsState } from "@/lib/settings-store";
import { defaultSettings } from "@/lib/settings-store";

export type UserProfilePrefs = {
  country_code?: string;
  currency?: string;
  locale?: string;
  onboarding_completed?: boolean;
  name?: string;
  avatar_url?: string;
};

export type UserMetadata = {
  onboarding_completed?: boolean;
};

export function profileToSettings(
  profile: UserProfilePrefs | null | undefined,
): Partial<SettingsState> {
  if (!profile) return {};
  const next: Partial<SettingsState> = {};
  if (profile.country_code) next.countryCode = profile.country_code;
  if (profile.currency) next.currency = profile.currency;
  if (profile.locale) next.locale = profile.locale;
  return next;
}

export function settingsToProfile(settings: SettingsState): UserProfilePrefs {
  return {
    country_code: settings.countryCode,
    currency: settings.currency,
    locale: settings.locale,
  };
}

export function isOnboardingComplete(
  metadata: UserMetadata | null | undefined,
  profile?: UserProfilePrefs | null,
): boolean {
  return (
    metadata?.onboarding_completed === true ||
    profile?.onboarding_completed === true ||
    Boolean(profile?.country_code && profile?.currency)
  );
}

export function mergeSettingsWithProfile(
  current: SettingsState,
  profile: UserProfilePrefs | null | undefined,
): SettingsState {
  const fromProfile = profileToSettings(profile);
  if (Object.keys(fromProfile).length === 0) return current;
  return { ...current, ...fromProfile };
}

export function hasRegionalPrefs(
  profile: UserProfilePrefs | null | undefined,
): boolean {
  return Boolean(profile?.country_code && profile?.currency);
}

export function defaultPrefsForCountry(
  countryCode: string,
  currency: string,
  locale: string,
): SettingsState {
  return {
    ...defaultSettings,
    countryCode,
    currency,
    locale,
  };
}
