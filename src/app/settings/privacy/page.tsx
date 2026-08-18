import Link from "next/link";
import { MobileHeader } from "@/components/MobileHeader";
import { PageMain } from "@/components/PageMain";
import { APP_NAME, PRIVACY_EMAIL } from "@/lib/brand";

export default function PrivacyPage() {
  return (
    <>
      <MobileHeader title="Privacy Policy" backHref="/settings" />
      <PageMain className="space-y-4 text-sm leading-6 text-on-surface-variant">
        <p className="text-base font-medium text-on-surface">Last updated: September 2026</p>

        <section className="space-y-2">
          <h2 className="font-headline text-base font-semibold text-on-surface">
            What we collect
          </h2>
          <p>
            {APP_NAME} stores your email, display name, and the payments you
            choose to save (amount, category, merchant, and optional SMS text).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-base font-semibold text-on-surface">
            How we use it
          </h2>
          <p>
            Your data powers your summaries, history, and insights in the app.
            We do not sell your financial data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-base font-semibold text-on-surface">
            Where it is stored
          </h2>
          <p>
            Account and payment data is stored securely in the cloud.
            App preferences and device lock settings stay on this phone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-base font-semibold text-on-surface">
            Your choices
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Export your payments anytime from Settings.</li>
            <li>Delete account data by contacting support.</li>
            <li>Turn off notifications and clipboard access in Settings.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-headline text-base font-semibold text-on-surface">
            Contact
          </h2>
          <p>
            Questions about privacy?{" "}
            <Link href={`mailto:${PRIVACY_EMAIL}`} className="font-semibold text-primary">
              {PRIVACY_EMAIL}
            </Link>
          </p>
        </section>
      </PageMain>
    </>
  );
}
