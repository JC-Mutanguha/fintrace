import type { HTMLAttributes, ReactNode } from "react";

const styles = {
  display: "font-display text-display font-extrabold tracking-tight text-on-surface",
  title: "font-headline text-title font-semibold tracking-tight text-on-surface",
  heading: "font-headline text-heading font-semibold text-on-surface",
  body: "font-body text-body text-on-surface",
  muted: "font-body text-body text-on-surface-variant",
  label: "font-label text-label-size font-semibold text-on-surface",
  caption: "font-label text-caption text-on-surface-variant",
  micro: "font-label text-micro text-on-surface-variant",
} as const;

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "h1" | "h2" | "h3";
  variant?: keyof typeof styles;
  children: ReactNode;
};

export function Text({
  as: Tag = "p",
  variant = "body",
  className = "",
  children,
  ...props
}: TextProps) {
  return (
    <Tag className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
