import type { ClientAssessmentSummary } from "@/features/assessments/queries";

type Props = {
  summary: ClientAssessmentSummary;
};

export function ClientHighlights({ summary }: Props) {
  const showWould =
    summary.wouldWorkAgainTotal >= 3;
  const showStrengths = summary.topStrengths.length > 0;

  if (summary.assessmentCount === 0 || (!showWould && !showStrengths)) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-line bg-surface px-5 py-6 sm:px-7 sm:py-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Client signals
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.45rem,2.4vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
        What clients highlight
      </h2>
      <p className="mt-2 max-w-xl text-[13px] text-ink-soft">
        Structured strengths from confirmed clients — not star ratings or public
        reviews.
      </p>

      {showWould ? (
        <p className="mt-5 font-display text-lg tracking-[-0.03em] text-ink">
          {summary.wouldWorkAgainYes} of {summary.wouldWorkAgainTotal} clients
          would work with them again
        </p>
      ) : null}

      {showStrengths ? (
        <p className={showWould ? "mt-3 text-[14px] text-ink-soft" : "mt-5 text-[14px] text-ink-soft"}>
          Clients highlight:{" "}
          {summary.topStrengths
            .map((s) => `${s.label.toLowerCase()} (${s.count})`)
            .join(", ")}
        </p>
      ) : null}
    </section>
  );
}
