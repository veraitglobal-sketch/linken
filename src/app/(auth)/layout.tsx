import type { ReactNode } from "react";
import { SkipLink } from "@/components/a11y/skip-link";
import { OfferReminder } from "@/components/offer/offer-reminder";

/** Full-screen auth pages — no site header or footer around the form. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SkipLink />
      <main id="main-content" tabIndex={-1} className="flex min-h-dvh flex-1 flex-col">
        {children}
      </main>
      <OfferReminder />
    </div>
  );
}
