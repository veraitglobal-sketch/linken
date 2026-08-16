import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";

/** Hero + primary CTAs for the developer partner program. */
export function PartnerProgramHero() {
  return (
    <header className="max-w-2xl">
      <div className="flex items-center gap-2.5">
        <NetworkMark size={18} animate={false} className="text-blue" />
        <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
          Developer partners
        </p>
      </div>
      <h1 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink text-balance">
        10% of every paid invoice from companies you refer.
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        For agencies, studios, and integrators who put clients on Hansala. When
        a referred company pays for Pro, you accrue 10% of that invoice —
        recurring, only when the invoice is paid. Nothing from confirmations.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          href="/onboarding?kind=developer_partner"
          className="h-12 min-w-[200px] px-6"
        >
          Join as a developer partner
        </Button>
        <Button
          href="/login?next=/dashboard"
          variant="secondary"
          className="h-12 min-w-[160px] px-6"
        >
          Sign in to Earnings
        </Button>
      </div>
      <p className="mt-4 text-[13px] text-muted">
        Same Hansala login. Partner workspaces get Earnings — not the company
        operate shell.{" "}
        <Link
          href="/developers"
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          API docs
        </Link>
        {" · "}
        <Link
          href="/pricing"
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          Pricing
        </Link>
      </p>
    </header>
  );
}
