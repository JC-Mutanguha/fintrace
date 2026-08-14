"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Icon } from "@/components/Icon";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain, PageTitle } from "@/components/PageMain";
import { ErrorBanner } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { saveCategoryRule } from "@/lib/category-rules";
import type { CategoryName } from "@/lib/categories";
import { isCategoryName } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import {
  getSmsFieldGuide,
  kindLabel,
  parseSms,
  pasteSmsPlaceholder,
  splitSmsMessages,
} from "@/lib/sms-parser";
import { useSettings } from "@/lib/settings";
import { useTransactions } from "@/lib/transactions";

function formatParsedWhen(iso: string | null, locale?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PreviewField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="font-label text-sm text-on-surface-variant">{label}</p>
      <p className="text-lg text-on-surface">{value}</p>
      {hint && (
        <p className="mt-0.5 text-xs text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}

function PasteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { add } = useTransactions();
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const [sms, setSms] = useState("");
  const [category, setCategory] = useState<CategoryName>("Other");
  const [selectedMessage, setSelectedMessage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fieldGuide = useMemo(
    () => getSmsFieldGuide(settings.currency, settings.countryCode),
    [settings.currency, settings.countryCode],
  );

  const messages = useMemo(() => splitSmsMessages(sms), [sms]);
  const activeSms = messages[selectedMessage] ?? messages[0] ?? "";

  const parsed = useMemo(
    () =>
      parseSms(activeSms, {
        currency: settings.currency,
        countryCode: settings.countryCode,
      }),
    [activeSms, settings.currency, settings.countryCode],
  );
  const showPreview = activeSms.trim().length > 10;
  const multipleMessages = messages.length > 1;
  const parsedWhen = formatParsedWhen(parsed.occurredAt, settings.locale);

  useEffect(() => {
    setSelectedMessage(0);
  }, [sms]);

  useEffect(() => {
    const shared = searchParams.get("text") ?? searchParams.get("title") ?? "";
    if (shared.trim()) {
      setSms(shared.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    setCategory(parsed.category);
  }, [parsed.category, sms]);

  useEffect(() => {
    if (!settings.autoClipboard) return;
    const shared = searchParams.get("text") ?? searchParams.get("title") ?? "";
    if (shared.trim()) return;

    async function readClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        if (text.trim().length > 10) {
          setSms(text.trim());
        }
      } catch {
        /* clipboard blocked or empty */
      }
    }

    readClipboard();
  }, [settings.autoClipboard, searchParams]);

  function clear() {
    setSms("");
    setSaveError(null);
  }

  async function save() {
    if (!showPreview || !parsed.amount || saving) return;
    setSaving(true);
    setSaveError(null);

    if (isCategoryName(category)) {
      saveCategoryRule(parsed.merchant, category);
    }

    const result = await add({
      amount: parsed.amount,
      type: parsed.type,
      category,
      merchant: parsed.merchant,
      sms_raw: activeSms.trim(),
      occurred_at: parsed.occurredAt ?? undefined,
    });
    setSaving(false);
    if (result.error) {
      setSaveError(result.error);
      return;
    }
    router.push("/activity");
  }

  return (
    <>
      <MobileHeader title="Record transaction" />

      <PageMain className="flex flex-col gap-lg">
        <PageTitle
          title="Record transaction"
          subtitle="Paste the full SMS — we pull out the payment, not the fee or balance."
        />

        <details className="rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-on-surface">
            How we read your SMS
          </summary>
          <div className="mt-3 flex flex-col gap-3 text-sm leading-6 text-on-surface-variant">
            <p>
              Mobile-money texts usually mix several numbers. FinTrace saves the{" "}
              <span className="font-medium text-on-surface">main payment</span>{" "}
              (transfer, bill, or money in), the{" "}
              <span className="font-medium text-on-surface">person or merchant</span>
              , and the{" "}
              <span className="font-medium text-on-surface">date</span>. Fee and
              balance stay in the preview so you can check the message.
            </p>
            <ul className="flex flex-col gap-2">
              {fieldGuide.map((line) => (
                <li
                  key={line.fragment}
                  className="rounded-lg border border-outline-variant/20 bg-surface px-3 py-2"
                >
                  <p className="font-mono text-xs text-primary">{line.fragment}</p>
                  <p className="mt-1">{line.label}</p>
                  <p className="mt-1 text-xs">
                    {line.saved ? "Saved to your activity" : "Preview only"}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-xs">
              Paste one SMS per save. Transfers to people, bill payments, and
              money received use different wording — pick the right category if
              it is a utility or shop.
            </p>
          </div>
        </details>

        <div className="flex flex-col gap-sm">
          <label
            htmlFor="sms-input"
            className="font-label text-sm font-semibold text-on-surface"
          >
            Your message
          </label>
          <textarea
            id="sms-input"
            rows={6}
            value={sms}
            onChange={(e) => setSms(e.target.value)}
            placeholder={pasteSmsPlaceholder(settings.currency)}
            className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low p-md font-body text-on-surface transition-colors focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        {multipleMessages && (
          <div className="flex flex-col gap-sm rounded-xl border border-primary-container/30 bg-secondary-container/30 p-4">
            <p className="text-sm font-medium text-on-secondary-container">
              {messages.length} messages found — choose one to record
            </p>
            <div className="flex flex-col gap-2">
              {messages.map((message, index) => {
                const preview = parseSms(message, {
                  currency: settings.currency,
                  countryCode: settings.countryCode,
                });
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedMessage(index)}
                    className={
                      selectedMessage === index
                        ? "rounded-lg border border-primary bg-surface-container-lowest px-3 py-2 text-left text-sm shadow-sm"
                        : "rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-left text-sm text-on-surface-variant"
                    }
                  >
                    <span className="font-medium text-on-surface">
                      {formatMoney(
                        preview.amount || 0,
                        settings.currency,
                        settings.locale,
                      )}{" "}
                      · {kindLabel(preview.kind)} · {preview.merchant}
                    </span>
                    <span className="mt-1 block truncate font-mono text-xs opacity-70">
                      {message.slice(0, 72)}…
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`flex flex-col gap-sm transition-opacity duration-300 ${showPreview ? "opacity-100" : "opacity-50"}`}
        >
          <h3 className="font-label text-sm tracking-wider text-on-surface-variant uppercase">
            Preview
          </h3>
          <div className="flex flex-col gap-md rounded-[16px] border border-outline-variant/30 bg-surface-container p-margin">
            <div className="flex items-start justify-between gap-md">
              <div>
                <p className="mb-1 font-label text-sm text-on-surface-variant">
                  Amount to save
                </p>
                <p className="font-headline text-[32px] leading-10 font-semibold text-primary">
                  {formatMoney(parsed.amount || 0, settings.currency, settings.locale)}
                </p>
                {parsed.transferHeadline && (
                  <p className="mt-2 rounded-lg bg-secondary-container/50 px-3 py-2 text-sm leading-5 text-on-secondary-container">
                    From{" "}
                    <span className="font-mono text-xs text-on-surface">
                      {parsed.transferHeadline}
                    </span>
                    {parsed.balanceAfter !== null && (
                      <>
                        {" "}
                        — not balance{" "}
                        {formatMoney(
                          parsed.balanceAfter,
                          settings.currency,
                          settings.locale,
                        )}
                      </>
                    )}
                  </p>
                )}
              </div>
              <Icon
                name={parsed.icon}
                fill
                className="text-4xl text-primary-container"
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <PreviewField
                label="Kind"
                value={showPreview ? kindLabel(parsed.kind) : "—"}
                hint={
                  parsed.kind === "payment"
                    ? "Bills, shops, utilities"
                    : parsed.kind === "transfer"
                      ? "Sent to a person"
                      : "Money into your wallet"
                }
              />
              <PreviewField
                label={parsed.type === "received" ? "From" : "To"}
                value={showPreview ? parsed.merchant : "—"}
              />
              <PreviewField
                label="Date"
                value={showPreview ? (parsedWhen ?? "From message or today") : "—"}
                hint={parsedWhen ? "Taken from SMS" : undefined}
              />
              <PreviewField
                label="Reference"
                value={showPreview ? (parsed.referenceId ?? "—") : "—"}
                hint="Phone or transaction ID when present"
              />
              <PreviewField
                label="Fee"
                value={
                  showPreview && parsed.fee !== null
                    ? formatMoney(parsed.fee, settings.currency, settings.locale)
                    : "—"
                }
                hint="Not saved separately"
              />
              <PreviewField
                label="Balance after"
                value={
                  showPreview && parsed.balanceAfter !== null
                    ? formatMoney(
                        parsed.balanceAfter,
                        settings.currency,
                        settings.locale,
                      )
                    : "—"
                }
                hint="Not used as the payment amount"
              />
            </div>

            <div className="mt-sm border-t border-outline-variant/20 pt-sm">
              <p className="mb-2 font-label text-sm text-on-surface-variant">
                Category
              </p>
              {showPreview ? (
                <CategoryPicker
                  value={category}
                  onChange={(next) => {
                    if (isCategoryName(next)) setCategory(next);
                  }}
                />
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Paste a message to see a preview.
                </p>
              )}
            </div>
          </div>
        </div>

        {saveError && <ErrorBanner>{saveError}</ErrorBanner>}

        <div className="mt-auto flex flex-col gap-sm pt-lg sm:flex-row">
          <button
            type="button"
            onClick={save}
            disabled={
              !showPreview || !parsed.amount || saving || authLoading
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-label text-sm text-on-primary-container shadow-sm transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
          >
            <Icon name="save" />
            {authLoading
              ? "Checking session…"
              : saving
                ? "Saving…"
                : "Save"}
          </button>
          <button
            type="button"
            onClick={clear}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-outline-variant px-6 py-3 font-label text-sm text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Icon name="delete_sweep" />
            Clear
          </button>
        </div>
      </PageMain>
    </>
  );
}

export default function PastePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[50dvh] w-full max-w-2xl items-center justify-center px-4">
          <p className="text-sm text-on-surface-variant">Loading…</p>
        </main>
      }
    >
      <PasteForm />
    </Suspense>
  );
}
