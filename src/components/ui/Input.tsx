import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-card border border-outline-variant/30 bg-surface-container-low px-md py-sm text-body text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
