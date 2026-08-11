"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Icon } from "@/components/Icon";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain, PageTitle } from "@/components/PageMain";
import { RecordChooser } from "@/components/RecordChooser";
import { TransactionDetails } from "@/components/TransactionDetails";
import { Button, Text } from "@/components/ui";
import { saveCategoryRule } from "@/lib/category-rules";
import type { CategoryName } from "@/lib/categories";
import { isCategoryName } from "@/lib/categories";
import {
  isThisMonth,
  monthIncome,
  monthNet,
  monthSpent,
} from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { useSettings } from "@/lib/settings";
import { useTransactions } from "@/lib/transactions";

const filters = ["All", "Groceries", "Bills", "Transport", "Airtime"] as const;

function merchantFromTitle(title: string) {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : title;
}

export default function ActivityPage() {
  const { transactions, updateCategory } = useTransactions();
  const { settings } = useSettings();
  const fmt = (amount: number) =>
    formatMoney(amount, settings.currency, settings.locale);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const monthTxs = useMemo(
    () => transactions.filter((t) => isThisMonth(t.occurredAt)),
    [transactions],
  );

  const filtered = useMemo(() => {
    const base =
      filter === "All"
        ? transactions
        : transactions.filter((t) => t.category === filter);
    return base;
  }, [transactions, filter]);

  const moneyIn = monthIncome(transactions);
  const moneyOut = monthSpent(transactions);
  const net = monthNet(transactions);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      const list = map.get(tx.day) ?? [];
      list.push(tx);
      map.set(tx.day, list);
    }
    return [...map.entries()];
  }, [filtered]);

  async function changeCategory(txId: string, title: string, category: string) {
    if (!isCategoryName(category)) return;
    const merchant = merchantFromTitle(title);
    setUpdatingId(txId);
    saveCategoryRule(merchant, category);
    const result = await updateCategory(txId, category, merchant);
    setUpdatingId(null);
    if (!result.error) setEditingId(null);
  }

  return (
    <>
      <MobileHeader title="Activity" />

      <PageMain className="flex flex-col gap-md pb-6">
        <PageTitle title="Activity" subtitle="Your payments and transfers" />

        <div className="rounded-card bg-surface-container-low p-md">
          <Text variant="caption" className="uppercase tracking-wide">
            This month · {monthTxs.length} saved
          </Text>
          <p
            className={
              net >= 0
                ? "mt-xs font-headline text-heading font-bold text-primary"
                : "mt-xs font-headline text-heading font-bold text-error"
            }
          >
            {net >= 0 ? "+" : ""}
            {fmt(net)} {net >= 0 ? "ahead" : "behind"}
          </p>
          <Text variant="muted" className="mt-xs">
            Received {fmt(moneyIn)} · Paid {fmt(moneyOut)}
          </Text>
        </div>

        <div className="hide-scrollbar flex gap-sm overflow-x-auto pb-xs">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "whitespace-nowrap rounded-full bg-primary px-md py-xs font-label text-sm text-on-primary"
                  : "whitespace-nowrap rounded-full border border-outline-variant bg-surface px-md py-xs font-label text-sm text-on-surface-variant hover:border-primary"
              }
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-sm">
          {groups.length === 0 && (
            <div className="rounded-card border border-dashed border-outline-variant/40 bg-surface-container p-lg text-center">
              <Text variant="muted">
                Nothing here yet. Record your first transaction.
              </Text>
              <Button
                className="mt-md"
                onClick={() => setChooserOpen(true)}
              >
                <Icon name="add_circle" />
                Record transaction
              </Button>
            </div>
          )}
          {groups.map(([day, txs]) => (
            <div key={day}>
              <h2 className="mt-sm mb-xs font-label text-sm text-on-surface-variant">
                {day}
              </h2>
              <div className="flex flex-col gap-sm">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col gap-sm rounded-card border border-outline-variant/30 bg-surface-container-lowest p-md shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-md">
                      <div className="flex min-w-0 flex-1 items-start gap-md">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                          <Icon name={tx.icon} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-label text-sm font-semibold text-on-surface">
                            {tx.title}
                          </span>
                          <span className="mt-xs truncate text-[13px] leading-tight text-on-surface-variant">
                            {tx.subtitle}
                            {tx.smsRaw ? " · from SMS" : ""}
                          </span>
                          {tx.smsRaw && (
                            <button
                              type="button"
                              onClick={() =>
                                setDetailsId((id) =>
                                  id === tx.id ? null : tx.id,
                                )
                              }
                              className="mt-xs inline-flex w-fit items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                            >
                              {detailsId === tx.id
                                ? "Hide details"
                                : "View details"}
                              <Icon
                                name={
                                  detailsId === tx.id
                                    ? "expand_less"
                                    : "expand_more"
                                }
                                className="text-[14px]"
                              />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setEditingId((id) =>
                                id === tx.id ? null : tx.id,
                              )
                            }
                            className="mt-xs inline-flex w-fit items-center gap-1 rounded-full bg-surface-variant px-2 py-0.5 text-[11px] font-medium text-on-surface-variant hover:bg-surface-container-high"
                          >
                            {tx.category}
                            <Icon name="edit" className="text-[12px]" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end">
                        <span
                          className={
                            tx.type === "received"
                              ? "font-label text-sm font-semibold text-primary"
                              : "font-label text-sm font-semibold text-on-surface"
                          }
                        >
                          {tx.type === "received" ? "+" : "-"}
                          {fmt(tx.amount)}
                        </span>
                        <span className="mt-xs text-[12px] text-on-surface-variant">
                          {tx.time}
                        </span>
                      </div>
                    </div>
                    {detailsId === tx.id && tx.smsRaw && (
                      <TransactionDetails
                        tx={tx}
                        currency={settings.currency}
                        locale={settings.locale}
                        countryCode={settings.countryCode}
                      />
                    )}
                    {editingId === tx.id && (
                      <div className="border-t border-outline-variant/20 pt-sm">
                        <p className="mb-2 text-xs text-on-surface-variant">
                          {updatingId === tx.id
                            ? "Updating…"
                            : "Choose a category"}
                        </p>
                        <CategoryPicker
                          value={tx.category}
                          onChange={(category) =>
                            changeCategory(
                              tx.id,
                              tx.title,
                              category as CategoryName,
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-4 z-10 flex justify-end pt-2 md:static md:justify-start">
          <Button onClick={() => setChooserOpen(true)}>
            <Icon name="add_circle" />
            Record transaction
          </Button>
        </div>
      </PageMain>

      <RecordChooser open={chooserOpen} onClose={() => setChooserOpen(false)} />
    </>
  );
}
