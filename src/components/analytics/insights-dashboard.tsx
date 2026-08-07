"use client";

import {
  LazyIntertwinedChart,
} from "@/components/analytics/lazy-intertwined-chart";
import { InsightsFull } from "@/components/analytics/insights-full";
import { InsightsOverview } from "@/components/analytics/insights-overview";
import { WorkspaceCard, WorkspacePage } from "@/components/dashboard/workspace-page";
import type { ChartPoint } from "@/components/analytics/chart-types";
import type { AnalyticsSummary } from "@/features/analytics/queries";
import type { CompanyPlan } from "@/features/plan/entitlements";
import { getEntitlements } from "@/features/plan/entitlements";
import Link from "next/link";

const SOURCE_META: { key: string; label: string; color: string }[] = [
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
    { key: "profile", label: "Profile", value: analytics.profileViews, color: "#0e1f1c" },
    { key: "one", label: "One-pager", value: analytics.onePagerViews, color: "#1a5c51" },
    { key: "embed", label: "Embed", value: analytics.embedViews, color: "#7eb8a4" },
    { key: "inq", label: "Inquiries", value: analytics.inquiries, color: "#3a423e" },
  ];

  const topChannel = [...channelSegments].sort((a, b) => b.value - a.value)[0];
  const channelSum = channelSegments.reduce((s, x) => s + x.value, 0) || 1;
  const topPct = topChannel
    ? `${Math.round((topChannel.value / channelSum) * 100)}%`
    : "0%";

  return (
    <WorkspacePage
      wide
      title="Insights"
      description="How your public profile performs — visits, inquiries, and traffic sources."
      action={
        <span className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink">
          Last {analytics.days} days
        </span>
      }
    >
      <div className="space-y-10">
        <InsightsOverview
          points={points}
          visitTotal={visitTotal}
          inquiryTotal={inquiryTotal}
          inquiryRate={inquiryRate}
          channelTotal={
            analytics.profileViews +
            analytics.onePagerViews +
            analytics.embedViews
          }
        />

        {full ? (
          <InsightsFull
            points={points}
            sourceSegments={sourceSegments}
            channelSegments={channelSegments}
            topPct={topPct}
            topLabel={topChannel?.label ?? "—"}
          />
        ) : (
          <WorkspaceCard className="relative overflow-hidden">
            <div
              className="pointer-events-none select-none blur-[2.5px]"
              aria-hidden
            >
              <div className="h-[200px]">
                <LazyIntertwinedChart data={points} />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-surface/80 px-6 text-center">
              <div>
                <p className="text-[15px] font-semibold text-ink">
                  Full trends &amp; source mix
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  Intertwined activity and breakdown —{" "}
                  <Link
                    href="/dashboard/billing"
                    className="font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    upgrade to Pro
                  </Link>
                </p>
              </div>
            </div>
          </WorkspaceCard>
        )}
      </div>
    </WorkspacePage>
  );
}
