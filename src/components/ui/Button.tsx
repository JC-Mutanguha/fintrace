import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98]",
  secondary:
    "bg-primary-container text-on-primary-container hover:bg-primary-container/90 active:scale-[0.98]",
  outline:
    "border-2 border-outline-variant bg-transparent text-primary hover:bg-surface-container-high active:scale-[0.98]",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container-high",
  danger:
    "bg-error-container/40 text-error hover:bg-error-container active:scale-[0.98]",
} as const;

const sizes = {
  sm: "min-h-9 px-sm py-base text-label-size",
  md: "min-h-11 px-md py-sm text-label-size",
  lg: "min-h-12 px-lg py-sm text-body",
} as const;

type StyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  className?: string;
};

type SharedProps = StyleProps & {
  children: ReactNode;
};

function buttonClass({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: StyleProps) {
  return `inline-flex items-center justify-center gap-sm rounded-card font-label font-semibold transition-all disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & SharedProps;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonClass({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = SharedProps & {
  href: string;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonClass({ variant, size, fullWidth, className })}
    >
      {children}
    </Link>
  );
}
