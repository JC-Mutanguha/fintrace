import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { Text } from "@/components/ui/Text";

type MobileHeaderProps = {
  title: string;
  backHref?: string;
  action?: ReactNode;
};

export function MobileHeader({ title, backHref, action }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface/95 pt-safe backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-14 max-w-content items-center gap-sm px-gutter sm:px-lg">
        {backHref ? (
          <Link
            href={backHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-on-surface transition-colors hover:bg-surface-container-high active:scale-95"
            aria-label="Go back"
          >
            <Icon name="arrow_back" />
          </Link>
        ) : (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-primary-container text-on-primary-container"
            aria-hidden
          >
            <Icon name="account_balance_wallet" className="text-heading" />
          </span>
        )}
        <Text as="h1" variant="heading" className="min-w-0 flex-1 truncate">
          {title}
        </Text>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {action ?? null}
        </div>
      </div>
    </header>
  );
}
