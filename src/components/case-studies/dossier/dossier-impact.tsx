import type { CaseStudyMetric } from "@/types/case-study";

type Props = {
  highlightStat?: string;
  duration?: string;
  metrics: CaseStudyMetric[];
};

export function DossierImpact({ highlightStat, duration, metrics }: Props) {
  if (!highlightStat && !duration && !metrics.length) return null;

  return (
    <section className="relative -mx-4 overflow-hidden bg-navy px-4 py-16 text-white sm:-mx-6 sm:px-8 sm:py-20 lg:-mx-0 lg:rounded-[32px] lg:px-12">
      <div className="stage-grain absolute inset-0 opacity-40" />
      <div className="relative">
        <p className="font-mono text-[11px] tracking-[0.18em] text-blue-soft uppercase">
          Impact exhibit
        </p>
        {highlightStat ? (
          <p className="mt-6 font-display text-[clamp(2.5rem,7vw,5rem)] font-medium leading-[0.95] tracking-[-0.05em] text-white">
            {highlightStat}
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-8 border-t border-white/12 pt-8">
          {duration ? (
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-white/40 uppercase">
                Duration
              </p>
              <p className="mt-2 font-display text-3xl font-medium">{duration}</p>
            </div>
          ) : null}
          {metrics.map((m) => (
            <div key={`${m.label}-${m.value}`}>
              <p className="text-[10px] font-bold tracking-[0.12em] text-white/40 uppercase">
                {m.label}
              </p>
              <p className="mt-2 font-display text-3xl font-medium">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
