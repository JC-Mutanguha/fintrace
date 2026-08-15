export function formatMoney(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "RWF" || currency === "JPY" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

export function formatMoneyAmount(
  amount: number,
  locale = "en-US",
): string {
  return amount.toLocaleString(locale, {
    maximumFractionDigits: 2,
  });
}

/** @deprecated Use formatMoney with settings currency */
export function formatRwf(n: number) {
  return n.toLocaleString("en-US");
}
