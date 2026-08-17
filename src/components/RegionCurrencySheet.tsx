"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Modal, Text } from "@/components/ui";
import {
  COUNTRIES,
  CURRENCIES,
  currencyLabel,
  getCountry,
  getCurrencyForCountry,
  getLocaleForCountry,
  searchCountries,
} from "@/lib/countries";
import type { SettingsState } from "@/lib/settings-store";

type RegionCurrencySheetProps = {
  open: boolean;
  value: Pick<SettingsState, "countryCode" | "currency" | "locale">;
  onSave: (next: Pick<SettingsState, "countryCode" | "currency" | "locale">) => void;
  onClose: () => void;
};

export function RegionCurrencySheet({
  open,
  value,
  onSave,
  onClose,
}: RegionCurrencySheetProps) {
  const [countryCode, setCountryCode] = useState(value.countryCode);
  const [currency, setCurrency] = useState(value.currency);
  const [query, setQuery] = useState("");
  const [showCurrencies, setShowCurrencies] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCountryCode(value.countryCode);
    setCurrency(value.currency);
    setQuery("");
    setShowCurrencies(false);
  }, [open, value.countryCode, value.currency]);

  const countries = useMemo(() => searchCountries(query), [query]);
  const selected = getCountry(countryCode);

  function pickCountry(code: string) {
    setCountryCode(code);
    setCurrency(getCurrencyForCountry(code));
    setShowCurrencies(false);
  }

  function handleSave() {
    onSave({
      countryCode,
      currency,
      locale: selected?.locale ?? getLocaleForCountry(countryCode),
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Region & currency"
      titleId="region-currency-title"
    >
      <Text variant="muted" className="mb-md">
        Your country sets the default currency for amounts and new transactions.
      </Text>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search countries"
        className="mb-sm w-full rounded-card border border-outline-variant/30 bg-surface-container-low px-md py-sm text-sm"
      />

      <div className="mb-md max-h-40 overflow-y-auto rounded-card border border-outline-variant/30">
        {countries.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => pickCountry(country.code)}
            className={
              country.code === countryCode
                ? "flex w-full items-center justify-between bg-primary-container px-sm py-xs text-left text-on-primary-container"
                : "flex w-full items-center justify-between px-sm py-xs text-left hover:bg-surface-container-high"
            }
          >
            <span>{country.name}</span>
            <span className="text-caption opacity-80">{country.currency}</span>
          </button>
        ))}
      </div>

      <div className="rounded-card bg-surface-container-low p-md">
        <Text variant="caption">Currency</Text>
        <Text variant="label" className="mt-xs">
          {currencyLabel(currency)} ({currency})
        </Text>
        <button
          type="button"
          onClick={() => setShowCurrencies((v) => !v)}
          className="mt-sm text-sm font-semibold text-primary"
        >
          {showCurrencies ? "Hide currencies" : "Change currency"}
        </button>
        {showCurrencies && (
          <div className="mt-sm max-h-32 overflow-y-auto rounded-card border border-outline-variant/30">
            {CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={
                  code === currency
                    ? "block w-full bg-primary-container px-sm py-xs text-left text-on-primary-container"
                    : "block w-full px-sm py-xs text-left hover:bg-surface-container-high"
                }
              >
                {currencyLabel(code)} ({code})
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-md flex w-full items-center justify-center gap-2 rounded-card bg-primary px-md py-sm font-label text-sm font-semibold text-on-primary"
      >
        <Icon name="check_circle" />
        Save region
      </button>
    </Modal>
  );
}
