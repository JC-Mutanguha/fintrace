"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  isOnboardingComplete,
  type UserProfilePrefs,
} from "@/lib/user-preferences";
import { getLoginUrl } from "@/lib/auth-url";

export type AuthResult = {
  error?: string;
  verify?: boolean;
  email?: string;
  message?: string;
  resetStep?: boolean;
  success?: boolean;
};

function safeRedirectPath(next: string) {
  if (next.startsWith("/") && !next.startsWith("//") && next !== "/login") {
    return next;
  }
  return "/";
}

async function redirectAfterAuth(next: string) {
  const insforge = await createInsForgeServerClient();
  const { data } = await insforge.auth.getCurrentUser();
  const profile = data?.user?.profile as UserProfilePrefs | null | undefined;
  const metadata = data?.user?.metadata ?? undefined;

  if (!isOnboardingComplete(metadata, profile)) {
    redirect("/onboarding");
  }

  redirect(safeRedirectPath(next));
}

function appLoginUrl() {
  return getLoginUrl();
}

export async function signInAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) {
    return { error: error.message ?? "Sign in failed" };
  }
  if (!data?.user) {
    return { error: "Sign in failed" };
  }

  await redirectAfterAuth(String(formData.get("next") ?? ""));
  return undefined as never;
}

export async function signUpAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rawName = String(formData.get("name") ?? "").trim();
  const name = rawName || email.split("@")[0] || "FinTrace user";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signUp({
    email,
    password,
    name,
    redirectTo: await appLoginUrl(),
  });

  if (error) {
    return { error: error.message ?? "Sign up failed" };
  }
  if (data?.requireEmailVerification) {
    return { verify: true, email };
  }
  if (data?.user) {
    await redirectAfterAuth(String(formData.get("next") ?? ""));
    return undefined as never;
  }

  return { error: "Sign up failed" };
}

export async function verifyEmailAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "");
  const otp = String(formData.get("otp") ?? "").trim();
  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.verifyEmail({ email, otp });

  if (error) {
    return {
      error: error.message ?? "Invalid or expired code",
      verify: true,
      email,
    };
  }
  if (!data?.user) {
    return { error: "Verification failed", verify: true, email };
  }

  await redirectAfterAuth(String(formData.get("next") ?? ""));
  return undefined as never;
}

export async function resendVerificationAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "");
  const insforge = await createInsForgeServerClient();
  const { error } = await insforge.auth.resendVerificationEmail({
    email,
    redirectTo: await appLoginUrl(),
  });

  if (error) {
    return {
      error: error.message ?? "Could not resend verification code",
      verify: true,
      email,
    };
  }

  return {
    verify: true,
    email,
    message: "A new verification code was sent to your email.",
  };
}

export async function signOutAction() {
  const auth = createAuthActions({ cookies: await cookies() });
  await auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const insforge = await createInsForgeServerClient();
  const loginUrl = await appLoginUrl();
  const { error } = await insforge.auth.sendResetPasswordEmail({
    email,
    redirectTo: loginUrl,
  });

  if (error) {
    return { error: error.message ?? "Could not send reset code." };
  }

  return {
    resetStep: true,
    email,
    message: "If that email is registered, a reset code was sent.",
  };
}

export async function resetPasswordWithCodeAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("otp") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!email || code.length !== 6) {
    return { error: "Enter your email and 6-digit code." };
  }
  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const insforge = await createInsForgeServerClient();
  const { data: tokenData, error: exchangeError } =
    await insforge.auth.exchangeResetPasswordToken({ email, code });

  if (exchangeError || !tokenData?.token) {
    return {
      error: exchangeError?.message ?? "Invalid or expired reset code.",
      email,
      resetStep: true,
    };
  }

  const { error } = await insforge.auth.resetPassword({
    newPassword,
    otp: tokenData.token,
  });

  if (error) {
    return {
      error: error.message ?? "Could not update password.",
      email,
      resetStep: true,
    };
  }

  return {
    success: true,
    message: "Password updated. Sign in with your new password.",
  };
}

export async function resetPasswordWithTokenAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!token) {
    return { error: "Reset link is invalid or expired." };
  }
  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const insforge = await createInsForgeServerClient();
  const { error } = await insforge.auth.resetPassword({
    newPassword,
    otp: token,
  });

  if (error) {
    return { error: error.message ?? "Could not update password." };
  }

  return {
    success: true,
    message: "Password updated. Sign in with your new password.",
  };
}
