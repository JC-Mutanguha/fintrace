"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AppLockScreen } from "@/components/AppLock";
import { BottomNav } from "@/components/BottomNav";
import { OnboardingGate } from "@/components/OnboardingGate";
import { SideNav } from "@/components/SideNav";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/lib/auth";
import { hasDeviceLockRegistered } from "@/lib/device-lock";
import { isAppUnlocked } from "@/lib/settings-store";
import { SettingsProvider, useSettings } from "@/lib/settings";
import { TransactionsProvider } from "@/lib/transactions";

function AppLockGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { settings, ready } = useSettings();
  const [unlocked, setUnlocked] = useState(true);
  const isLogin = pathname === "/login";
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (!ready || isLogin || isOnboarding) {
      setUnlocked(true);
      return;
    }
    const needsLock =
      settings.biometric && hasDeviceLockRegistered() && !isAppUnlocked();
    setUnlocked(!needsLock);
  }, [ready, settings.biometric, isLogin, isOnboarding, pathname]);

  if (!unlocked) {
    return <AppLockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return children;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isOnboarding = pathname === "/onboarding";

  if (isLogin) {
    return (
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-dvh w-full bg-surface">{children}</div>
        </ToastProvider>
      </AuthProvider>
    );
  }

  if (isOnboarding) {
    return (
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <OnboardingGate>
              <div className="min-h-dvh w-full bg-surface">{children}</div>
            </OnboardingGate>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <TransactionsProvider>
            <OnboardingGate>
              <AppLockGate>
                <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
                  <SideNav />
                  <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-surface pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-6">
                    {children}
                  </div>
                </div>
                <BottomNav />
              </AppLockGate>
            </OnboardingGate>
          </TransactionsProvider>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
