"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import {
  OtpInput,
  preventEmptyOtpSubmit,
  useResendCooldown,
} from "@/components/OtpInput";
import {
  requestPasswordResetAction,
  resetPasswordWithCodeAction,
  type AuthResult,
} from "@/app/actions/auth";

type ForgotPasswordPanelProps = {
  initialEmail?: string;
  onBack: () => void;
  onDone: () => void;
};

export function ForgotPasswordPanel({
  initialEmail = "",
  onBack,
  onDone,
}: ForgotPasswordPanelProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [resendCount, setResendCount] = useState(0);

  const [requestState, requestAction, requestPending] = useActionState(
    requestPasswordResetAction,
    {} as AuthResult,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetPasswordWithCodeAction,
    {} as AuthResult,
  );

  const cooldown = useResendCooldown(step === "reset", `${email}:${resendCount}`);

  useEffect(() => {
    if (requestState.resetStep && requestState.email) {
      setEmail(requestState.email);
      setStep("reset");
    }
  }, [requestState.resetStep, requestState.email]);

  useEffect(() => {
    if (requestState.message) {
      setResendCount((c) => c + 1);
    }
  }, [requestState.message]);

  useEffect(() => {
    if (resetState.success) {
      onDone();
    }
  }, [resetState.success, onDone]);

  useEffect(() => {
    setOtp("");
  }, [step, requestState.message, resetState.error]);

  const error = requestState.error ?? resetState.error;
  const message = requestState.message ?? resetState.message;
  const canResend = cooldown <= 0 && !requestPending;

  function submitOtpIfReady(code: string) {
    if (code.length === 6 && !resetPending && step === "reset") {
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
            Reset password
          </h1>
          <p className="max-w-[20rem] text-sm leading-6 text-on-surface-variant">
            {step === "request"
              ? `Enter your ${APP_NAME} account email and we'll send a reset code.`
              : `Enter the 6-digit code sent to ${email} and choose a new password.`}
          </p>
        </div>
      </header>

      {message && (
        <div
          role="status"
          className="w-full rounded-xl border border-primary-container/30 bg-secondary-container/40 px-4 py-3 text-sm text-on-secondary-container"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="w-full rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error"
        >
          {error}
        </div>
      )}

      {step === "request" ? (
        <form
          action={requestAction}
          className="flex w-full flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
        >
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
          <button
            type="submit"
            disabled={requestPending}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-label text-sm font-semibold text-on-primary disabled:opacity-60"
          >
            {requestPending ? "Sending…" : "Send reset code"}
          </button>
        </form>
      ) : (
        <form
          ref={formRef}
          action={resetAction}
          onSubmit={(event) => preventEmptyOtpSubmit(event, otp)}
          className="flex w-full flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
        >
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="otp" value={otp} />

          <OtpInput
            value={otp}
            onChange={setOtp}
            onComplete={submitOtpIfReady}
            disabled={resetPending}
            autoFocus
          />

          <label className="flex w-full flex-col gap-1.5">
            <span className="font-label text-sm font-medium text-on-surface">
              New password
            </span>
            <input
              name="newPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-outline-variant/30 bg-surface px-3 py-3 text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="At least 6 characters"
            />
          </label>

          <button
            type="submit"
            disabled={resetPending || otp.length !== 6}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-label text-sm font-semibold text-on-primary disabled:opacity-60"
          >
            {resetPending ? "Updating…" : "Update password"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form action={requestAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={!canResend}
            className="w-full text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-on-surface-variant disabled:no-underline"
          >
            {requestPending
              ? "Sending…"
              : cooldown > 0
                ? `Resend code in 0:${String(cooldown).padStart(2, "0")}`
                : "Resend code"}
          </button>
        </form>
      )}

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
