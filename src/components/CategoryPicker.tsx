"use client";

import { Icon } from "@/components/Icon";
import { CATEGORIES } from "@/lib/categories";

const PAID_CATEGORIES = CATEGORIES.filter((c) => c.name !== "Income");
const RECEIVED_CATEGORIES = CATEGORIES.filter(
  (c) => c.name === "Income" || c.name === "Other",
);

export function CategoryPicker({
  value,
  onChange,
  forType,
}: {
  value: string;
  onChange: (category: string) => void;
  forType?: "sent" | "received";
}) {
  const list =
    forType === "received"
      ? RECEIVED_CATEGORIES
      : forType === "sent"
        ? PAID_CATEGORIES
        : CATEGORIES;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((category) => {
        const active = value === category.name;
        return (
          <button
            key={category.name}
            type="button"
            onClick={() => onChange(category.name)}
            className={
              active
                ? "inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 font-label text-sm font-semibold text-on-primary-container"
                : "inline-flex items-center gap-1.5 rounded-full border border-outline-variant/40 bg-surface-container-high px-3 py-1.5 font-label text-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            }
          >
            <Icon name={category.icon} className="text-sm" fill={active} />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
