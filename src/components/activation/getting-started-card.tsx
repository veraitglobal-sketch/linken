import Link from "next/link";
import type { ActivationChecklist } from "@/features/activation/checklist";
import { cn } from "@/lib/cn";

type Props = {
  checklist: ActivationChecklist;
  /** Compact overlay on the network graph. */
  variant?: "panel" | "overlay";
  className?: string;
};

export function GettingStartedCard({
  checklist,
  variant = "panel",
  className,
}: Props) {
  if (checklist.complete) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]",
        variant === "overlay" ? "px-4 py-4" : "px-5 py-5 sm:px-6",
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
      <ul className="mt-3 space-y-1">
        {checklist.steps.map((step) => (
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
    </section>
  );
}
