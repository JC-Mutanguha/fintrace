import type { Tx } from "@/lib/data";
import { getCategoryIcon } from "@/lib/categories";

export type DbTransaction = {
  id: string;
  amount: number | string;
  currency: string;
  type: "sent" | "received";
  category: string;
  merchant: string | null;
  sms_raw: string | null;
  occurred_at: string;
};

function formatDay(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatWhen(date: Date): string {
  const day = formatDay(date);
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (day === "Today" || day === "Yesterday") {
    return `${day}, ${time}`;
  }
  return day;
}

export function dbToTx(row: DbTransaction): Tx {
  const date = new Date(row.occurred_at);
  const merchant = row.merchant?.trim() || "Unknown";
  const smsRaw = row.sms_raw?.trim() || null;
  return {
    id: row.id,
    title: `${row.category} - ${merchant}`,
    subtitle: merchant,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    icon: getCategoryIcon(row.category),
    when: formatWhen(date),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    day: formatDay(date),
    occurredAt: row.occurred_at,
    smsRaw,
  };
}

export function txToInsert(input: {
  userId: string;
  amount: number;
  currency: string;
  type: "sent" | "received";
  category: string;
  merchant?: string;
  sms_raw?: string;
  occurred_at?: string;
}) {
  return {
    user_id: input.userId,
    amount: input.amount,
    currency: input.currency,
    type: input.type,
    category: input.category,
    merchant: input.merchant ?? null,
    sms_raw: input.sms_raw ?? null,
    occurred_at: input.occurred_at ?? new Date().toISOString(),
  };
}
