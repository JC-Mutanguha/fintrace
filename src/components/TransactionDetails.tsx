"use client";

import { useMemo } from "react";
import type { Tx } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { kindLabel, parseSms } from "@/lib/sms-parser";

function DetailRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-0.5 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-on-surface">{value}</span>
      {hint && (
        <span className="col-start-2 text-xs text-on-surface-variant">{hint}</span>
      )}
    </div>
  );
}

type TransactionDetailsProps = {
  tx: Tx;
  currency: string;
  locale?: string;
  countryCode?: string;
};

export function TransactionDetails({
  tx,
  currency,
  locale,
  countryCode,
}: TransactionDetailsProps) {
  const parsed = useMemo(
    () =>
      tx.smsRaw
        ? parseSms(tx.smsRaw, { currency, countryCode })
        : null,
    [tx.smsRaw, currency, countryCode],
  );

  const whenLabel = new Date(tx.occurredAt).toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-surface-container px-3 py-3 text-sm">
      <DetailRow
        label="Kind"
        value={parsed ? kindLabel(parsed.kind) : tx.type === "received" ? "Money in" : "Payment"}
      />
      <DetailRow
        label="Amount"
        value={formatMoney(tx.amount, currency, locale)}
        hint="Saved to your totals"
      />
      <DetailRow
        label={tx.type === "received" ? "From" : "To"}
        value={tx.subtitle}
      />
      <DetailRow label="Category" value={tx.category} />
      <DetailRow label="When" value={whenLabel} />
      {parsed?.referenceId && (
        <DetailRow label="Reference" value={parsed.referenceId} />
      )}
      {parsed?.fee !== null && parsed?.fee !== undefined && (
        <DetailRow
          label="Fee"
          value={formatMoney(parsed.fee, currency, locale)}
          hint="From SMS — not in totals"
        />
      )}
      {parsed?.balanceAfter !== null && parsed?.balanceAfter !== undefined && (
        <DetailRow
          label="Balance after"
          value={formatMoney(parsed.balanceAfter, currency, locale)}
          hint="From SMS — not saved as amount"
        />
      )}
      {tx.smsRaw && (
        <div className="border-t border-outline-variant/20 pt-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Original message
          </p>
          <p className="break-words font-mono text-xs leading-5 text-on-surface-variant">
            {tx.smsRaw}
          </p>
        </div>
      )}
    </div>
  );
}
