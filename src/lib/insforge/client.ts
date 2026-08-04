import { createBrowserClient } from "@insforge/sdk/ssr";

/** Browser InsForge client (Client Components). */
export function createInsForgeBrowserClient() {
  return createBrowserClient();
}

export type TransactionCategory =
  | "Income"
  | "Groceries"
  | "Electricity"
  | "Bills"
  | "Airtime"
  | "Transport"
  | "Other";

export type TransactionType = "sent" | "received";

export type Transaction = {
  id: string;
  user_id: string;
  amount: number | string;
  currency: string;
  type: TransactionType;
  category: TransactionCategory;
  merchant: string | null;
  sms_raw: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};
