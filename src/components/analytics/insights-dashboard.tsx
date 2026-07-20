"use client";

import type { ReactNode } from "react";
import {
  ChannelDonut,
  IntertwinedActivityChart,
  MetricAreaChart,
  SourceSegmentBar,
  type ChartPoint,
} from "@/components/analytics/charts";
import { WorkspaceCard, WorkspacePage } from "@/components/dashboard/workspace-page";
import type { AnalyticsSummary } from "@/features/analytics/queries";
import type { CompanyPlan } from "@/features/plan/entitlements";
import { getEntitlements } from "@/features/plan/entitlements";
import { cn } from "@/lib/cn";

const SOURCE_META: {
  key: string;
  label: string;
  color: string;
}[] = [
  { key: "direct", label: "Direct", color: "#0e1f1c" },
  { key: "search", label: "Search", color: "#1a5c51" },
  { key: "partner", label: "Partners", color: "#7eb8a4" },
  { key: "qr", label: "QR", color: "#3a423e" },
  { key: "embed", label: "Embed", color: "#66706b" },
  { key: "one_pager", label: "One-pager", color: "#8a948e" },
  { key: "external", label: "External", color: "#a8b0aa" },
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
      color: "#0e1f1c",
    },
    {
      key: "one",
      label: "One-pager",
      value: analytics.onePagerViews,
      color: "#1a5c51",
    },
    {
      key: "embed",
      label: "Embed",
      value: analytics.embedViews,
      color: "#7eb8a4",
    },
    {
      key: "inq",
      label: "Inquiries",
      value: analytics.inquiries,
      color: "#3a423e",
    },
  ];

  const topChannel = [...channelSegments].sort((a, b) => b.value - a.value)[0];
  const channelSum = channelSegments.reduce((s, x) => s + x.value, 0) || 1;
  const topPct = topChannel
    ? `${Math.round((topChannel.value / channelSum) * 100)}%`
    : "0%";

  const engagement =
    visitTotal > 0
      ? Math.min(100, Math.round((inquiryTotal / visitTotal) * 100))
      : 0;

  return (
    <WorkspacePage
      wide
      title="Insights"
      description="How your public profile performs — visits, inquiries, and where traffic comes from."
    >
      <WorkspaceCard className="overflow-hidden !p-0">
        <div className="flex items-center gap-1 border-b border-[#f1f5f9] px-2 pt-2">
          <span className="rounded-t-lg border border-b-0 border-[#e8eaee] bg-white px-3.5 py-2 text-[12px] font-semibold text-ink">
            Overview
          </span>
          <span className="px-3.5 py-2 text-[12px] font-medium text-[#94a3b8]">
            Last {analytics.days} days
          </span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="border-b border-[#f1f5f9] p-5 lg:border-r lg:border-b-0">
            <p className="text-[12px] font-medium text-[#64748b]">
              Profile visits analysed
            </p>
            <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink">
              <span className="text-[#16a34a]">Completed: {visitTotal}</span>
              <span className="mx-2 text-[#cbd5e1]">·</span>
              <span className="text-[#64748b]">
                Inquiries: {inquiryTotal}
              </span>
            </p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eef1ef] p-0.5">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.max(engagement, visitTotal ? 4 : 0)}%`,
                  background:
                    "linear-gradient(90deg, #7eb8a4 0%, #1a5c51 55%, #0e1f1c 100%)",
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#94a3b8]">
              Inquiry rate {inquiryRate}% of visits
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniStat label="Transfer → inquiry" value={`${inquiryRate}%`} />
              <MiniStat
                label="Channels"
                value={String(
                  analytics.profileViews +
                    analytics.onePagerViews +
                    analytics.embedViews,
                )}
              />
            </div>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <ChartPane label="Site visits" value={visitTotal}>
              <MetricAreaChart
                data={points}
                dataKey="visits"
                name="Visits"
                color="#0e1f1c"
                colorSoft="#1a5c51"
                gradientId="visitsGrad"
              />
            </ChartPane>
            <ChartPane
              label="Inquiries"
              value={inquiryTotal}
              className="border-t border-[#f1f5f9] sm:border-t-0 sm:border-l"
            >
              <MetricAreaChart
                data={points}
                dataKey="inquiries"
                name="Inquiries"
                color="#1a5c51"
                colorSoft="#7eb8a4"
                gradientId="inqGrad"
              />
            </ChartPane>
          </div>
        </div>
      </WorkspaceCard>

      {full ? (
        <div className="mt-5 space-y-5">
          <WorkspaceCard>
            <div className="mb-1">
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                Activity over time
              </h3>
              <p className="mt-0.5 text-[12px] text-[#64748b]">
                Visits, inquiries, one-pager and embed intertwined
              </p>
            </div>
            <div className="mt-3 h-[280px]">
              <IntertwinedActivityChart data={points} />
            </div>
          </WorkspaceCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <WorkspaceCard>
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
            </WorkspaceCard>

            <WorkspaceCard>
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
            </WorkspaceCard>
          </div>
        </div>
      ) : (
        <WorkspaceCard className="relative mt-5 overflow-hidden">
          <div className="pointer-events-none select-none blur-[2.5px]" aria-hidden>
            <div className="h-[200px]">
              <IntertwinedActivityChart data={points} />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 px-6 text-center">
            <div>
              <p className="text-[15px] font-semibold text-ink">
                Full trends & source mix
              </p>
              <p className="mt-1 text-[13px] text-[#64748b]">
                Intertwined activity and breakdown — Pro
              </p>
            </div>
          </div>
        </WorkspaceCard>
      )}
    </WorkspacePage>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#eef1f6] bg-[#fafbfc] px-3 py-2.5">
      <p className="text-[11px] text-[#94a3b8]">{label}</p>
      <p className="mt-0.5 text-[18px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function ChartPane({
  label,
  value,
  children,
  className,
}: {
  label: string;
  value: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-5", className)}>
      <p className="text-[12px] font-medium text-[#64748b]">{label}</p>
      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-ink">
        {value}
      </p>
      <div className="mt-3 h-[168px] rounded-2xl bg-[linear-gradient(180deg,#f7faf8_0%,#ffffff_55%)] px-1 pt-2">
        {children}
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#8a948e]">
        <span className="inline-block h-0.5 w-3 rounded-full bg-gradient-to-r from-[#7eb8a4] to-[#0e1f1c]" />
        Trend
      </p>
    </div>
  );
}
