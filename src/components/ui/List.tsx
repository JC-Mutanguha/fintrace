"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Text } from "@/components/ui/Text";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <Text
        as="span"
        variant="micro"
        className="px-xs font-semibold tracking-wider uppercase"
      >
        {title}
      </Text>
      <div className="flex flex-col rounded-sheet bg-surface-container-lowest p-xs shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  children,
  iconMuted,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  iconMuted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-card p-sm transition-colors hover:bg-surface-container-low">
      <div className="flex min-w-0 items-center gap-sm pr-sm">
        <div
          className={
            iconMuted
              ? "flex h-8 w-8 items-center justify-center rounded-card bg-surface-container-low text-on-surface-variant"
              : "flex h-8 w-8 items-center justify-center rounded-card bg-surface-container-low text-primary"
          }
        >
          <span className="material-symbols-outlined text-heading">{icon}</span>
        </div>
        <div className="min-w-0">
          <span className="block truncate font-medium text-on-surface">
            {title}
          </span>
          {subtitle && (
            <span className="block truncate text-caption leading-tight text-on-surface-variant">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export function ListDivider() {
  return <div className="mx-sm h-px bg-surface-container-high" />;
}

export function ListLinkRow({
  href,
  icon,
  title,
  trailing,
}: {
  href: string;
  icon: string;
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center justify-between rounded-card p-sm text-left transition-colors hover:bg-surface-container-low"
    >
      <div className="flex items-center gap-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-card bg-surface-container-low text-primary">
          <span className="material-symbols-outlined text-heading">{icon}</span>
        </div>
        <span className="font-medium text-on-surface">{title}</span>
      </div>
      {trailing ?? (
        <span className="material-symbols-outlined text-heading text-outline">
          chevron_right
        </span>
      )}
    </Link>
  );
}
