import Link from "next/link";
import type { TrustProfile } from "@/features/trust/queries";

type Props = {
  trust: TrustProfile;
};

/** Owner-only — concrete next action toward the next Hansala Level. */
export function TrustProgressCard({ trust }: Props) {
  const { nextStep, points, level } = trust;

  if (!nextStep.nextLevel) {
    return (
      <aside className="rounded-[24px] bg-navy p-4 text-on-navy sm:p-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">
          Your progress
        </p>
        <p className="mt-2 font-display text-[18px] font-semibold tracking-[-0.03em]">
          Pillar · {points} points
        </p>
        <p className="mt-1.5 text-[13px] text-on-navy-soft">{nextStep.hint}</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[24px] bg-lime-soft p-4 ring-1 ring-lime sm:p-5">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy/70 uppercase">
        Your progress
      </p>
      <p className="mt-2 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
        {nextStep.pointsNeeded} point{nextStep.pointsNeeded === 1 ? "" : "s"} to{" "}
        {nextStep.nextLevel}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
        Currently {level} · {points} point{points === 1 ? "" : "s"}.{" "}
        {nextStep.hint}
      </p>
      <Link
        href={nextStep.href}
        className="mt-4 inline-flex h-9 items-center rounded-full bg-navy px-4 text-[13px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
      >
        Take the next step
      </Link>
    </aside>
  );
}
