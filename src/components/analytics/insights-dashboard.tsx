"use client";

import {
  ChannelDonut,
  IntertwinedActivityChart,
  MetricAreaChart,
  MetricCard,
  SourceSegmentBar,
  type ChartPoint,
} from "@/components/analytics/charts";
import type { AnalyticsSummary } from "@/features/analytics/queries";
import type { CompanyPlan } from "@/features/plan/entitlements";
import { getEntitlements } from "@/features/plan/entitlements";

const SOURCE_META: {
  key: string;
  label: string;
  color: string;
}[] = [
  { key: "direct", label: "Direct", color: "#0b1220" },
  { key: "search", label: "Search", color: "#3b82f6" },
  { key: "partner", label: "Partners", color: "#64748b" },
  { key: "qr", label: "QR", color: "#94a3b8" },
  { key: "embed", label: "Embed", color: "#cbd5e1" },
  { key: "one_pager", label: "One-pager", color: "#475569" },
  { key: "external", label: "External", color: "#78716c" },
];

function formatLabel(day: string) {
  const d = new Date(`${day.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
}

function toPoints(analytics: AnalyticsSummary): ChartPoint[] {
  return analytics.byDay.map((d) => ({
    day: d.day,
    label: formatLabel(d.day),
    visits: d.visits,
    inquiries: d.inquiries,
    onePager: d.onePager,
    embed: d.embed,
  }));
}

type Props = {
  analytics: AnalyticsSummary;
  plan: CompanyPlan;
};

export function InsightsDashboard({ analytics, plan }: Props) {
  const full = getEntitlements(plan).fullAnalytics;
  const points = toPoints(analytics);
  const visitTotal = analytics.profileViews;
  const inquiryTotal = analytics.inquiries;
  const inquiryRate =
    visitTotal > 0 ? ((inquiryTotal / visitTotal) * 100).toFixed(1) : "0.0";

  const sourceSegments = SOURCE_META.map((s) => ({
    ...s,
    value: analytics.bySource[s.key] ?? 0,
  })).filter((s) => s.value > 0);

  const channelSegments = [
    {
      key: "profile",
      label: "Profile",
      value: analytics.profileViews,
      color: "#0b1220",
    },
    {
      key: "one",
      label: "One-pager",
      value: analytics.onePagerViews,
      color: "#3b82f6",
    },
    {
      key: "embed",
      label: "Embed",
      value: analytics.embedViews,
      color: "#94a3b8",
    },
    {
      key: "inq",
      label: "Inquiries",
      value: analytics.inquiries,
      color: "#64748b",
    },
  ];

  const topChannel = [...channelSegments].sort((a, b) => b.value - a.value)[0];
  const channelSum = channelSegments.reduce((s, x) => s + x.value, 0) || 1;
  const topPct = topChannel
    ? `${Math.round((topChannel.value / channelSum) * 100)}%`
    : "0%";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#64748b]">
            Profile traffic & inquiries · last {analytics.days} days
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-ink">
            Insights
          </h2>
        </div>
        <p className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1 text-[11px] font-medium text-[#64748b]">
          Confirmed events only
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Profile visits", value: visitTotal },
          { label: "Inquiries", value: inquiryTotal },
          { label: "Inquiry rate", value: `${inquiryRate}%` },
          {
            label: "Channels",
            value:
              analytics.onePagerViews +
              analytics.embedViews +
              analytics.profileViews,
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-3.5"
          >
            <p className="text-[11px] font-medium text-[#94a3b8]">{m.label}</p>
            <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-ink">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricCard label="Site visits" value={visitTotal}>
          <MetricAreaChart
            data={points}
            dataKey="visits"
            name="Visits"
            color="#0b1220"
            gradientId="visitsGrad"
          />
        </MetricCard>
        <MetricCard
          label="Inquiries"
          value={inquiryTotal}
          suffix={visitTotal ? `· ${inquiryRate}%` : undefined}
        >
          <MetricAreaChart
            data={points}
            dataKey="inquiries"
            name="Inquiries"
            color="#3b82f6"
            gradientId="inqGrad"
          />
        </MetricCard>
      </div>

      {full ? (
        <>
          <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                  Activity over time
                </h3>
                <p className="mt-0.5 text-[12px] text-[#64748b]">
                  Visits, inquiries, one-pager and embed — intertwined
                </p>
              </div>
            </div>
            <div className="mt-2 h-[280px]">
              <IntertwinedActivityChart data={points} />
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                Traffic sources
              </h3>
              <p className="mt-0.5 text-[12px] text-[#64748b]">
                Where profile events came from
              </p>
              <div className="mt-5">
                {sourceSegments.length === 0 ? (
                  <p className="text-[13px] text-[#94a3b8]">No source data yet.</p>
                ) : (
                  <SourceSegmentBar segments={sourceSegments} />
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                Channel mix
              </h3>
              <p className="mt-0.5 text-[12px] text-[#64748b]">
                Profile · one-pager · embed · inquiries
              </p>
              <div className="mt-5">
                <ChannelDonut
                  segments={channelSegments}
                  centerValue={topPct}
                  centerLabel={topChannel?.label ?? "—"}
                />
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6">
          <div className="pointer-events-none select-none blur-[2.5px]" aria-hidden>
            <div className="h-[220px]">
              <IntertwinedActivityChart data={points} />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 px-6 text-center">
            <div>
              <p className="text-[15px] font-semibold text-ink">
                Full trends & source mix
              </p>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Intertwined activity and source breakdown — Pro
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
