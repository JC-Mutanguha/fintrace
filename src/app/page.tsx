"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain, PageTitle } from "@/components/PageMain";
import { RecordChooser } from "@/components/RecordChooser";
import { Button, Card, Text } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import {
  greetingLabel,
  homeGuidance,
  monthIncome,
  monthNet,
  monthSpent,
  todayIncome,
  todayNet,
  todaySpent,
  type Tx,
} from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { useSettings } from "@/lib/settings";
import { useTransactions } from "@/lib/transactions";

function TxRow({
  tx,
  formatAmount,
}: {
  tx: Tx;
  formatAmount: (amount: number) => string;
}) {
  return (
    <Link
      href="/activity"
      className="flex items-center justify-between rounded-sheet bg-surface-container p-md transition-colors hover:bg-surface-container-high active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-primary-container text-on-primary-container">
          <Icon name={tx.icon} fill />
        </div>
        <div className="min-w-0">
          <p className="truncate font-label text-body font-bold text-on-surface">
            {tx.title}
          </p>
          <p className="mt-0.5 truncate text-caption text-on-surface-variant">
            {tx.when}
          </p>
        </div>
      </div>
      <p
        className={
          tx.type === "received"
            ? "shrink-0 font-headline font-bold text-primary"
            : "shrink-0 font-headline font-bold text-on-surface"
        }
      >
        {tx.type === "received" ? "+" : "-"}
        {formatAmount(tx.amount)}
      </p>
    </Link>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { transactions, ready, syncing } = useTransactions();
  const { settings } = useSettings();
  const [chooserOpen, setChooserOpen] = useState(false);

  const fmt = useMemo(
    () => (amount: number) =>
      formatMoney(amount, settings.currency, settings.locale),
    [settings.currency, settings.locale],
  );

  const spent = monthSpent(transactions);
  const income = monthIncome(transactions);
  const net = monthNet(transactions);
  const todayOut = todaySpent(transactions);
  const todayIn = todayIncome(transactions);
  const todayBalance = todayNet(transactions);
  const recent = transactions.slice(0, 3);
  const greeting = greetingLabel(user?.name);
  const guidance = homeGuidance(transactions, {
    dailySummary: settings.dailySummary,
    budgetWarnings: settings.budgetWarnings,
    formatAmount: fmt,
  });

  const focusAmount = settings.dailySummary ? todayBalance : net;
  const focusLabel = settings.dailySummary
    ? focusAmount >= 0
      ? "ahead today"
      : "behind today"
    : focusAmount >= 0
      ? "ahead this month"
      : "behind this month";
  const contextLine = settings.dailySummary
    ? `Received ${fmt(todayIn)} · Paid ${fmt(todayOut)} today`
    : `Received ${fmt(income)} · Paid ${fmt(spent)}`;
  const monthContext =
    settings.dailySummary && (income > 0 || spent > 0) && net !== 0
      ? `${fmt(Math.abs(net))} ${net > 0 ? "ahead" : "behind"} this month`
      : null;

  const isEmpty = ready && transactions.length === 0;

  return (
    <>
      <MobileHeader title="Home" />

      <PageMain className="space-y-lg">
        <PageTitle title="Home" subtitle="See what came in and what you paid" />

        <div>
          <Text as="h2" variant="heading">
            {greeting}
          </Text>
          {syncing ? (
            <Text variant="caption" className="mt-xs">
              Updating…
            </Text>
          ) : (
            <Text
              variant="body"
              className={
                guidance.tone === "warning"
                  ? "mt-sm text-error"
                  : guidance.tone === "action"
                    ? "mt-sm text-primary"
                    : "mt-sm text-on-surface-variant"
              }
            >
              {guidance.message}
            </Text>
          )}
        </div>

        <Card padding="lg" className="border-surface-variant bg-surface-container-high">
          {isEmpty ? (
            <>
              <Icon name="receipt_long" className="text-title text-primary" />
              <Text variant="heading" className="mt-sm">
                Get started
              </Text>
              <Text variant="muted" className="mt-xs">
                Record a transaction from an SMS or type it in yourself.
              </Text>
            </>
          ) : (
            <>
              {!ready ? (
                <LoadingSkeleton rows={2} />
              ) : (
                <>
                  <p
                    className={
                      focusAmount >= 0
                        ? "font-headline text-display font-extrabold tracking-tight text-primary"
                        : "font-headline text-display font-extrabold tracking-tight text-error"
                    }
                  >
                    {focusAmount >= 0 ? "+" : ""}
                    {fmt(focusAmount)}
                  </p>
                  <Text variant="caption" className="mt-xs uppercase tracking-wider">
                    {focusLabel}
                  </Text>
                  {contextLine ? (
                    <Text variant="muted" className="mt-sm">
                      {contextLine}
                    </Text>
                  ) : null}
                  {monthContext ? (
                    <Text variant="caption" className="mt-xs">
                      {monthContext}
                    </Text>
                  ) : null}
                </>
              )}
            </>
          )}

          <Button
            fullWidth
            size="lg"
            className={isEmpty || !ready ? "mt-lg" : "mt-lg"}
            onClick={() => setChooserOpen(true)}
          >
            <Icon name="add_circle" fill className="text-heading" />
            Record transaction
          </Button>
        </Card>

        {ready && recent.length > 0 && (
          <section>
            <div className="mb-sm flex items-center justify-between">
              <Text as="h3" variant="heading">
                Recent
              </Text>
              <Link
                href="/activity"
                className="font-label text-label-size font-semibold text-primary"
              >
                See all
              </Link>
            </div>
            <div className="space-y-sm">
              {recent.map((tx) => (
                <TxRow key={tx.id} tx={tx} formatAmount={fmt} />
              ))}
            </div>
          </section>
        )}
      </PageMain>

      <RecordChooser open={chooserOpen} onClose={() => setChooserOpen(false)} />
    </>
  );
}
