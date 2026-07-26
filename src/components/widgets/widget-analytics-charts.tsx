"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/analytics/chart-tooltip";
import type { EmbedAnalyticsPoint } from "@/features/widgets/embed-analytics";
import Link from "next/link";

type Props = {
  series: EmbedAnalyticsPoint[];
  impressions: number;
  clicks: number;
  days: number;
  fullAnalytics: boolean;
};

/** Pro: impression + click-through trends. Free sees upgrade gate. */
export function WidgetAnalyticsCharts({
  series,
  impressions,
  clicks,
  days,
  fullAnalytics,
}: Props) {
  const rate =
    impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

  return (
    <section className="rounded-[22px] border border-line/70 bg-surface px-5 py-5 shadow-[0_14px_40px_rgba(8,20,18,0.045)] sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Widget performance
          </p>
          <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Last {days} days
          </h2>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Impressions" value={impressions} />
        <Metric label="Profile clicks" value={clicks} />
        <Metric label="Click rate" value={`${rate}%`} />
      </div>

      {fullAnalytics ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <ChartBlock
            title="Impressions"
            data={series}
            dataKey="impressions"
            color="#1a5c51"
            gradientId="wg-imp"
          />
          <ChartBlock
            title="Clicks to profile"
            data={series}
            dataKey="clicks"
            color="#0e1f1c"
            gradientId="wg-clk"
          />
        </div>
      ) : (
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-line bg-[#f7f8fa] px-4 py-8">
          <div className="pointer-events-none select-none blur-[2.5px]" aria-hidden>
            <div className="h-[140px] rounded-lg bg-[#1a5c51]/15" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-surface/75 px-6 text-center">
            <p className="text-[13px] text-ink">
              Impression and click trends —{" "}
              <Link
                href="/dashboard/billing"
                className="font-semibold underline-offset-2 hover:underline"
              >
                upgrade to Pro
              </Link>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-line bg-[#f7f8fa] px-3 py-3">
      <p className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-xl tracking-[-0.03em] text-ink">
        {value}
      </p>
    </div>
  );
}

function ChartBlock({
  title,
  data,
  dataKey,
  color,
  gradientId,
}: {
  title: string;
  data: EmbedAnalyticsPoint[];
  dataKey: "impressions" | "clicks";
  color: string;
  gradientId: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-ink">{title}</p>
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#dfe5e2" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#8a948e", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: "#8a948e", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name={title}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
