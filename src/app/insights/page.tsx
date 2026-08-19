"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain, PageTitle } from "@/components/PageMain";
import { RecordChooser } from "@/components/RecordChooser";
import { Button, Text } from "@/components/ui";
import {
  isThisMonth,
  monthIncome,
  monthNet,
  monthSpent,
  topCategories,
} from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { useSettings } from "@/lib/settings";
import { useTransactions } from "@/lib/transactions";

export default function InsightsPage() {
  const { transactions } = useTransactions();
  const { settings } = useSettings();
  const [chooserOpen, setChooserOpen] = useState(false);
  const fmt = (amount: number) =>
    formatMoney(amount, settings.currency, settings.locale);
  const moneyIn = monthIncome(transactions);
  const moneyOut = monthSpent(transactions);
  const net = monthNet(transactions);
  const byCategory = topCategories(transactions, 10);
  const biggest = byCategory[0];

  const inPct = moneyIn
    ? Math.min(100, Math.round((moneyIn / Math.max(moneyIn, moneyOut)) * 100))
    : 0;
  const outPct =
    moneyIn || moneyOut
      ? Math.min(100, Math.round((moneyOut / Math.max(moneyIn, moneyOut)) * 100))
      : 0;

  const categoryAlerts = byCategory.filter(
    (c) => moneyOut > 0 && c.total / moneyOut >= 0.4,
  );

  const weeklyStats = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekTx = transactions.filter(
      (t) => new Date(t.occurredAt).getTime() >= cutoff,
    );
    const weekIn = weekTx
      .filter((t) => t.type === "received")
      .reduce((sum, t) => sum + t.amount, 0);
    const weekOut = weekTx
      .filter((t) => t.type === "sent")
      .reduce((sum, t) => sum + t.amount, 0);
    return { count: weekTx.length, in: weekIn, out: weekOut, net: weekIn - weekOut };
  }, [transactions]);

  const monthTxCount = transactions.filter((t) =>
    isThisMonth(t.occurredAt),
  ).length;

  return (
    <>
      <MobileHeader title="Insights" />

      <PageMain className="space-y-lg">
        <PageTitle title="Insights" subtitle="How you're doing this month" />

        {settings.weeklyDigest && (
          <div className="rounded-card border border-outline-variant/30 bg-surface-container-lowest p-md">
            <Text variant="caption" className="font-semibold tracking-wide text-primary uppercase">
              Weekly digest
            </Text>
            <Text variant="body" className="mt-xs">
              {weeklyStats.count} saved this week · Received{" "}
              {fmt(weeklyStats.in)} · Paid {fmt(weeklyStats.out)}
              {weeklyStats.net !== 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-semibold">
                    {weeklyStats.net >= 0 ? "+" : ""}
                    {fmt(weeklyStats.net)} ahead
                  </span>
                </>
              )}
            </Text>
          </div>
        )}

        {settings.budgetWarnings &&
          categoryAlerts.length >= 2 &&
          monthTxCount >= 3 && (
            <div className="rounded-card border border-outline-variant/30 bg-surface-container-low p-md">
              <div className="flex items-start gap-sm">
                <Icon name="pie_chart" className="mt-0.5 text-primary" />
                <div>
                  <Text variant="label">Category balance</Text>
                  <Text variant="caption" className="mt-xs">
                    {categoryAlerts
                      .map(
                        (c) =>
                          `${c.name} (${Math.round((c.total / moneyOut) * 100)}% of what you paid)`,
                      )
                      .join(", ")}
                  </Text>
                </div>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-card bg-surface-container-low p-lg md:col-span-1">
            <div>
              <Text variant="caption">This month</Text>
              <p
                className={
                  net >= 0
                    ? "font-headline text-[32px] font-bold text-primary"
                    : "font-headline text-[32px] font-bold text-error"
                }
              >
                {net >= 0 ? "+" : ""}
                {fmt(net)} {net >= 0 ? "ahead" : "behind"}
              </p>
              <Text variant="muted" className="mt-xs">
                Received {fmt(moneyIn)} · Paid {fmt(moneyOut)}
              </Text>
            </div>
            <div className="mt-lg">
              <Text variant="caption" className="mb-sm block">
                Received vs paid
              </Text>
              <div className="space-y-sm">
                <div className="flex items-center gap-sm">
                  <span className="w-12 text-right font-label text-sm text-on-surface">
                    In
                  </span>
                  <div className="flex h-4 flex-1 items-center overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-tertiary-container"
                      style={{ width: `${inPct || 0}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-label text-sm text-on-surface-variant">
                    {fmt(moneyIn)}
                  </span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="w-12 text-right font-label text-sm text-on-surface">
                    Out
                  </span>
                  <div className="flex h-4 flex-1 items-center overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-primary-container"
                      style={{ width: `${outPct || 0}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-label text-sm text-on-surface-variant">
                    {fmt(moneyOut)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {biggest && (
            <div className="relative flex min-h-[160px] flex-col justify-end overflow-hidden rounded-card bg-secondary-container p-lg md:col-span-1">
              <Text variant="caption" className="text-on-secondary-container">
                Most paid on
              </Text>
              <div className="mb-xs flex items-center gap-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/50">
                  <Icon
                    name={biggest.icon}
                    className="text-[20px] text-on-secondary-container"
                  />
                </div>
                <span className="font-headline text-2xl text-on-secondary-container">
                  {biggest.name}
                </span>
              </div>
              <div className="font-headline text-[28px] font-bold text-on-secondary-container">
                {fmt(biggest.total)}
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <Text as="h3" variant="heading" className="mb-md">
              Where your money went
            </Text>
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
              {byCategory.slice(0, 3).map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between rounded-card border border-surface-container-highest bg-surface-container-lowest p-md"
                >
                  <div className="flex items-center gap-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon name={c.icon} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-label text-sm text-on-surface">
                        {c.name}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        What you paid
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-on-surface">
                    {fmt(c.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card bg-surface-container p-lg md:col-span-2">
            <Text variant="label" className="mb-xs block">
              Stay current
            </Text>
            <Text variant="muted" className="mb-md">
              Record transactions from SMS or add them manually to stay on top
              of your money.
            </Text>
            <Button fullWidth onClick={() => setChooserOpen(true)}>
              <Icon name="add_circle" fill className="text-heading" />
              Record transaction
            </Button>
          </div>
        </div>
      </PageMain>

      <RecordChooser open={chooserOpen} onClose={() => setChooserOpen(false)} />
    </>
  );
}
