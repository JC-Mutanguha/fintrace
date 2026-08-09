"use client";

import { useActionState, useEffect } from "react";
import { APP_NAME } from "@/lib/brand";
import {
  resetPasswordWithTokenAction,
  type AuthResult,
} from "@/app/actions/auth";

type ResetPasswordLinkPanelProps = {
  token: string;
  onDone: () => void;
};

export function ResetPasswordLinkPanel({
  token,
  onDone,
}: ResetPasswordLinkPanelProps) {
  const [state, formAction, pending] = useActionState(
    resetPasswordWithTokenAction,
    {} as AuthResult,
  );

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <div className="flex w-full flex-col gap-lg">
      <header className="flex flex-col items-center gap-sm text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary font-headline text-2xl font-bold text-on-primary shadow-sm">
          F
        </span>
        <div className="space-y-1">
          <h1 className="font-headline text-[28px] font-bold tracking-tight text-primary">
            New password
          </h1>
          <p className="max-w-[20rem] text-sm leading-6 text-on-surface-variant">
            Choose a new password for your {APP_NAME} account.
          </p>
        </div>
      </header>

      {state.error && (
        <div
          role="alert"
          className="w-full rounded-xl bg-error-container/50 px-4 py-3 text-sm text-error"
        >
          {state.error}
        </div>
      )}

      <form
        action={formAction}
        className="flex w-full flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
      >
        <input type="hidden" name="token" value={token} />
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
          disabled={pending}
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-label text-sm font-semibold text-on-primary disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
