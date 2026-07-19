import { AssessmentForm } from "@/components/assessments/assessment-form";
import type { AssessmentSourceType } from "@/features/assessments/catalog";

type Props = {
  sourceType: AssessmentSourceType;
  sourceId: string;
  providerName: string;
  providerSlug?: string;
  returnTo: string;
  alreadyAssessed: boolean;
  assessedJustNow?: boolean;
  skipped?: boolean;
};

export function PostConfirmAssessment({
  sourceType,
  sourceId,
  providerName,
  providerSlug,
  returnTo,
  alreadyAssessed,
  assessedJustNow = false,
  skipped = false,
}: Props) {
  if (assessedJustNow || alreadyAssessed || skipped) {
    const title = assessedJustNow
      ? "Thanks for sharing"
      : skipped
        ? "Confirmed"
        : "Already confirmed";
    const body = assessedJustNow
      ? "Your confirmation is on Linken. Strengths help others know what to expect."
      : "This confirmation is recorded on Linken. No public review was required.";
    return (
      <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center sm:px-7">
        <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#1f6b5c]/25 bg-[#1f6b5c]/8 px-5 py-5 text-center sm:px-7">
        <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          Confirmed
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-soft">
          Thank you — this is now verified on Linken.
        </p>
      </div>
      <AssessmentForm
        sourceType={sourceType}
        sourceId={sourceId}
        providerName={providerName}
        providerSlug={providerSlug}
        returnTo={returnTo}
      />
    </div>
  );
}
