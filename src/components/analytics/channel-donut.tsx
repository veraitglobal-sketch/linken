"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

/** Soft donut with thicker ring and forest palette. */
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
    : [{ key: "empty", label: "—", value: 1, color: "#e2e6e3" }];

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[148px] w-[148px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={data.length > 1 ? 4 : 0}
              strokeWidth={0}
              cornerRadius={6}
            >
              {chartData.map((s) => (
                <Cell key={s.key} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-[1.15rem] font-semibold tracking-[-0.03em] text-ink">
            {centerValue}
          </p>
          <p className="text-[10px] font-medium text-[#8a948e]">{centerLabel}</p>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((s) => (
          <li
            key={s.key}
            className="flex items-center justify-between gap-3 text-[12px]"
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-[#66706b]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_0_3px_rgba(126,184,164,0.18)]"
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
