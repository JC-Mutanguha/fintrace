"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { completeOnboardingAction } from "@/app/actions/onboarding";
import { PageMain } from "@/components/PageMain";
import { APP_NAME } from "@/lib/brand";
import { useAuth } from "@/lib/auth";
import {
  CURRENCIES,
  currencyLabel,
  getCountry,
  getCurrencyForCountry,
  getLocaleForCountry,
  guessCountryFromBrowser,
  searchCountries,
  type Country,
} from "@/lib/countries";
import { defaultPrefsForCountry } from "@/lib/user-preferences";
import { saveSettings } from "@/lib/settings-store";
import { Button, ErrorBanner, Input, Text } from "@/components/ui";

export default function OnboardingPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState(
    () => guessCountryFromBrowser() ?? "US",
  );
  const [currencyOverride, setCurrencyOverride] = useState<string | null>(null);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const countries = useMemo(() => searchCountries(query), [query]);
  const selected = getCountry(selectedCode);
  const currency = currencyOverride ?? getCurrencyForCountry(selectedCode);
  const locale = selected?.locale ?? getLocaleForCountry(selectedCode);

  function selectCountry(country: Country) {
    setSelectedCode(country.code);
    setCurrencyOverride(null);
    setShowCurrencyPicker(false);
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const prefs = defaultPrefsForCountry(selectedCode, currency, locale);
      saveSettings(prefs);
      const result = await completeOnboardingAction({
        countryCode: selectedCode,
        currency,
        locale,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      await refresh();
      router.replace("/");
    });
  }

  return (
    <PageMain className="mx-auto flex min-h-[100dvh] max-w-dialog flex-col justify-center gap-lg py-lg">
      <header className="space-y-1 text-center">
        <Text as="h1" variant="title" className="font-headline text-primary">
          Welcome to {APP_NAME}
        </Text>
        <Text variant="muted">
          Choose your country so we can set your currency.
        </Text>
      </header>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="flex flex-col gap-md">
        <label
          htmlFor="country-search"
          className="font-label text-sm font-semibold text-on-surface"
        >
          Search countries
        </label>
        <Input
          id="country-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Country name or code"
          autoComplete="off"
        />

        <div className="max-h-56 overflow-y-auto rounded-card border border-outline-variant/30">
          {countries.map((country) => {
            const active = country.code === selectedCode;
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => selectCountry(country)}
                className={
                  active
                    ? "flex w-full items-center justify-between bg-primary-container px-md py-sm text-left text-on-primary-container"
                    : "flex w-full items-center justify-between px-md py-sm text-left hover:bg-surface-container-high"
                }
              >
                <span className="font-medium">{country.name}</span>
                <span className="text-caption opacity-80">{country.currency}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-card bg-surface-container-low p-md">
          <Text variant="caption" className="text-on-surface-variant">
            {APP_NAME} will use
          </Text>
          <Text variant="label" className="mt-xs">
            {currencyLabel(currency)} ({currency})
          </Text>
          {!showCurrencyPicker ? (
            <button
              type="button"
              onClick={() => setShowCurrencyPicker(true)}
              className="mt-sm text-sm font-semibold text-primary"
            >
              Change currency
            </button>
          ) : (
            <div className="mt-sm max-h-40 overflow-y-auto rounded-card border border-outline-variant/30">
              {CURRENCIES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setCurrencyOverride(code);
                    setShowCurrencyPicker(false);
                  }}
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

        <Button
          type="button"
          variant="primary"
          fullWidth
          disabled={pending}
          onClick={finish}
        >
          {pending ? "Saving…" : "Get started"}
        </Button>
      </div>
    </PageMain>
  );
}
