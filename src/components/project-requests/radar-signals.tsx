import type { AnalyticsSummary } from "@/features/analytics/queries";

type Signal = {
  label: string;
  value: number;
  hint: string;
};

function buildSignals(analytics: AnalyticsSummary): Signal[] {
  const sources = analytics.bySource;
  return [
    {
      label: "Search",
      value: Number(sources.search ?? 0),
      hint: "Profile visits from search",
    },
    {
      label: "One-pager",
      value: analytics.onePagerViews,
      hint: "Verified one-pager opens",
    },
    {
      label: "Partners",
      value: Number(sources.partner ?? 0),
      hint: "Visits via partner links",
    },
    {
      label: "QR",
      value: Number(sources.qr ?? 0) + Number(analytics.byType.qr_scan ?? 0),
      hint: "Scans from print",
    },
  ];
}

type Props = {
  analytics: AnalyticsSummary;
};

export function RadarSignals({ analytics }: Props) {
  const signals = buildSignals(analytics);

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Signals
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Demand hints from your profile (last {analytics.days} days).
          </p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {signals.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-surface px-3.5 py-3.5 shadow-[0_1px_0_rgba(8,20,18,0.03)]"
          >
            <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
              {s.label}
            </p>
            <p className="mt-1.5 font-display text-[24px] font-semibold tracking-[-0.04em] text-ink">
              {s.value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">{s.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
