export type SettingsState = {
  smsSync: boolean;
  dailySummary: boolean;
  budgetWarnings: boolean;
  weeklyDigest: boolean;
  autoClipboard: boolean;
  biometric: boolean;
  currency: string;
  countryCode: string;
  locale: string;
};

export const SETTINGS_KEY = "paytrace-settings";
export const APP_UNLOCKED_KEY = "paytrace-unlocked";

export const defaultSettings: SettingsState = {
  smsSync: true,
  dailySummary: true,
  budgetWarnings: true,
  weeklyDigest: false,
  autoClipboard: true,
  biometric: false,
  currency: "USD",
  countryCode: "US",
  locale: "en-US",
};

export function loadSettings(): SettingsState {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: SettingsState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isAppUnlocked(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(APP_UNLOCKED_KEY) === "1";
}

export function markAppUnlocked() {
  sessionStorage.setItem(APP_UNLOCKED_KEY, "1");
}

export function clearAppUnlock() {
  sessionStorage.removeItem(APP_UNLOCKED_KEY);
}
