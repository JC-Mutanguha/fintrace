"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Text } from "@/components/ui/Text";
import { isNavActive, NAV_TABS } from "@/lib/nav";
import { APP_NAME } from "@/lib/brand";

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-outline-variant/40 md:bg-surface md:px-gutter md:py-lg lg:w-64">
      <div className="mb-lg flex items-center gap-sm px-sm">
        <Icon name="account_balance_wallet" className="text-title text-primary" />
        <Text as="span" variant="heading" className="font-bold text-primary">
          {APP_NAME}
        </Text>
      </div>
      <nav className="flex flex-col gap-xs" aria-label="Main navigation">
        {NAV_TABS.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-sm rounded-card bg-primary-container px-sm py-sm font-label text-label-size font-semibold text-on-primary-container"
                  : "flex items-center gap-sm rounded-card px-sm py-sm font-label text-label-size font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high"
              }
            >
              <Icon name={tab.icon} fill={active} className="text-heading" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
