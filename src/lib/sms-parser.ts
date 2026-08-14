import { getSavedCategory } from "@/lib/category-rules";
import {
  getCategoryIcon,
  type CategoryName,
} from "@/lib/categories";

/** What the mobile-money SMS describes (beyond sent/received). */
export type SmsTransactionKind = "receive" | "transfer" | "payment";

export type ParsedSms = {
  amount: number;
  type: "sent" | "received";
  kind: SmsTransactionKind;
  merchant: string;
  category: CategoryName;
  icon: string;
  fee: number | null;
  balanceAfter: number | null;
  referenceId: string | null;
  occurredAt: string | null;
  /** MTN MoMo headline when present, e.g. *165*S*1000 RWF */
  transferHeadline: string | null;
};

export type ParseSmsOptions = {
  currency?: string;
  countryCode?: string;
};

export type SmsFieldGuideLine = {
  fragment: string;
  label: string;
  saved: boolean;
};

const EMPTY: ParsedSms = {
  amount: 0,
  type: "sent",
  kind: "payment",
  merchant: "Unknown",
  category: "Other",
  icon: "payments",
  fee: null,
  balanceAfter: null,
  referenceId: null,
  occurredAt: null,
  transferHeadline: null,
};

const CURRENCY_ALIASES: Record<string, string[]> = {
  USD: ["USD", "US\\$", "\\$"],
  EUR: ["EUR", "€"],
  GBP: ["GBP", "£"],
  RWF: ["RWF", "FRW", "Frw", "rwf"],
  KES: ["KES", "Ksh"],
  NGN: ["NGN", "₦"],
  ZAR: ["ZAR", "R"],
  INR: ["INR", "₹"],
  JPY: ["JPY", "¥"],
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function currencyTokenPattern(currency = "USD") {
  const codes = new Set<string>([currency.toUpperCase()]);
  for (const [code, aliases] of Object.entries(CURRENCY_ALIASES)) {
    if (code === currency.toUpperCase()) {
      aliases.forEach((a) => codes.add(a));
    }
  }
  return [...codes].map((token) => escapeRegex(token)).join("|");
}

function currencyPatterns(currency = "USD") {
  const tokens = currencyTokenPattern(currency);
  return [
    new RegExp(`(?:${tokens})\\s*([\\d,]+(?:\\.\\d+)?)`, "gi"),
    new RegExp(`([\\d,]+(?:\\.\\d+)?)\\s*(?:${tokens})`, "gi"),
    new RegExp(
      `(?:sent|received|paid|debited|credited|transferred|withdrawn)\\s*(?:${tokens})?\\s*([\\d,]+(?:\\.\\d+)?)`,
      "gi",
    ),
  ];
}

function parseMoneyAfterLabel(
  text: string,
  label: string,
  currency = "USD",
): number | null {
  const tokens = currencyTokenPattern(currency);
  const pattern = new RegExp(
    `${label}\\s*:?\\s*([\\d,]+(?:\\.\\d+)?)\\s*(?:${tokens})?`,
    "i",
  );
  const match = text.match(pattern);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

/** MTN MoMo Rwanda: *165*S*1000 RWF or *165*R*5000 RWF */
function extractMtnRwAmount(text: string) {
  const match = text.match(/\*165\*[SR]\*([\d,]+(?:\.\d+)?)\s*RWF/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function extractMtnRwHeadline(text: string) {
  return text.match(/\*165\*[SR]\*[\d,]+(?:\.\d+)?\s*RWF/i)?.[0] ?? null;
}

function extractMtnRwType(text: string): "sent" | "received" | null {
  if (/\*165\*S\*/i.test(text)) return "sent";
  if (/\*165\*R\*/i.test(text)) return "received";
  return null;
}

function stripBalanceAndFee(text: string) {
  return text
    .replace(/balance[:\s]*[\d,]+(?:\.\d+)?\s*\w*/gi, " ")
    .replace(/fee[:\s]*[\d,]+(?:\.\d+)?\s*\w*/gi, " ");
}

function extractAmount(text: string, currency = "USD") {
  const mtnAmount = extractMtnRwAmount(text);
  if (mtnAmount !== null) return mtnAmount;

  const stripped = stripBalanceAndFee(text);
  const amounts: number[] = [];
  const patterns = currencyPatterns(currency);

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(stripped)) !== null) {
      const value = Number(match[1].replace(/,/g, ""));
      if (value > 0 && value < 1_000_000_000) amounts.push(value);
    }
  }

  if (amounts.length === 0) {
    const fallback = stripped.replace(/,/g, "").match(/\b(\d{2,})\b/);
    return fallback ? Number(fallback[1]) : 0;
  }

  return amounts[0];
}

function extractFee(text: string, currency = "USD") {
  return parseMoneyAfterLabel(text, "fee", currency);
}

function extractBalanceAfter(text: string, currency = "USD") {
  return (
    parseMoneyAfterLabel(text, "balance", currency) ??
    parseMoneyAfterLabel(text, "available balance", currency) ??
    parseMoneyAfterLabel(text, "new balance", currency)
  );
}

function extractReferenceId(text: string) {
  const explicit =
    text.match(
      /(?:txn(?:\s+id)?|transaction(?:\s+id)?|ref(?:erence)?|id)\s*:?\s*([A-Z0-9-]{6,})/i,
    )?.[1] ??
    text.match(/\b([A-F0-9]{8,})\b/i)?.[1] ??
    null;

  if (explicit) return explicit;

  const phone = text.match(/\((\d{9,15})\)/)?.[1];
  return phone ?? null;
}

function extractOccurredAt(text: string): string | null {
  const isoLike =
    text.match(
      /(?:at|on)\s+(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?)/i,
    )?.[1] ??
    text.match(
      /(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?)/,
    )?.[1] ??
    null;

  if (!isoLike) return null;

  const normalized = isoLike.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractType(text: string): "sent" | "received" {
  const mtnType = extractMtnRwType(text);
  if (mtnType) return mtnType;

  const lower = text.toLowerCase();
  const received =
    /\b(received|credited|credit|deposit|incoming|money in|transferred from)\b/.test(
      lower,
    );
  const sent =
    /\b(sent|debited|debit|paid|payment|purchase|withdraw|transferred to|you have sent|txn debited|cash out|transfer to)\b/.test(
      lower,
    );

  if (received && !sent) return "received";
  if (sent) return "sent";
  return received ? "received" : "sent";
}

function inferKind(
  text: string,
  type: "sent" | "received",
): SmsTransactionKind {
  if (type === "received") return "receive";

  const lower = text.toLowerCase();
  const isBillOrMerchant =
    /\b(paid\s+(?:for|to)|payment\s+(?:for|to)|purchase|bill|utility|merchant)\b/i.test(
      lower,
    ) ||
    /\b(eucl|reg|umeme|wasac|airtime|bundle|electric|water|school fee|netflix|subscription)\b/i.test(
      lower,
    );

  if (isBillOrMerchant) return "payment";
  if (/transferred\s+to/i.test(lower)) return "transfer";
  return "payment";
}

export function kindLabel(kind: SmsTransactionKind) {
  switch (kind) {
    case "receive":
      return "Money in";
    case "transfer":
      return "Transfer to person";
    case "payment":
      return "Payment";
  }
}

function cleanMerchant(raw: string) {
  return raw
    .replace(/\s+/g, " ")
    .replace(/\(\d{9,15}\)\s*$/, "")
    .replace(/[.*]+$/g, "")
    .trim()
    .slice(0, 80);
}

function extractMtnRwMerchant(text: string) {
  const sent = text.match(
    /transferred\s+to\s+(.+?)\s+at\s+\d{4}-\d{2}-\d{2}/i,
  );
  if (sent?.[1]) {
    const merchant = cleanMerchant(sent[1]);
    if (merchant.length > 1) return merchant;
  }

  const received = text.match(
    /transferred\s+from\s+(.+?)\s+at\s+\d{4}-\d{2}-\d{2}/i,
  );
  if (received?.[1]) {
    const merchant = cleanMerchant(received[1]);
    if (merchant.length > 1) return merchant;
  }

  return null;
}

function extractMerchant(text: string, type: "sent" | "received") {
  const mtnMerchant = extractMtnRwMerchant(text);
  if (mtnMerchant) return mtnMerchant;

  const patterns =
    type === "received"
      ? [
          /\bfrom\s+(.+?)(?:\s+on|\s+at|\s+ref|\s+txn|\s+id|\s+balance|\.|$)/i,
          /\bby\s+(.+?)(?:\s+on|\s+at|\s+ref|\.|$)/i,
          /transferred\s+from\s+(.+?)(?:\s+at|\s+on|\s+balance|\.|$)/i,
        ]
      : [
          /transferred\s+to\s+(.+?)(?:\s+at|\s+on|\s+balance|\.|$)/i,
          /\bpaid\s+(?:for\s+)?(.+?)(?:\s+on|\s+at|\s+ref|\.|$)/i,
          /\bpayment\s+(?:for\s+)?(.+?)(?:\s+on|\s+at|\s+ref|\.|$)/i,
          /\bto\s+(.+?)(?:\s+on|\s+at|\s+ref|\s+txn|\s+id|\s+balance|\.|$)/i,
          /\bmerchant[:\s]+(.+?)(?:\s+on|\s+at|\.|$)/i,
          /\bfor\s+(.+?)(?:\s+on|\s+at|\s+ref|\.|$)/i,
        ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const merchant = cleanMerchant(match[1]);
      if (merchant.length > 1) return merchant;
    }
  }

  return "Unknown";
}

function categorizeGlobal(text: string, type: "sent" | "received"): CategoryName {
  const lower = text.toLowerCase();

  if (/market|grocery|supermarket|carrefour|walmart|costco|tesco|food/i.test(lower)) {
    return "Groceries";
  }
  if (/electric|power|meter|utility|energy/i.test(lower)) return "Electricity";
  if (/airtime|data bundle|bundle|mobile top/i.test(lower)) {
    return "Airtime";
  }
  if (/moto|bus|transport|taxi|uber|lyft|transit|fuel|petrol|gas station/i.test(lower)) {
    return "Transport";
  }
  if (/water|rent|netflix|subscription|bill|school fee|fees|insurance/i.test(lower)) {
    return "Bills";
  }
  if (
    type === "received" ||
    /salary|payroll|refund|reversal|cashback|deposit from/i.test(lower)
  ) {
    return "Income";
  }

  return "Other";
}

function categorizeRwanda(text: string, type: "sent" | "received"): CategoryName {
  const lower = text.toLowerCase();

  if (/kimironko|simba|rubis|sawa city/i.test(lower)) return "Groceries";
  if (/eucl|reg|umeme/i.test(lower)) return "Electricity";
  if (/mtn airtime|airtel airtime/i.test(lower)) return "Airtime";
  if (/yego|safe moto|tap&go|tap and go/i.test(lower)) return "Transport";
  if (/wasac/i.test(lower)) return "Bills";

  return categorizeGlobal(text, type);
}

function categorize(
  text: string,
  type: "sent" | "received",
  countryCode?: string,
): CategoryName {
  const category =
    countryCode?.toUpperCase() === "RW"
      ? categorizeRwanda(text, type)
      : categorizeGlobal(text, type);
  return category;
}

/** Annotated breakdown of a typical payment SMS (for the paste screen). */
export function getSmsFieldGuide(
  currency = "USD",
  countryCode?: string,
): SmsFieldGuideLine[] {
  if (currency === "RWF" || countryCode?.toUpperCase() === "RW") {
    return [
      {
        fragment: "*165*S*1000 RWF",
        label: "Transfer amount — this is what FinTrace saves",
        saved: true,
      },
      {
        fragment: "transferred to NAME (2507…)",
        label: "Transfer to someone — name and phone reference",
        saved: true,
      },
      {
        fragment: "*165*R*5000 RWF received from…",
        label: "Money received into your wallet",
        saved: true,
      },
      {
        fragment: "paid to EUCL / WASAC / merchant",
        label: "Bill or utility payment — pick category before saving",
        saved: true,
      },
      {
        fragment: "at 2026-09-05 13:49:38",
        label: "Transaction date and time",
        saved: true,
      },
      {
        fragment: "Fee: 20RWF",
        label: "Transfer fee — shown for checking, not saved separately",
        saved: false,
      },
      {
        fragment: "Balance: 43704RWF",
        label: "Wallet balance after — not used as the transaction amount",
        saved: false,
      },
    ];
  }

  return [
    {
      fragment: "You sent / paid / received … 1,250",
      label: "Main transaction amount — saved",
      saved: true,
    },
    {
      fragment: "to Merchant or from Sender",
      label: "Who the payment was with",
      saved: true,
    },
    {
      fragment: "Fee / Charge",
      label: "Service fee — shown only",
      saved: false,
    },
    {
      fragment: "Balance / Available",
      label: "Balance after — not saved as amount",
      saved: false,
    },
    {
      fragment: "Ref / Txn ID",
      label: "Reference number when present",
      saved: false,
    },
  ];
}

export function pasteSmsPlaceholder(currency = "USD") {
  if (currency === "RWF") {
    return "*165*S*1000 RWF transferred to MERCHANT NAME (2507…) at 2026-09-05 13:49:38 .Fee: 20RWF.Balance: 43704RWF…";
  }
  if (currency === "USD") {
    return "Example: You sent $45.00 to Coffee Shop. Available balance $1,234.56.";
  }
  if (currency === "EUR") {
    return "Example: You paid EUR 32.50 to Grocery Store. Balance EUR 850.00.";
  }
  if (currency === "GBP") {
    return "Example: You paid GBP 18.99 to Transport Co. Balance GBP 420.50.";
  }
  return `Example: You sent ${currency} 1,250 to Merchant Name. Balance ${currency} 5,000.`;
}

/** Split a paste that contains multiple payment SMS messages. */
export function splitSmsMessages(text: string): string[] {
  const normalized = text.trim();
  if (!normalized) return [];

  const mtnParts = normalized
    .split(/(?=\*165\*[SR]\*)/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 10);

  if (mtnParts.length > 1) return mtnParts;

  const newlineParts = normalized
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 10);

  if (newlineParts.length > 1) return newlineParts;

  return [normalized];
}

/** Parse bank / mobile-money payment SMS text. */
export function parseSms(text: string, options: ParseSmsOptions = {}): ParsedSms {
  const normalized = text.trim();
  if (!normalized) return EMPTY;

  const currency = options.currency ?? "USD";
  const type = extractType(normalized);
  const kind = inferKind(normalized, type);
  const amount = extractAmount(normalized, currency);
  const merchant = extractMerchant(normalized, type);
  let category = categorize(normalized, type, options.countryCode);

  const saved = getSavedCategory(merchant);
  if (saved) category = saved;

  return {
    amount,
    type,
    kind,
    merchant,
    category,
    icon: getCategoryIcon(category),
    fee: extractFee(normalized, currency),
    balanceAfter: extractBalanceAfter(normalized, currency),
    referenceId: extractReferenceId(normalized),
    occurredAt: extractOccurredAt(normalized),
    transferHeadline: extractMtnRwHeadline(normalized),
  };
}
