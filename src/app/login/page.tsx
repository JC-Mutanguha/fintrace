"use client";

import { Suspense, useActionState, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { ForgotPasswordPanel } from "@/components/ForgotPasswordPanel";
import { ResetPasswordLinkPanel } from "@/components/ResetPasswordLinkPanel";
import { VerifyEmailPanel } from "@/components/VerifyEmailPanel";
import {
  signInAction,
  signUpAction,
  type AuthResult,
} from "@/app/actions/auth";

type AuthPanel = "verify" | "forgot" | "reset-link" | null;

function panelFromParams(
  resetToken: string | null,
  viewParam: string | null,
): AuthPanel {
  if (resetToken) return "reset-link";
  if (viewParam === "forgot") return "forgot";
  if (viewParam === "verify") return "verify";
  return null;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const modeParam = searchParams.get("mode");
  const viewParam = searchParams.get("view");
  const linkVerified =
    searchParams.get("insforge_status") === "success" &&
    searchParams.get("insforge_type") === "verify_email";
  const resetToken =
    searchParams.get("insforge_status") === "ready" &&
    searchParams.get("insforge_type") === "reset_password"
      ? searchParams.get("token")
      : null;

  const [mode, setMode] = useState<"signin" | "signup">(
    modeParam === "signup" ? "signup" : "signin",
  );
  const [panel, setPanel] = useState<AuthPanel>(() =>
    panelFromParams(resetToken, viewParam),
  );
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [manualVerify, setManualVerify] = useState(viewParam === "verify");
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    {} as AuthResult,
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    {} as AuthResult,
  );

  useEffect(() => {
    setMode(modeParam === "signup" ? "signup" : "signin");
  }, [modeParam]);

  useEffect(() => {
    const fromUrl = panelFromParams(resetToken, viewParam);
    if (fromUrl) {
      setPanel(fromUrl);
      if (viewParam === "verify") setManualVerify(true);
    }
  }, [resetToken, viewParam]);

  useEffect(() => {
    if (signUpState.verify && signUpState.email) {
      setVerifyEmail(signUpState.email);
      setManualVerify(false);
      setPanel("verify");
    }
  }, [signUpState]);

  const authError =
    panel !== null
      ? null
      : mode === "signin"
        ? signInState.error
        : signUpState.error;

  const setLoginParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `/login?${qs}` : "/login", { scroll: false });
    },
    [router, searchParams],
  );

  function switchMode(nextMode: "signin" | "signup") {
    setVerifyEmail(null);
    setManualVerify(false);
    setDoneMessage(null);
    setPanel(null);
    setMode(nextMode);
    setFormKey((k) => k + 1);
    setLoginParams({
      mode: nextMode === "signup" ? "signup" : null,
      view: null,
    });
  }

  function openForgotPassword() {
    setDoneMessage(null);
    setPanel("forgot");
    setLoginParams({ view: "forgot", mode: null });
  }

  function backToSignIn(message?: string) {
    setVerifyEmail(null);
    setManualVerify(false);
    setPanel(null);
    setDoneMessage(message ?? null);
    setFormKey((k) => k + 1);
    setLoginParams({
      view: null,
      mode: null,
      insforge_status: null,
      insforge_type: null,
      token: null,
    });
  }

  if (panel === "reset-link" && resetToken) {
    return (
      <ResetPasswordLinkPanel
        token={resetToken}
        onDone={() =>
          backToSignIn("Password updated. Sign in with your new password.")
        }
      />
    );
  }

  if (panel === "forgot") {
    return (
      <ForgotPasswordPanel
        onBack={() => backToSignIn()}
        onDone={() =>
          backToSignIn("Password updated. Sign in with your new password.")
        }
      />
    );
  }

  if (
    panel === "verify" &&
    ((verifyEmail && verifyEmail.length > 0) || manualVerify)
  ) {
    return (
      <VerifyEmailPanel
        next={next}
        knownEmail={verifyEmail ?? ""}
        manualVerify={manualVerify}
        onBack={() => backToSignIn()}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-lg">
      <header className="flex flex-col items-center gap-sm text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary font-headline text-2xl font-bold text-on-primary shadow-sm">
          F
        </span>
        <div className="space-y-1">
          <h1 className="font-headline text-[28px] font-bold tracking-tight text-primary">
            {APP_NAME}
          </h1>
        </div>
      </header>

      {linkVerified && (
        <div
          role="status"
          className="w-full rounded-xl border border-primary-container/30 bg-secondary-container/40 px-4 py-3 text-sm text-on-secondary-container"
        >
          Email verified. Sign in with your email and password.
        </div>
      )}

      {doneMessage && (
        <div
          role="status"
          className="w-full rounded-xl border border-primary-container/30 bg-secondary-container/40 px-4 py-3 text-sm text-on-secondary-container"
        >
          {doneMessage}
        </div>
      )}

      <div
        className="flex w-full rounded-xl bg-surface-container p-1"
        role="tablist"
        aria-label="Sign in or sign up"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          onClick={() => switchMode("signin")}
          className={
            mode === "signin"
              ? "flex-1 rounded-lg bg-surface-container-lowest py-2.5 text-sm font-semibold text-primary shadow-sm"
              : "flex-1 rounded-lg py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          }
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => switchMode("signup")}
          className={
            mode === "signup"
              ? "flex-1 rounded-lg bg-surface-container-lowest py-2.5 text-sm font-semibold text-primary shadow-sm"
              : "flex-1 rounded-lg py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          }
        >
          Sign up
        </button>
      </div>

      {authError && (
        <div
          role="alert"
          className="w-full rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error"
        >
          {authError}
        </div>
      )}

      <form
        key={`${mode}-${formKey}`}
        action={mode === "signin" ? signInFormAction : signUpFormAction}
        className="flex w-full flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
      >
        <input type="hidden" name="next" value={next} />

        {mode === "signup" && (
          <label className="flex w-full flex-col gap-1.5">
            <span className="font-label text-sm font-medium text-on-surface">
              Name
            </span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-3 text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Your name"
            />
          </label>
        )}

        <label className="flex w-full flex-col gap-1.5">
          <span className="font-label text-sm font-medium text-on-surface">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-3 text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex w-full flex-col gap-1.5">
          <span className="font-label text-sm font-medium text-on-surface">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-3 text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="At least 6 characters"
          />
        </label>

        {mode === "signin" && (
          <button
            type="button"
            onClick={openForgotPassword}
            className="-mt-1 self-end text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </button>
        )}

        <button
          type="submit"
          disabled={mode === "signin" ? signInPending : signUpPending}
          className="mt-1 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-label text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mode === "signin"
            ? signInPending
              ? "Please wait…"
              : "Sign in"
            : signUpPending
              ? "Please wait…"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40dvh] w-full items-center justify-center">
          <p className="text-sm text-on-surface-variant">Loading…</p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
