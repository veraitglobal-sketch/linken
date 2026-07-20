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

/** Colored lines only — no dots. */
export function IntertwinedActivityChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 rounded-2xl bg-[linear-gradient(180deg,#f7faf8_0%,#ffffff_60%)] px-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 14, left: -10, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="4 8"
              vertical={false}
              stroke="#dfe5e2"
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
                stroke={s.soft}
                strokeWidth={2.75}
                dot={false}
                activeDot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1">
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#66706b]"
          >
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ background: s.soft }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
