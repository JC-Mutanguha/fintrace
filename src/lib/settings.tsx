"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearDeviceLock } from "@/lib/device-lock";
import { useAuth } from "@/lib/auth";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  type SettingsState,
} from "@/lib/settings-store";
import { mergeSettingsWithProfile } from "@/lib/user-preferences";

type SettingsCtx = {
  settings: SettingsState;
  setSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
  setSettings: (next: SettingsState) => void;
  ready: boolean;
};

const SettingsContext = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettingsState] = useState<SettingsState>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const local = loadSettings();
    const merged = user
      ? mergeSettingsWithProfile(local, {
          country_code: user.countryCode,
          currency: user.currency,
          locale: user.locale,
        })
      : local;
    setSettingsState(merged);
    saveSettings(merged);
    setReady(true);
  }, [user?.id, user?.countryCode, user?.currency, user?.locale]);

  useEffect(() => {
    if (!ready) return;
    saveSettings(settings);
  }, [settings, ready]);

  const setSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettingsState((prev) => ({ ...prev, [key]: value }));
      if (key === "biometric" && value === false) {
        clearDeviceLock();
      }
    },
    [],
  );

  const setSettings = useCallback((next: SettingsState) => {
    setSettingsState(next);
  }, []);

  const value = useMemo(
    () => ({ settings, setSetting, setSettings, ready }),
    [settings, setSetting, setSettings, ready],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings needs SettingsProvider");
  return ctx;
}
