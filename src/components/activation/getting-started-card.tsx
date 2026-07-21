import { GettingStartedSteps } from "@/components/activation/getting-started-steps";
import type { ActivationChecklist } from "@/features/activation/checklist";
import { cn } from "@/lib/cn";

type Props = {
  checklist: ActivationChecklist;
  className?: string;
};

/** Full in-flow card (not overlay) — e.g. dashboard home sections. */
export function GettingStartedCard({ checklist, className }: Props) {
  if (checklist.complete) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-white px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:px-6",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
          Getting started
        </p>
        <p className="text-[12px] font-semibold tabular-nums text-muted">
          {checklist.doneCount}/{checklist.total}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-[#0e1f1c] transition-[width] duration-300"
          style={{
            width: `${Math.round((checklist.doneCount / checklist.total) * 100)}%`,
          }}
        />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Each step fills your network with confirmed evidence.
      </p>
      <div className="mt-3">
        <GettingStartedSteps steps={checklist.steps} />
      </div>
    </section>
  );
}
