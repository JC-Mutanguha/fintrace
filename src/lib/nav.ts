export const NAV_TABS = [
  { href: "/", label: "Home", icon: "home", title: "Home" },
  {
    href: "/activity",
    label: "Activity",
    icon: "receipt_long",
    title: "Activity",
  },
  {
    href: "/insights",
    label: "Insights",
    icon: "monitoring",
    title: "Insights",
  },
  { href: "/settings", label: "Settings", icon: "tune", title: "Settings" },
] as const;

export type NavHref = (typeof NAV_TABS)[number]["href"];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
