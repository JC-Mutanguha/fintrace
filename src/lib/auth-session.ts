import type { UserMetadata, UserProfilePrefs } from "@/lib/user-preferences";
import { isOnboardingComplete } from "@/lib/user-preferences";

type RefreshSessionBody = {
  accessToken?: string;
  user?: {
    id: string;
    email?: string;
    profile?: UserProfilePrefs | null;
    metadata?: UserMetadata | null;
  };
};

export type ClientUser = {
  id: string;
  email?: string;
  name?: string;
  countryCode?: string;
  currency?: string;
  locale?: string;
  onboardingCompleted: boolean;
};

function mapUser(body: NonNullable<RefreshSessionBody["user"]>): ClientUser {
  const profile = body.profile ?? undefined;
  const metadata = body.metadata ?? undefined;
  return {
    id: body.id,
    email: body.email,
    name: profile?.name ?? body.email?.split("@")[0],
    countryCode: profile?.country_code,
    currency: profile?.currency,
    locale: profile?.locale,
    onboardingCompleted: isOnboardingComplete(metadata, profile),
  };
}

export async function fetchSessionUser(): Promise<ClientUser | null> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as RefreshSessionBody;
  if (!body.user?.id) {
    return null;
  }

  return mapUser(body.user);
}

export function mapInsForgeUser(user: {
  id: string;
  email?: string;
  profile?: UserProfilePrefs | null;
  metadata?: UserMetadata | null;
}): ClientUser {
  return mapUser({
    id: user.id,
    email: user.email,
    profile: user.profile,
    metadata: user.metadata,
  });
}
