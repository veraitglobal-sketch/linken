import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
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
    <ProfileSection
      icon={ProfileIcons.highlights}
      title="What clients highlight"
      description="Structured strengths from confirmed clients — not star ratings or public reviews."
    >
      {showWould ? (
        <p className="font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
          {summary.wouldWorkAgainYes} of {summary.wouldWorkAgainTotal} clients
          would work with them again
        </p>
      ) : null}

      {showStrengths ? (
        <p className={showWould ? "mt-3 text-[14px] text-ink-soft" : "text-[14px] text-ink-soft"}>
          Clients highlight:{" "}
          {summary.topStrengths
            .map((s) => `${s.label.toLowerCase()} (${s.count})`)
            .join(", ")}
        </p>
      ) : null}
    </ProfileSection>
  );
}
