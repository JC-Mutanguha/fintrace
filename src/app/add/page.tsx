"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Icon } from "@/components/Icon";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain, PageTitle } from "@/components/PageMain";
import { Button, ErrorBanner, Input, Text } from "@/components/ui";
import type { CategoryName } from "@/lib/categories";
import { isCategoryName } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import {
  defaultCategoryForPurpose,
  PURPOSES,
  purposeNeedsDirection,
  resolveType,
  type Purpose,
} from "@/lib/transaction-purpose";
import { useSettings } from "@/lib/settings";
import { useTransactions } from "@/lib/transactions";

export default function AddManuallyPage() {
  const router = useRouter();
  const { add } = useTransactions();
  const { settings } = useSettings();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("Payment");
  const [direction, setDirection] = useState<"sent" | "received">("sent");
  const [category, setCategory] = useState<CategoryName>("Other");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = Number(amount.replace(/,/g, ""));
  const needsDirection = purposeNeedsDirection(purpose);
  const txType = resolveType(purpose, direction);
  const canSave = parsedAmount > 0;

  function pickPurpose(next: Purpose) {
    setPurpose(next);
    setCategory(defaultCategoryForPurpose(next));
    if (!purposeNeedsDirection(next)) {
      setDirection(resolveType(next));
    }
  }

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);

    const label = note.trim() || purpose;
    const result = await add({
      amount: parsedAmount,
      type: txType,
      category,
      merchant: label,
      sms_raw: `Manual entry: ${label}`,
    });

    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/activity");
  }

  return (
    <>
      <MobileHeader title="Record transaction" backHref="/" />

      <PageMain className="flex flex-col gap-lg">
        <PageTitle
          title="Record transaction"
          subtitle="Add manually — for cash, salary, or anything without a text message."
        />

        <div className="flex flex-col gap-sm">
          <label htmlFor="amount" className="font-label text-sm font-semibold text-on-surface">
            Amount ({settings.currency})
          </label>
          <Input
            id="amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5000"
            className="py-md text-display font-headline font-bold"
            autoFocus
          />
          {parsedAmount > 0 && (
            <Text variant="caption">
              {formatMoney(parsedAmount, settings.currency, settings.locale)}
            </Text>
          )}
        </div>

        <div className="flex flex-col gap-sm">
          <Text variant="label">What was it?</Text>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => pickPurpose(p)}
                className={
                  purpose === p
                    ? "rounded-full bg-primary-container px-md py-xs font-label text-sm font-semibold text-on-primary-container"
                    : "rounded-full border border-outline-variant/40 px-md py-xs font-label text-sm text-on-surface-variant"
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {needsDirection && (
          <div className="flex flex-col gap-sm">
            <Text variant="label">Direction</Text>
            <div className="flex gap-2">
              {(["sent", "received"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDirection(value)}
                  className={
                    direction === value
                      ? "flex-1 rounded-card bg-primary py-md font-label text-sm font-semibold text-on-primary"
                      : "flex-1 rounded-card border border-outline-variant/40 py-md font-label text-sm text-on-surface-variant"
                  }
                >
                  {value === "sent" ? "Money out" : "Money in"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-sm">
          <Text variant="label">Category</Text>
          <CategoryPicker
            value={category}
            forType={txType}
            onChange={(next) => {
              if (isCategoryName(next)) setCategory(next);
            }}
          />
        </div>

        <div className="flex flex-col gap-sm">
          <label htmlFor="note" className="font-label text-sm font-semibold text-on-surface">
            Note{" "}
            <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Grocery store, salary, bus fare"
          />
        </div>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Button fullWidth size="lg" onClick={save} disabled={!canSave || saving}>
          <Icon name="save" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </PageMain>
    </>
  );
}
