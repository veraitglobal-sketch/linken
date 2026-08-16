import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Closing CTA — join or open Earnings if already a partner. */
export function PartnerProgramClose() {
  return (
    <section className="mt-16 border-t border-line/70 pt-12 pb-4">
      <h2 className="max-w-lg font-display text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.035em] text-ink">
        Ready to refer?
      </h2>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
        Create a developer partner workspace, copy your link, and send it to
        clients you already work with.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          href="/onboarding?kind=developer_partner"
          className="h-11 min-w-[200px] px-5"
        >
          Join as a developer partner
        </Button>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Questions? Contact us
        </Link>
      </div>
    </section>
  );
}
