import Link from "next/link";
import type { ActivationStep } from "@/features/activation/checklist";

type Props = {
  step: ActivationStep;
};

/** Thin owner-only cue — one next action, not the full checklist. */
export function NextStepStrip({ step }: Props) {
  return (
    <div className="mx-auto mt-4 max-w-6xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
            Next step
          </p>
          <p className="mt-0.5 truncate text-[13px] font-medium text-ink">
            {step.label}
          </p>
        </div>
        <Link
          href={step.href}
          className="shrink-0 text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Continue →
        </Link>
      </div>
    </div>
  );
}
