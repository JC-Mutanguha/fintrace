"use client";

import { useCallback, useEffect, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import { Icon } from "@/components/Icon";
import { Button, ErrorBanner, Text } from "@/components/ui";
import { verifyDeviceLock } from "@/lib/device-lock";
import { markAppUnlocked } from "@/lib/settings-store";

type AppLockScreenProps = {
  onUnlock: () => void;
};

export function AppLockScreen({ onUnlock }: AppLockScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const unlock = useCallback(async () => {
    setUnlocking(true);
    setError(null);
    const result = await verifyDeviceLock();
    setUnlocking(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    markAppUnlocked();
    onUnlock();
  }, [onUnlock]);

  useEffect(() => {
    unlock();
  }, [unlock]);

  return (
    <div className="fixed inset-0 z-lock flex flex-col items-center justify-center bg-surface px-gutter">
      <div className="mb-lg flex h-16 w-16 items-center justify-center rounded-sheet bg-primary-container text-on-primary-container">
        <Icon name="account_balance_wallet" className="text-title" />
      </div>
      <Text as="h1" variant="heading">
        {APP_NAME} is locked
      </Text>
      <Text variant="muted" className="mt-xs text-center">
        Use your device Face ID, fingerprint, or screen lock to continue.
      </Text>
      {error && error !== "Unlock cancelled" && (
        <div className="mt-md max-w-dialog">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}
      <Button
        fullWidth
        className="mt-lg max-w-dialog"
        onClick={unlock}
        disabled={unlocking}
      >
        <Icon name="fingerprint" className="text-heading" />
        {unlocking ? "Waiting for device…" : "Unlock with device"}
      </Button>
    </div>
  );
}
