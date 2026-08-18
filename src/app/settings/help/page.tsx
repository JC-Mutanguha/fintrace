"use client";

import Link from "next/link";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain } from "@/components/PageMain";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/brand";

const faqs = [
  {
    q: "How do I record a transaction from SMS?",
    a: "Tap Record transaction on Home, choose From SMS, paste a payment SMS, check the amount looks right, then tap Save.",
  },
  {
    q: `Can ${APP_NAME} read my SMS inbox automatically?`,
    a: `No. For your privacy, the app can't open your inbox. Copy the message or share it into ${APP_NAME} instead.`,
  },
  {
    q: "Where is my data stored?",
    a: "Your payments are saved to your account in the cloud. Settings like notifications stay on this phone.",
  },
  {
    q: "How do I export my data?",
    a: "Go to Settings → Export Financial Data to download a spreadsheet.",
  },
  {
    q: "What does Device Lock do?",
    a: `When turned on, ${APP_NAME} asks for Face ID, fingerprint, or your screen lock when you reopen the app.`,
  },
  {
    q: "Why does Device Lock say it is not supported?",
    a: "Browsers only allow biometrics on secure https:// pages — not http://192.168… on your home Wi‑Fi. Use your deployed FinTrace URL, or run npm run dev:https for local testing. iPhone also needs a domain name; IP addresses often will not work even with HTTPS.",
  },
  {
    q: "Why are notifications not arriving on iPhone?",
    a: `Add ${APP_NAME} to your home screen first. iPhone only supports notifications for installed apps (iOS 16.4+).`,
  },
] as const;

export default function HelpPage() {
  return (
    <>
      <MobileHeader title="Help & FAQ" backHref="/settings" />
      <PageMain className="space-y-4">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl bg-surface-container-lowest p-4 shadow-sm"
          >
            <summary className="cursor-pointer list-none font-medium text-on-surface marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {item.q}
                <span className="text-on-surface-variant transition-transform group-open:rotate-180">
                  ▾
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {item.a}
            </p>
          </details>
        ))}
        <p className="pt-2 text-center text-sm text-on-surface-variant">
          Need more help?{" "}
          <Link href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-primary">
            Email support
          </Link>
        </p>
      </PageMain>
    </>
  );
}
