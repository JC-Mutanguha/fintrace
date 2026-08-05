import type { CategoryName } from "@/lib/categories";
import { isCategoryName } from "@/lib/categories";

const KEY = "paytrace-category-rules";

type Rules = Record<string, CategoryName>;

function loadRules(): Rules {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    const rules: Rules = {};
    for (const [merchant, category] of Object.entries(parsed)) {
      if (isCategoryName(category)) {
        rules[merchant] = category;
      }
    }
    return rules;
  } catch {
    return {};
  }
}

export function normalizeMerchantKey(merchant: string) {
  return merchant.toLowerCase().trim().replace(/\s+/g, " ");
}

export function getSavedCategory(merchant: string): CategoryName | null {
  const rules = loadRules();
  const key = normalizeMerchantKey(merchant);
  if (rules[key]) return rules[key];

  for (const [pattern, category] of Object.entries(rules)) {
    if (key.includes(pattern) || pattern.includes(key)) return category;
  }
  return null;
}

export function saveCategoryRule(merchant: string, category: CategoryName) {
  if (typeof window === "undefined") return;
  const key = normalizeMerchantKey(merchant);
  if (!key || key === "unknown") return;
  const rules = loadRules();
  rules[key] = category;
  localStorage.setItem(KEY, JSON.stringify(rules));
}
