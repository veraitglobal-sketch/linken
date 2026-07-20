import Link from "next/link";
import type { TrustProfile } from "@/features/trust/queries";

type Props = {
  trust: TrustProfile;
};

/** Owner-only — concrete next action toward the next Linken Level. */
export function TrustProgressCard({ trust }: Props) {
  const { nextStep, points, level } = trust;

  if (!nextStep.nextLevel) {
    return (
      <aside className="rounded-[24px] border border-[#0e1f1c]/15 bg-[#0e1f1c] px-5 py-5 text-white">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
          Your progress
        </p>
        <p className="mt-2 font-display text-lg tracking-[-0.03em]">
          Pillar · {points} points
        </p>
        <p className="mt-1.5 text-[13px] text-white/65">{nextStep.hint}</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[24px] border border-line bg-[#f7f8fa] px-5 py-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Your progress
      </p>
      <p className="mt-2 font-display text-lg font-medium tracking-[-0.03em] text-ink">
        {nextStep.pointsNeeded} point{nextStep.pointsNeeded === 1 ? "" : "s"} to{" "}
        {nextStep.nextLevel}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
        Currently {level} · {points} point{points === 1 ? "" : "s"}.{" "}
        {nextStep.hint}
      </p>
      <Link
        href={nextStep.href}
        className="mt-4 inline-block text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
      >
        Take the next step
      </Link>
    </aside>
  );
}
