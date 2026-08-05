"use server";

import { cookies } from "next/headers";
import {
  createServerClient,
  refreshAuth,
  setAuthCookies,
} from "@insforge/sdk/ssr";
import type { CategoryName } from "@/lib/categories";
import { isCategoryName } from "@/lib/categories";
import { dbToTx, txToInsert, type DbTransaction } from "@/lib/db/transactions";

export type NewTransactionInput = {
  amount: number;
  currency: string;
  type: "sent" | "received";
  category: string;
  merchant?: string;
  sms_raw?: string;
  occurred_at?: string;
};

export type TransactionActionResult = {
  error?: string;
  transaction?: ReturnType<typeof dbToTx>;
};

async function getAuthedClient() {
  const cookieStore = await cookies();
  let insforge = createServerClient({ cookies: cookieStore });
  const { data, error } = await insforge.auth.getCurrentUser();
  if (!error && data?.user) {
    return { insforge, userId: data.user.id };
  }

  const refreshed = await refreshAuth({ cookies: cookieStore });
  if (refreshed.error || !refreshed.accessToken || !refreshed.data?.user) {
    return { insforge: null, userId: null };
  }

  setAuthCookies(
    cookieStore,
    {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? undefined,
    },
  );
  insforge = createServerClient({ cookies: cookieStore });
  return { insforge, userId: refreshed.data.user.id };
}

export async function addTransactionAction(
  input: NewTransactionInput,
): Promise<TransactionActionResult> {
  const { insforge, userId } = await getAuthedClient();
  if (!insforge || !userId) {
    return { error: "Sign in to save payments" };
  }

  const row = txToInsert({
    userId,
    ...input,
  });

  const { data, error } = await insforge.database
    .from("transactions")
    .insert([row])
    .select(
      "id, amount, currency, type, category, merchant, sms_raw, occurred_at",
    );

  if (error) {
    console.error("Failed to save transaction", error);
    return { error: error.message ?? "Could not save" };
  }

  const saved = (data?.[0] ?? null) as DbTransaction | null;
  if (!saved) {
    return { error: "Could not save" };
  }

  return { transaction: dbToTx(saved) };
}

export async function updateTransactionCategoryAction(
  id: string,
  category: CategoryName,
): Promise<TransactionActionResult> {
  if (!isCategoryName(category)) {
    return { error: "Invalid category" };
  }

  const { insforge, userId } = await getAuthedClient();
  if (!insforge || !userId) {
    return { error: "Sign in to update payments" };
  }

  const { data, error } = await insforge.database
    .from("transactions")
    .update({ category })
    .eq("id", id)
    .select(
      "id, amount, currency, type, category, merchant, sms_raw, occurred_at",
    );

  if (error) {
    console.error("Failed to update transaction", error);
    return { error: error.message ?? "Could not update category" };
  }

  const updated = (data?.[0] ?? null) as DbTransaction | null;
  if (!updated) {
    return { error: "Transaction not found" };
  }

  return { transaction: dbToTx(updated) };
}

export async function listTransactionsAction() {
  const { insforge, userId } = await getAuthedClient();
  if (!insforge || !userId) {
    return { transactions: [], error: "Sign in to view your payments" as const };
  }

  const { data, error } = await insforge.database
    .from("transactions")
    .select(
      "id, amount, currency, type, category, merchant, sms_raw, occurred_at",
    )
    .order("occurred_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to load transactions", error);
    return { transactions: [], error: error.message ?? "Could not load your payments" };
  }

  return {
    transactions: ((data ?? []) as DbTransaction[]).map(dbToTx),
  };
}
