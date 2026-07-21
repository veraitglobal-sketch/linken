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
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-muted">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-line text-[11px] font-semibold text-muted"
                aria-hidden
              >
                ✓
              </span>
              <span className="line-through decoration-line">
                {step.label}
              </span>
            </div>
          ) : (
            <Link
              href={step.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[11px] font-semibold text-muted"
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
