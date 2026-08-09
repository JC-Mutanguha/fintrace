"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  OtpInput,
  preventEmptyOtpSubmit,
  useResendCooldown,
} from "@/components/OtpInput";
import {
  resendVerificationAction,
  verifyEmailAction,
  type AuthResult,
} from "@/app/actions/auth";

type VerifyEmailPanelProps = {
  next: string;
  knownEmail: string;
  manualVerify: boolean;
  onBack: () => void;
};

export function VerifyEmailPanel({
  next,
  knownEmail,
  manualVerify,
  onBack,
}: VerifyEmailPanelProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(knownEmail);
  const [resendCount, setResendCount] = useState(0);
  const [verifyState, verifyFormAction, verifyPending] = useActionState(
    verifyEmailAction,
    {} as AuthResult,
  );
  const [resendState, resendFormAction, resendPending] = useActionState(
    resendVerificationAction,
    {} as AuthResult,
  );

  const cooldown = useResendCooldown(
    true,
    `${email}:${resendCount}:${manualVerify}`,
  );

  useEffect(() => {
    setEmail(knownEmail);
  }, [knownEmail]);

  useEffect(() => {
    if (resendState.email) setEmail(resendState.email);
    if (verifyState.email) setEmail(verifyState.email);
  }, [resendState.email, verifyState.email]);

  useEffect(() => {
    if (resendState.message) {
      setResendCount((count) => count + 1);
    }
  }, [resendState.message]);

  useEffect(() => {
    setOtp("");
  }, [email, manualVerify, verifyState.error, resendState.message]);

  const authError = verifyState.error ?? resendState.error;
  const authMessage = resendState.message ?? verifyState.message;
  const canResend = cooldown <= 0 && !resendPending;

  function submitIfReady(code: string) {
    if (code.length === 6 && !verifyPending) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div className="flex w-full flex-col gap-lg">
      <header className="flex flex-col items-center gap-sm text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary font-headline text-2xl font-bold text-on-primary shadow-sm">
          F
        </span>
        <div className="space-y-1">
          <h1 className="font-headline text-[28px] font-bold tracking-tight text-primary">
            Verify email
          </h1>
          <p className="max-w-[20rem] text-sm leading-6 text-on-surface-variant">
            {email ? (
              <>
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-on-surface">{email}</span>
              </>
            ) : (
              "Enter your email and the 6-digit code from your inbox."
            )}
          </p>
        </div>
      </header>

      {authMessage && (
        <div
          role="status"
          className="w-full rounded-xl border border-primary-container/30 bg-secondary-container/40 px-4 py-3 text-sm text-on-secondary-container"
        >
          {authMessage}
        </div>
      )}

      {authError && (
        <div
          role="alert"
          className="w-full rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error"
        >
          {authError.includes("Invalid") || authError.includes("expired")
            ? "Invalid or expired code. Try again or resend a new one."
            : authError}
        </div>
      )}

      <form
        ref={formRef}
        action={verifyFormAction}
        onSubmit={(event) => preventEmptyOtpSubmit(event, otp)}
        className="relative flex w-full flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
      >
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="otp" value={otp} />

        {manualVerify ? (
          <label className="flex w-full flex-col gap-1.5">
            <span className="font-label text-sm font-medium text-on-surface">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-3 text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="you@example.com"
            />
          </label>
        ) : (
          <input type="hidden" name="email" value={email} />
        )}

        <OtpInput
          value={otp}
          onChange={setOtp}
          onComplete={submitIfReady}
          disabled={verifyPending}
          autoFocus
        />

        <button
          type="submit"
          disabled={verifyPending || otp.length !== 6}
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-label text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifyPending ? "Verifying…" : "Verify and continue"}
        </button>

        <button
          type="submit"
          formAction={resendFormAction}
          disabled={!canResend}
          className="w-full text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-on-surface-variant disabled:no-underline"
        >
          {resendPending
            ? "Sending…"
            : cooldown > 0
              ? `Resend code in 0:${String(cooldown).padStart(2, "0")}`
              : "Resend code"}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-on-surface-variant hover:text-on-surface"
      >
        Back to sign in
      </button>
    </div>
  );
}
