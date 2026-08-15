import rawCountries from "@/lib/countries-data.json";

export type Country = {
  code: string;
  name: string;
  currency: string;
  locale: string;
};

export const COUNTRIES = rawCountries as Country[];

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));

export function getCountry(code: string): Country | undefined {
  return byCode.get(code.toUpperCase());
}

export function getCurrencyForCountry(code: string): string {
  return getCountry(code)?.currency ?? "USD";
}

export function getLocaleForCountry(code: string): string {
  return getCountry(code)?.locale ?? "en-US";
}

export function searchCountries(query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.currency.toLowerCase().includes(q),
  );
}

export function guessCountryFromBrowser(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  const locale = navigator.language ?? "";
  const match = locale.match(/-([A-Z]{2})$/i);
  if (match) {
    const code = match[1].toUpperCase();
    if (byCode.has(code)) return code;
  }
  return undefined;
}

export function currencyLabel(code: string, locale = "en"): string {
  try {
    return new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export const CURRENCIES = [...new Set(COUNTRIES.map((c) => c.currency))].sort();
