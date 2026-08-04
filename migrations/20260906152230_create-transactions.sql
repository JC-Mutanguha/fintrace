-- Paytrace: user-owned finance transactions (from pasted payment SMS)

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(18, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'RWF',
  type TEXT NOT NULL CHECK (type IN ('sent', 'received')),
  category TEXT NOT NULL CHECK (
    category IN (
      'Income',
      'Groceries',
      'Electricity',
      'Bills',
      'Airtime',
      'Transport',
      'Other'
    )
  ),
  merchant TEXT,
  sms_raw TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_occurred_at_idx
  ON public.transactions (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS transactions_user_id_category_idx
  ON public.transactions (user_id, category);

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners can select transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "owners can insert transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owners can update transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "owners can delete transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
