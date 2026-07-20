"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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

const SERIES = [
  { key: "visits" as const, name: "Visits", color: "#0e1f1c", soft: "#1a5c51" },
  { key: "inquiries" as const, name: "Inquiries", color: "#1a5c51", soft: "#7eb8a4" },
  { key: "onePager" as const, name: "One-pager", color: "#3a423e", soft: "#66706b" },
  { key: "embed" as const, name: "Embed", color: "#7eb8a4", soft: "#a8d4c4" },
];

/** Soft intertwined lines — thick strokes, luminous points. */
export function IntertwinedActivityChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="flex h-full flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 14, right: 12, left: -12, bottom: 4 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient
                key={s.key}
                id={`line-${s.key}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor={s.soft} />
                <stop offset="100%" stopColor={s.color} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="4 8"
            vertical={false}
            stroke="#e2e6e3"
          />
          <XAxis
            dataKey="label"
            {...AXIS}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis {...AXIS} allowDecimals={false} width={36} />
          <Tooltip content={<ChartTooltip />} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={`url(#line-${s.key})`}
              strokeWidth={2.75}
              dot={false}
              activeDot={{
                r: 5.5,
                strokeWidth: 3,
                stroke: "#fff",
                fill: s.color,
                style: {
                  filter: "drop-shadow(0 0 8px rgba(26,92,81,0.45))",
                },
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1">
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#66706b]"
          >
            <span
              className="h-1 w-4 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${s.soft}, ${s.color})`,
              }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
