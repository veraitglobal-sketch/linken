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
import type { ChartPoint } from "@/components/analytics/chart-types";

const AXIS = {
  tick: { fill: "#8a948e", fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

/** Soft gradient area — thick stroke + luminous fill. */
export function MetricAreaChart({
  data,
  dataKey,
  color,
  colorSoft,
  gradientId,
  name,
}: {
  data: ChartPoint[];
  dataKey: "visits" | "inquiries" | "onePager" | "embed";
  color: string;
  colorSoft?: string;
  gradientId: string;
  name: string;
}) {
  const soft = colorSoft ?? color;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`${gradientId}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={soft} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={soft} stopOpacity={0.45} />
            <stop offset="55%" stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid
          strokeDasharray="4 8"
          vertical={false}
          stroke="#e2e6e3"
        />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
        <YAxis {...AXIS} allowDecimals={false} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={`url(#${gradientId}-stroke)`}
          strokeWidth={3}
          fill={`url(#${gradientId})`}
          filter={`url(#${gradientId}-glow)`}
          activeDot={{
            r: 6,
            strokeWidth: 3,
            stroke: "#fff",
            fill: color,
            style: { filter: "drop-shadow(0 0 6px rgba(126,184,164,0.55))" },
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
