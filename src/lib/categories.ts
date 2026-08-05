export const CATEGORIES = [
  { name: "Income", icon: "payments" },
  { name: "Groceries", icon: "shopping_cart" },
  { name: "Electricity", icon: "bolt" },
  { name: "Bills", icon: "receipt_long" },
  { name: "Airtime", icon: "phone_iphone" },
  { name: "Transport", icon: "directions_bus" },
  { name: "Other", icon: "payments" },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];

export function getCategoryIcon(category: string) {
  return CATEGORIES.find((c) => c.name === category)?.icon ?? "payments";
}

export function isCategoryName(value: string): value is CategoryName {
  return CATEGORIES.some((c) => c.name === value);
}
