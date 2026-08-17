"use client";

import { APP_NAME, DEFAULT_USER_LABEL } from "@/lib/brand";

import { useEffect, useState } from "react";
import { updateRegionAction } from "@/app/actions/region";
import { signOutAction } from "@/app/actions/auth";
import { RegionCurrencySheet } from "@/components/RegionCurrencySheet";
import { Icon } from "@/components/Icon";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain, PageTitle } from "@/components/PageMain";
import { useToast } from "@/components/Toast";
import { Toggle } from "@/components/Toggle";
import {
  Button,
  ListDivider,
  ListLinkRow,
  ListRow,
  Section,
  Text,
} from "@/components/ui";
import { getCountry } from "@/lib/countries";
import { useAuth } from "@/lib/auth";
import { downloadTransactionsCsv } from "@/lib/export-transactions";
import {
  canUseNotifications,
  requestNotificationPermission,
} from "@/lib/notifications";
import {
  getDeviceLockAvailability,
  hasDeviceLockRegistered,
  registerDeviceLock,
} from "@/lib/device-lock";
import {
  markAppUnlocked,
  type SettingsState,
} from "@/lib/settings-store";
import { useSettings } from "@/lib/settings";
import { useTransactions } from "@/lib/transactions";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const { settings, setSetting, setSettings } = useSettings();
  const { transactions, syncing, reload } = useTransactions();
  const { showToast } = useToast();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [deviceLockHint, setDeviceLockHint] = useState<string | null>(null);

  useEffect(() => {
    void getDeviceLockAvailability().then((support) => {
      setDeviceLockHint(support.reason);
    });
  }, []);

  const displayName = user?.name ?? DEFAULT_USER_LABEL;
  const initial = displayName.charAt(0).toUpperCase();
  const notificationStatus = canUseNotifications()
    ? "Browser notifications enabled"
    : "Tap a toggle to enable browser notifications";

  async function toggleNotification<K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) {
    if (value === true) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        showToast(
          "Allow notifications in your browser to use alerts",
          "error",
        );
        return;
      }
    }
    setSetting(key, value);
    showToast(value ? "Preference saved" : "Preference turned off", "success");
  }

  async function toggleBiometric(value: boolean) {
    if (!value) {
      setSetting("biometric", false);
      showToast("Device lock disabled", "success");
      return;
    }

    setBiometricBusy(true);
    const support = await getDeviceLockAvailability();
    if (!support.available) {
      setBiometricBusy(false);
      setDeviceLockHint(support.reason);
      showToast(
        support.reason ??
          "This device or browser does not support Face ID, fingerprint, or screen lock here.",
        "error",
      );
      return;
    }

    if (!hasDeviceLockRegistered()) {
      if (!user?.id) {
        setBiometricBusy(false);
        showToast("Sign in to enable device lock", "error");
        return;
      }
      const result = await registerDeviceLock({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      if (result.error) {
        setBiometricBusy(false);
        showToast(result.error, "error");
        return;
      }
    }

    setSetting("biometric", true);
    markAppUnlocked();
    setDeviceLockHint(null);
    setBiometricBusy(false);
    showToast("Device lock enabled", "success");
  }

  async function syncNow() {
    try {
      await reload();
      showToast("All up to date", "success");
    } catch {
      showToast("Couldn't update. Check your connection.", "error");
    }
  }

  function exportData() {
    if (transactions.length === 0) {
      showToast("Nothing to export yet", "error");
      return;
    }
    setExporting(true);
    downloadTransactionsCsv(transactions, settings.currency);
    setExporting(false);
    showToast(`Exported ${transactions.length} payments`, "success");
  }

  return (
    <>
      <MobileHeader title="Settings" />

      <PageMain className="flex flex-col gap-md">
        <PageTitle title="Settings" subtitle="Preferences & account" />

        <div className="overflow-hidden rounded-sheet bg-surface-container-lowest p-md shadow-sm">
          <div className="flex items-center gap-md">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-pill bg-secondary-container font-headline text-heading font-semibold text-on-secondary-container">
              {initial}
              <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-pill bg-primary ring-2 ring-surface-container-lowest" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-xs">
                <span className="truncate font-semibold text-on-surface">
                  {displayName}
                </span>
                {user && (
                  <Icon name="verified" fill className="text-caption text-primary" />
                )}
              </div>
              <Text variant="caption" className="block truncate">
                {user?.email ?? "Not signed in"}
              </Text>
              <span className="mt-xs inline-flex rounded-pill bg-surface-container-high px-sm py-0.5 text-micro font-medium tracking-wide text-on-surface-variant">
                Personal Account • Free
              </span>
            </div>
          </div>
        </div>

        <Text variant="caption" className="px-xs">
          {notificationStatus}
        </Text>

        <Section title="Home display">
          <ListRow
            icon="calendar_today"
            title="Daily summary"
            subtitle="Show how today is going on Home"
          >
            <Toggle
              checked={settings.dailySummary}
              onChange={(v) => setSetting("dailySummary", v)}
              label="Daily summary"
            />
          </ListRow>
          <ListDivider />
          <ListRow
            icon="warning"
            title="Category heads-up"
            subtitle="Tell you when one category takes most of your money"
          >
            <Toggle
              checked={settings.budgetWarnings}
              onChange={(v) => setSetting("budgetWarnings", v)}
              label="Category heads-up"
            />
          </ListRow>
          <ListDivider />
          <ListRow
            icon="auto_graph"
            title="Weekly Insights Digest"
            subtitle="Show a weekly recap on Insights"
            iconMuted
          >
            <Toggle
              checked={settings.weeklyDigest}
              onChange={(v) => setSetting("weeklyDigest", v)}
              label="Weekly Insights Digest"
            />
          </ListRow>
        </Section>

        <Section title="Browser alerts">
          <ListRow
            icon="bolt"
            title="When you save a payment"
            subtitle="Optional push alert after you paste an SMS or add manually"
          >
            <Toggle
              checked={settings.smsSync}
              onChange={(v) => toggleNotification("smsSync", v)}
              label="When you save a payment"
            />
          </ListRow>
        </Section>

        <Section title="Your data">
          <ListRow
            icon="content_paste"
            title="Auto-read SMS Clipboard"
            subtitle="Fill in pasted text when you open Record transaction from SMS"
          >
            <Toggle
              checked={settings.autoClipboard}
              onChange={(v) => {
                setSetting("autoClipboard", v);
                showToast(
                  v ? "Clipboard auto-read enabled" : "Clipboard auto-read off",
                  "success",
                );
              }}
              label="Auto-read SMS Clipboard"
            />
          </ListRow>
          <ListDivider />
          <ListRow
            icon="cloud_sync"
            title="Keep my data safe"
            subtitle={
              syncing
                ? "Updating…"
                : `${transactions.length} payments saved in your account`
            }
          >
            <button
              type="button"
              onClick={syncNow}
              disabled={syncing}
              className="flex h-11 w-11 items-center justify-center rounded-card bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 disabled:opacity-50"
              aria-label="Update now"
            >
              <Icon
                name="sync"
                className={`text-heading transition-transform ${syncing ? "animate-spin" : ""}`}
              />
            </button>
          </ListRow>
          <ListDivider />
          <button
            type="button"
            onClick={exportData}
            disabled={exporting}
            className="flex w-full items-center justify-between rounded-card p-sm text-left transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            <div className="flex min-w-0 items-center gap-sm pr-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-card bg-surface-container-low text-primary">
                <Icon name="file_download" className="text-heading" />
              </div>
              <div className="min-w-0">
                <span className="block truncate font-medium text-on-surface">
                  Export Financial Data
                </span>
                <Text variant="caption" className="block truncate">
                  Download spreadsheet as CSV
                </Text>
              </div>
            </div>
            <Icon name="chevron_right" className="shrink-0 text-heading text-outline" />
          </button>
        </Section>

        <Section title="Preferences & Security">
          <button
            type="button"
            onClick={() => setCurrencyOpen(true)}
            className="flex w-full items-center justify-between rounded-card p-sm text-left transition-colors hover:bg-surface-container-low"
          >
            <div className="flex items-center gap-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-card bg-surface-container-low text-primary">
                <Icon name="payments" className="text-heading" />
              </div>
              <span className="font-medium text-on-surface">Region & currency</span>
            </div>
            <div className="flex shrink-0 items-center gap-xs">
              <Text variant="caption" className="font-medium">
                {getCountry(settings.countryCode)?.name ?? settings.countryCode} ·{" "}
                {settings.currency}
              </Text>
              <Icon name="chevron_right" className="text-heading text-outline" />
            </div>
          </button>
          <ListDivider />
          <ListRow
            icon="fingerprint"
            title="Device Lock"
            subtitle="Face ID, fingerprint, or screen lock when reopening"
          >
            <Toggle
              checked={settings.biometric}
              onChange={(v) => {
                if (!biometricBusy) toggleBiometric(v);
              }}
              label="Device Lock"
            />
          </ListRow>
          {deviceLockHint && !settings.biometric && (
            <p className="px-md pb-sm text-xs leading-5 text-on-surface-variant">
              {deviceLockHint}
            </p>
          )}
        </Section>

        <Section title="Support & Account">
          <ListLinkRow href="/settings/help" icon="help_center" title="Help & FAQ" />
          <ListDivider />
          <ListLinkRow
            href="/settings/privacy"
            icon="security"
            title="Privacy Policy"
          />
        </Section>

        <form action={signOutAction}>
          <Button type="submit" variant="danger" fullWidth className="mt-xs">
            <Icon name="logout" className="text-heading" />
            Log Out
          </Button>
        </form>

        <div className="flex flex-col items-center gap-0.5 py-base text-center opacity-70">
          <Text variant="caption" className="font-medium tracking-wide">
            {APP_NAME} v0.1.0
          </Text>
          <Text variant="micro" className="text-outline">
            Crafted for mindful financial clarity
          </Text>
        </div>
      </PageMain>

      <RegionCurrencySheet
        open={currencyOpen}
        value={{
          countryCode: settings.countryCode,
          currency: settings.currency,
          locale: settings.locale,
        }}
        onSave={async (next) => {
          setSettings({ ...settings, ...next });
          const result = await updateRegionAction(next);
          if (result.error) {
            showToast(result.error, "error");
            return;
          }
          await refresh();
          showToast("Region updated", "success");
        }}
        onClose={() => setCurrencyOpen(false)}
      />
    </>
  );
}
