"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading || isLogin || isOnboarding) return;
    if (user && !user.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [loading, user, isLogin, isOnboarding, router]);

  if (!loading && user && !user.onboardingCompleted && !isOnboarding && !isLogin) {
    return null;
  }

  return children;
}
