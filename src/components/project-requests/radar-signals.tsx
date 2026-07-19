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
      label: "Search referrals",
      value: Number(sources.search ?? 0),
      hint: "Profile visits from search",
    },
    {
      label: "One-pager views",
      value: analytics.onePagerViews,
      hint: "Verified one-pager opens",
    },
    {
      label: "Partner referrals",
      value: Number(sources.partner ?? 0),
      hint: "Visits via partner links",
    },
    {
      label: "QR scans",
      value: Number(sources.qr ?? 0) + Number(analytics.byType.qr_scan ?? 0),
      hint: "Scans from printed materials",
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
      <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
        Radar signals
      </h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        Demand hints from your profile analytics (last {analytics.days} days).
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {signals.map((s) => (
          <li
            key={s.label}
            className="rounded-xl border border-line bg-paper px-4 py-3"
          >
            <p className="text-[12px] font-medium text-ink-soft">{s.label}</p>
            <p className="mt-0.5 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
              {s.value}
            </p>
            <p className="mt-0.5 text-[11px] text-[#94a3b8]">{s.hint}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
