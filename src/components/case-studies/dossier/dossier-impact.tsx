import type { CaseStudyMetric } from "@/types/case-study";

type Props = {
  highlightStat?: string;
  duration?: string;
  metrics: CaseStudyMetric[];
};

export function DossierImpact({ highlightStat, duration, metrics }: Props) {
  if (!highlightStat && !duration && !metrics.length) return null;

  return (
    <section className="border-y border-[var(--cf-line)] bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6 text-center">
        {highlightStat ? (
          <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.05em] text-[var(--cf-ink)]">
            {highlightStat}
          </p>
        ) : null}
        {(duration || metrics.length > 0) && (
          <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {duration ? (
              <div>
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
                  Duration
                </dt>
                <dd className="mt-1 font-display text-2xl font-medium text-[var(--cf-ink)]">
                  {duration}
                </dd>
              </div>
            ) : null}
            {metrics.map((m) => (
              <div key={`${m.label}-${m.value}`}>
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
                  {m.label}
                </dt>
                <dd className="mt-1 font-display text-2xl font-medium text-[var(--cf-ink)]">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
