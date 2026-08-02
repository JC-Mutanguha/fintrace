"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { isNavActive, NAV_TABS } from "@/lib/nav";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 flex w-full items-stretch justify-around border-t border-outline-variant/30 bg-surface/90 px-xs pt-xs pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden"
      aria-label="Main navigation"
    >
      {NAV_TABS.map((tab) => {
        const active = isNavActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-xs text-primary"
                : "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-xs text-on-surface-variant transition-colors active:text-primary"
            }
          >
            <Icon name={tab.icon} fill={active} className="text-heading" />
            <span
              className={
                active
                  ? "font-label text-micro font-semibold leading-tight"
                  : "font-label text-micro font-medium leading-tight"
              }
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
