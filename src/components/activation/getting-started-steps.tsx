import Link from "next/link";
import type { ActivationStep } from "@/features/activation/checklist";

type Props = {
  steps: ActivationStep[];
  onNavigate?: () => void;
};

/** Shared ✓ / → step list for card + popover. */
export function GettingStartedSteps({ steps, onNavigate }: Props) {
  return (
    <ul className="space-y-1">
      {steps.map((step) => (
        <li key={step.id}>
          {step.done ? (
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-[#94a3b8]">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e2e8f0] text-[11px] font-semibold text-[#64748b]"
                aria-hidden
              >
                ✓
              </span>
              <span className="line-through decoration-[#cbd5e1]">
                {step.label}
              </span>
            </div>
          ) : (
            <Link
              href={step.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-[#f8fafc]"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#cbd5e1] text-[11px] font-semibold text-[#64748b]"
                aria-hidden
              >
                →
              </span>
              <span>{step.label}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
