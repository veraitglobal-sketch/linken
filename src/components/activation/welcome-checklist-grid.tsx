import Link from "next/link";
import type { ActivationStep } from "@/features/activation/checklist";

type Props = {
  steps: ActivationStep[];
};

export function WelcomeChecklistGrid({ steps }: Props) {
  return (
    <section className="mt-8">
      <header className="mb-4 px-0.5">
        <h2 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
          Path to your first verified reference
        </h2>
        <p className="mt-1 text-[14px] text-muted">
          You can skip ahead or continue later. The next incomplete step is your
          best action.
        </p>
      </header>
      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.id}>
            <WelcomeStepCard step={step} index={index + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function WelcomeStepCard({ step, index }: { step: ActivationStep; index: number }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${
            step.done
              ? "bg-[#1a5c51]/12 text-blue"
              : "border border-line bg-paper text-muted"
          }`}
        >
          {step.done ? "✓" : index}
        </span>
        {!step.done ? (
          <span className="text-[12px] font-semibold text-ink">Open →</span>
        ) : (
          <span className="text-[11px] font-semibold tracking-[0.08em] text-blue uppercase">
            Done
          </span>
        )}
      </div>
      <p
        className={`mt-3 text-[15px] font-semibold leading-snug ${
          step.done ? "text-muted line-through decoration-line" : "text-ink"
        }`}
      >
        {step.label}
      </p>
    </>
  );

  if (step.done) {
    return (
      <div className="h-full rounded-[24px] border border-line bg-paper/80 px-5 py-5">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={step.href}
      className="group block h-full rounded-[24px] border border-line bg-surface px-5 py-5 shadow-[0_8px_28px_rgba(8,20,18,0.04)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-blue/30 hover:shadow-[0_14px_40px_rgba(8,20,18,0.08)]"
    >
      {content}
    </Link>
  );
}
