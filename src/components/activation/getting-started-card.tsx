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
        "rounded-2xl border border-[#e2e8f0] bg-white px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:px-6",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
          Getting started
        </p>
        <p className="text-[12px] font-semibold tabular-nums text-[#64748b]">
          {checklist.doneCount}/{checklist.total}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1f5f9]">
        <div
          className="h-full rounded-full bg-[#10231f] transition-[width] duration-300"
          style={{
            width: `${Math.round((checklist.doneCount / checklist.total) * 100)}%`,
          }}
        />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-[#64748b]">
        Each step fills your network with confirmed evidence.
      </p>
      <div className="mt-3">
        <GettingStartedSteps steps={checklist.steps} />
      </div>
    </section>
  );
}
