import type { CategoryName } from "@/lib/categories";

export const PURPOSES = [
  "Payment",
  "Transfer",
  "Cash",
  "Income",
  "Bill",
  "Other",
] as const;

export type Purpose = (typeof PURPOSES)[number];

type PurposeMeta = {
  label: Purpose;
  ambiguous: boolean;
  defaultType: "sent" | "received";
  defaultCategory: CategoryName;
};

export const PURPOSE_META: Record<Purpose, PurposeMeta> = {
  Payment: {
    label: "Payment",
    ambiguous: false,
    defaultType: "sent",
    defaultCategory: "Other",
  },
  Transfer: {
    label: "Transfer",
    ambiguous: true,
    defaultType: "sent",
    defaultCategory: "Other",
  },
  Cash: {
    label: "Cash",
    ambiguous: true,
    defaultType: "sent",
    defaultCategory: "Other",
  },
  Income: {
    label: "Income",
    ambiguous: false,
    defaultType: "received",
    defaultCategory: "Income",
  },
  Bill: {
    label: "Bill",
    ambiguous: false,
    defaultType: "sent",
    defaultCategory: "Bills",
  },
  Other: {
    label: "Other",
    ambiguous: true,
    defaultType: "sent",
    defaultCategory: "Other",
  },
};

export function isPurpose(value: string): value is Purpose {
  return PURPOSES.includes(value as Purpose);
}

export function resolveType(
  purpose: Purpose,
  direction?: "sent" | "received",
): "sent" | "received" {
  const meta = PURPOSE_META[purpose];
  if (meta.ambiguous) {
    return direction ?? meta.defaultType;
  }
  return meta.defaultType;
}

export function defaultCategoryForPurpose(purpose: Purpose): CategoryName {
  return PURPOSE_META[purpose].defaultCategory;
}

export function purposeNeedsDirection(purpose: Purpose): boolean {
  return PURPOSE_META[purpose].ambiguous;
}
