import { loadSettings } from "@/lib/settings-store";
import { formatMoney } from "@/lib/money";

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function canUseNotifications(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

export function notifyTransactionSaved(amount: number, merchant: string) {
  const settings = loadSettings();
  if (!settings.smsSync || !canUseNotifications()) return;

  const formatted = formatMoney(amount, settings.currency, settings.locale);
  new Notification("Saved", {
    body: `${formatted} — ${merchant}`,
    icon: "/icon.svg",
    tag: "paytrace-save",
  });
}

export function notifySyncComplete(count: number) {
  if (!canUseNotifications()) return;
  new Notification("You're up to date", {
    body: `${count} payment${count === 1 ? "" : "s"} loaded.`,
    icon: "/icon.svg",
    tag: "paytrace-sync",
  });
}
