import { GettingStartedSteps } from "@/components/activation/getting-started-steps";
import { HomePanel } from "@/components/dashboard/home/home-panel";
import type { ActivationChecklist } from "@/features/activation/checklist";

type Props = {
  checklist: ActivationChecklist;
  className?: string;
};

export function GettingStartedCard({ checklist, className }: Props) {
  if (checklist.complete) return null;

  return (
    <HomePanel
      label="Getting started"
      meta={`${checklist.doneCount}/${checklist.total}`}
      className={className}
    >
      <div className="h-1.5 overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-navy"
          style={{
            width: `${Math.round((checklist.doneCount / checklist.total) * 100)}%`,
          }}
        />
      </div>
      <div className="mt-3">
        <GettingStartedSteps steps={checklist.steps} />
      </div>
    </HomePanel>
  );
}
