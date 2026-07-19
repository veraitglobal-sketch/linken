"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";

export type ChartPoint = {
  day: string;
  label: string;
  visits: number;
  inquiries: number;
  onePager: number;
  embed: number;
};

const AXIS = {
  tick: { fill: "#94a3b8", fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
      <p className="text-[11px] font-semibold text-[#64748b]">{label}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((p) => (
          <li
            key={p.name}
            className="flex items-center justify-between gap-6 text-[12px]"
          >
            <span className="inline-flex items-center gap-1.5 text-[#64748b]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: p.color }}
              />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-ink">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Retell-style soft area metric chart. */
export function MetricAreaChart({
  data,
  dataKey,
  color,
  gradientId,
  name,
}: {
  data: ChartPoint[];
  dataKey: "visits" | "inquiries" | "onePager" | "embed";
  color: string;
  gradientId: string;
  name: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="70%" stopColor={color} stopOpacity={0.06} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 6"
          vertical={false}
          stroke="#e8edf3"
        />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
        <YAxis {...AXIS} allowDecimals={false} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff", fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Nimt/Retell intertwined multi-series line chart. */
export function IntertwinedActivityChart({ data }: { data: ChartPoint[] }) {
  const series = [
    { key: "visits" as const, name: "Visits", color: "#0b1220" },
    { key: "inquiries" as const, name: "Inquiries", color: "#3b82f6" },
    { key: "onePager" as const, name: "One-pager", color: "#64748b" },
    { key: "embed" as const, name: "Embed", color: "#94a3b8" },
  ];

  return (
    <div className="flex h-full flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
          <CartesianGrid
            strokeDasharray="3 6"
            vertical={false}
            stroke="#e8edf3"
          />
          <XAxis
            dataKey="label"
            {...AXIS}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis {...AXIS} allowDecimals={false} width={36} />
          <Tooltip content={<ChartTooltip />} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#fff", fill: s.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1">
        {series.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#64748b]"
          >
            <span
              className="h-0.5 w-3 rounded-full"
              style={{ background: s.color }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Nimt-style segmented source bar. */
export function SourceSegmentBar({
  segments,
}: {
  segments: { key: string; label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-[#f1f5f9]">
        {segments.map((s) => {
          const pct = (s.value / total) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={s.key}
              title={`${s.label}: ${s.value}`}
              className="mx-px first:ml-0 last:mr-0 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${Math.max(pct, s.value > 0 ? 2 : 0)}%`,
                background: s.color,
              }}
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((s) => (
          <div key={s.key} className="min-w-[5.5rem]">
            <p className="text-[11px] text-[#94a3b8]">{s.label}</p>
            <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink">
              {total === 1 && s.value === 0
                ? "0%"
                : `${Math.round((s.value / total) * 100)}%`}
              <span className="ml-1.5 text-[11px] font-medium text-[#94a3b8]">
                {s.value}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Thin donut with center label (Nimt content-types style). */
export function ChannelDonut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { key: string; label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const data = segments.filter((s) => s.value > 0);
  const chartData = data.length
    ? data
    : [{ key: "empty", label: "—", value: 1, color: "#e2e8f0" }];

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[140px] w-[140px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={46}
              outerRadius={64}
              paddingAngle={data.length > 1 ? 3 : 0}
              strokeWidth={0}
            >
              {chartData.map((s) => (
                <Cell key={s.key} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            {centerValue}
          </p>
          <p className="text-[10px] font-medium text-[#94a3b8]">{centerLabel}</p>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((s) => (
          <li
            key={s.key}
            className="flex items-center justify-between gap-3 text-[12px]"
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-[#64748b]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="font-semibold tabular-nums text-ink">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  suffix,
  children,
  className,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
        className,
      )}
    >
      <p className="text-[12px] font-medium text-[#64748b]">{label}</p>
      <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-ink">
        {value}
        {suffix ? (
          <span className="ml-1 text-[16px] font-semibold text-[#94a3b8]">
            {suffix}
          </span>
        ) : null}
      </p>
      <div className="mt-4 h-[180px]">{children}</div>
    </section>
  );
}
