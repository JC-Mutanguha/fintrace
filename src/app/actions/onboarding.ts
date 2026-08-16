"use server";

import { createInsForgeServerClient } from "@/lib/insforge/server";

export type OnboardingResult = {
  error?: string;
  success?: boolean;
};

export async function completeOnboardingAction(input: {
  countryCode: string;
  currency: string;
  locale: string;
}): Promise<OnboardingResult> {
  const countryCode = input.countryCode.trim().toUpperCase();
  const currency = input.currency.trim().toUpperCase();
  const locale = input.locale.trim();

  if (!countryCode || !currency || !locale) {
    return { error: "Country and currency are required." };
  }

  const insforge = await createInsForgeServerClient();
  const { data: current, error: userError } = await insforge.auth.getCurrentUser();
  if (userError || !current?.user) {
    return { error: "You must be signed in to complete onboarding." };
  }

  const existingName = (current.user.profile as { name?: string } | null)?.name;

  const { error } = await insforge.auth.setProfile({
    ...(existingName ? { name: existingName } : {}),
    country_code: countryCode,
    currency,
    locale,
    onboarding_completed: true,
  });

  if (error) {
    return { error: error.message ?? "Could not save your preferences." };
  }

  return { success: true };
}
