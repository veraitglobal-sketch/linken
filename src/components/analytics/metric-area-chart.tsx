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

/** Soft area — colored stroke + fill, no point markers. */
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
      <AreaChart data={data} margin={{ top: 12, right: 10, left: -14, bottom: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={soft} stopOpacity={0.42} />
            <stop offset="50%" stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="4 8"
          vertical={false}
          stroke="#dfe5e2"
        />
        <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
        <YAxis {...AXIS} allowDecimals={false} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={soft}
          strokeWidth={2.75}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
