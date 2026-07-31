import type { ReactNode } from "react";

type ErrorBannerProps = {
  children: ReactNode;
};

export function ErrorBanner({ children }: ErrorBannerProps) {
  return (
    <div className="rounded-card bg-error-container/40 px-md py-sm text-label-size text-error">
      {children}
    </div>
  );
}
