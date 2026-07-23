import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ActivationChecklist } from "@/features/activation/checklist";
import { getSiteUrl, companyShareLabel } from "@/lib/site";

type Props = {
  companyName: string;
  companySlug: string;
  checklist: ActivationChecklist;
  from: "claim" | "confirm" | "onboarding";
};

export function WelcomeHero({ companyName, companySlug, checklist, from }: Props) {
  const profileUrl = `/c/${companySlug}`;
  const siteUrl = getSiteUrl();
  const publicUrl = `${siteUrl}${profileUrl}`;
  const publicLabel = companyShareLabel(companySlug);

  const heading =
    from === "confirm"
      ? `You’re on Hansala, ${companyName.split(" ")[0]}`
      : from === "onboarding"
        ? "Your company link is live"
        : `Welcome, ${companyName.split(" ")[0]}`;

  const sub =
    from === "confirm"
      ? "You confirmed a relationship. Finish setup so your network shows real proof."
      : "Three minutes of setup — then clients see a verified page worth trusting.";

  const pct = Math.round((checklist.doneCount / checklist.total) * 100);

  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-navy px-7 py-10 text-white shadow-[0_28px_90px_rgba(8,20,18,0.28)] sm:px-11 sm:py-12">
      <div className="stage-grain absolute inset-0 z-[1]" />
      <div className="relative z-10">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
          Getting started · {checklist.doneCount}/{checklist.total} complete
        </p>
        <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3rem)] font-medium leading-[1.05] tracking-[-0.04em]">
          {heading}
        </h1>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/62">{sub}</p>

        <div className="mt-8 max-w-md">
          <div className="flex items-center justify-between text-[12px] text-white/50">
            <span>Setup progress</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-soft transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {checklist.next ? (
            <Button href={checklist.next.href} variant="light" className="h-12 min-w-[200px] px-6">
              Next: {checklist.next.label} →
            </Button>
          ) : (
            <Button href="/dashboard" variant="light" className="h-12 min-w-[200px] px-6">
              Open dashboard
            </Button>
          )}
          <Button href={profileUrl} variant="onDark" className="h-12 px-6">
            View live profile
          </Button>
        </div>

        <p className="mt-6 text-[13px] text-white/45">
          Your public link:{" "}
          <Link
            href={profileUrl}
            className="font-semibold text-white/75 underline-offset-2 hover:text-white hover:underline"
          >
            {publicLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
