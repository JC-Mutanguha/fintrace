"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addTransactionAction,
  listTransactionsAction,
  updateTransactionCategoryAction,
} from "@/app/actions/transactions";
import { useAuth } from "@/lib/auth";
import type { CategoryName } from "@/lib/categories";
import type { Tx } from "@/lib/data";
import { notifySyncComplete, notifyTransactionSaved } from "@/lib/notifications";
import { loadSettings } from "@/lib/settings-store";

export type NewTransaction = {
  amount: number;
  currency?: string;
  type: "sent" | "received";
  category: string;
  merchant?: string;
  sms_raw?: string;
  occurred_at?: string;
};

type Ctx = {
  transactions: Tx[];
  add: (tx: NewTransaction) => Promise<{ error?: string }>;
  updateCategory: (
    id: string,
    category: CategoryName,
    merchant?: string,
  ) => Promise<{ error?: string }>;
  reload: () => Promise<void>;
  ready: boolean;
  syncing: boolean;
};

const TransactionsContext = createContext<Ctx | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user, refresh } = useAuth();
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setSyncing(true);
    const result = await listTransactionsAction();
    if (result.error && result.transactions.length === 0) {
      await refresh();
    }
    setTransactions(result.transactions);
    setSyncing(false);
    setReady(true);
  }, [refresh]);

  useEffect(() => {
    setReady(false);
    load();
  }, [load, user]);

  const add = useCallback(async (input: NewTransaction) => {
    const settings = loadSettings();
    const result = await addTransactionAction({
      ...input,
      currency: input.currency || settings.currency,
    });
    if (result.error) {
      return { error: result.error };
    }
    if (result.transaction) {
      setTransactions((prev) => [result.transaction!, ...prev]);
      notifyTransactionSaved(
        result.transaction.amount,
        input.merchant ?? result.transaction.title,
      );
      await refresh();
    }
    return {};
  }, [refresh]);

  const updateCategory = useCallback(
    async (id: string, category: CategoryName) => {
      const result = await updateTransactionCategoryAction(id, category);
      if (result.error) {
        return { error: result.error };
      }
      if (result.transaction) {
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.id === id ? result.transaction! : tx,
          ),
        );
      }
      return {};
    },
    [],
  );

  const reload = useCallback(async () => {
    setSyncing(true);
    const result = await listTransactionsAction();
    if (result.error && result.transactions.length === 0) {
      await refresh();
    }
    setTransactions(result.transactions);
    setSyncing(false);
    setReady(true);
    notifySyncComplete(result.transactions.length);
  }, [refresh]);

  const value = useMemo(
    () => ({ transactions, add, updateCategory, reload, ready, syncing }),
    [transactions, add, updateCategory, reload, ready, syncing],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions needs provider");
  return ctx;
}
