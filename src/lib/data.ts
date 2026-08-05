export type Tx = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: "sent" | "received";
  category: string;
  icon: string;
  when: string;
  time?: string;
  day: "Today" | "Yesterday" | string;
  occurredAt: string;
  /** Original pasted SMS, when recorded from Paste. */
  smsRaw: string | null;
};

export { formatMoney, formatMoneyAmount, formatRwf } from "@/lib/money";

export function isThisMonth(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function monthSpent(txs: Tx[]) {
  return txs
    .filter((t) => t.type === "sent" && isThisMonth(t.occurredAt))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function monthIncome(txs: Tx[]) {
  return txs
    .filter((t) => t.type === "received" && isThisMonth(t.occurredAt))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function monthNet(txs: Tx[]) {
  return monthIncome(txs) - monthSpent(txs);
}

export function todaySpent(txs: Tx[]) {
  return txs
    .filter((t) => t.day === "Today" && t.type === "sent")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function todayIncome(txs: Tx[]) {
  return txs
    .filter((t) => t.day === "Today" && t.type === "received")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function todayNet(txs: Tx[]) {
  return todayIncome(txs) - todaySpent(txs);
}

export function todayTransactions(txs: Tx[]) {
  return txs.filter((t) => t.day === "Today");
}

export type HomeGuidance = {
  message: string;
  tone: "neutral" | "action" | "warning";
};

export function homeGuidance(
  txs: Tx[],
  opts: {
    dailySummary: boolean;
    budgetWarnings: boolean;
    formatAmount: (amount: number) => string;
  },
): HomeGuidance {
  const fmt = opts.formatAmount;

  if (txs.length === 0) {
    return {
      message: "Record your first transaction to start tracking.",
      tone: "action",
    };
  }

  if (opts.dailySummary && todayTransactions(txs).length === 0) {
    return {
      message: "Nothing saved today — record a payment or money received.",
      tone: "action",
    };
  }

  const income = monthIncome(txs);
  const spent = monthSpent(txs);
  const net = income - spent;
  const monthOutgoing = txs.filter(
    (t) => t.type === "sent" && isThisMonth(t.occurredAt),
  );

  if (income > 0 && spent > 0) {
    if (net < 0) {
      return {
        message: `You paid ${fmt(Math.abs(net))} more than you received this month.`,
        tone: "warning",
      };
    }
    return {
      message: `You're ${fmt(net)} ahead this month.`,
      tone: "neutral",
    };
  }

  if (spent > 0 && income === 0) {
    return {
      message: "Record money received too — track what comes in as well as what you pay.",
      tone: "action",
    };
  }

  if (opts.budgetWarnings && monthOutgoing.length >= 3) {
    const categories = topCategories(txs, 10);
    if (categories.length >= 2 && spent > 0) {
      const top = categories[0];
      const share = top.total / spent;
      if (share >= 0.4) {
        return {
          message: `Most of what you paid this month went to ${top.name} (${Math.round(share * 100)}%).`,
          tone: "neutral",
        };
      }
    }
  }

  return {
    message: "Record transactions as they happen to stay on top of your money.",
    tone: "neutral",
  };
}

export type CategoryTotal = {
  name: string;
  total: number;
  icon: string;
};

export function topCategories(txs: Tx[], limit = 3): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();
  for (const t of txs.filter(
    (x) => x.type === "sent" && isThisMonth(x.occurredAt),
  )) {
    const cur = map.get(t.category) ?? {
      name: t.category,
      total: 0,
      icon: t.icon,
    };
    cur.total += t.amount;
    map.set(t.category, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}

export function categoryWarnings(txs: Tx[], threshold = 0.4): CategoryTotal[] {
  const spent = monthSpent(txs);
  if (spent <= 0) return [];
  return topCategories(txs, 10).filter((c) => c.total / spent >= threshold);
}

export function greetingLabel(name?: string) {
  const hour = new Date().getHours();
  const period =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = name?.trim().split(/\s+/)[0];
  return first ? `${period}, ${first}` : period;
}

export {
  parseSms,
  pasteSmsPlaceholder,
  splitSmsMessages,
  getSmsFieldGuide,
  kindLabel,
} from "@/lib/sms-parser";
export type { ParsedSms, SmsTransactionKind, SmsFieldGuideLine } from "@/lib/sms-parser";
