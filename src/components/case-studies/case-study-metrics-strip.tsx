import type { CaseStudyMetric } from "@/types/case-study";

type Props = {
  metrics: CaseStudyMetric[];
  highlightStat?: string;
  duration?: string;
};

export function CaseStudyMetricsStrip({ metrics, highlightStat, duration }: Props) {
  if (!metrics.length && !highlightStat && !duration) return null;

  return (
    <section>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {highlightStat ? (
          <div className="rounded-[24px] bg-navy px-6 py-7 text-white sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:flex lg:flex-col lg:justify-end">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
              Headline result
            </p>
            <p className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-none tracking-[-0.04em]">
              {highlightStat}
            </p>
          </div>
        ) : null}
        {duration ? (
          <MetricCard label="Duration" value={duration} />
        ) : null}
        {metrics.map((m) => (
          <MetricCard key={`${m.label}-${m.value}`} label={m.label} value={m.value} />
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: CaseStudyMetric) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-6 py-6 shadow-[0_8px_28px_rgba(8,20,18,0.04)]">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {value}
      </p>
    </div>
  );
}
