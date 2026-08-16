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
import { formatCommissionCents } from "@/features/commissions/format";
import type { CommissionMonthPoint } from "@/features/commissions/types";

const AXIS = {
  tick: { fill: "#5f6964", fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

type Props = {
  series: CommissionMonthPoint[];
  currency: string;
};

export function DeveloperEarnChart({ series, currency }: Props) {
  const yearCents = series.reduce((s, p) => s + p.cents, 0);
  const summary = `Accrued over ${series.length} months: ${formatCommissionCents(yearCents, currency)}.`;

  return (
    <figure className="h-[200px] w-full sm:h-[220px]" role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 12, right: 10, left: -8, bottom: 2 }}
          aria-hidden
        >
          <defs>
            <linearGradient id="partnerEarnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7eb8a4" stopOpacity={0.42} />
              <stop offset="50%" stopColor="#1a5c51" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#0e1f1c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#dfe5e2" />
          <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={20} />
          <YAxis {...AXIS} width={40} tickFormatter={(v) => (v === 0 ? "0" : `€${v}`)} />
          <Tooltip content={<EarnTooltip currency={currency} />} />
          <Area
            type="monotone"
            dataKey="euros"
            name="Accrued"
            stroke="#1a5c51"
            strokeWidth={2.5}
            fill="url(#partnerEarnGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#7eb8a4", stroke: "#0e1f1c", strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </figure>
  );
}

function EarnTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const euros = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 px-3.5 py-2.5 shadow-[0_16px_40px_rgba(8,20,18,0.14)] backdrop-blur-md">
      <p className="text-[11px] font-semibold text-[#66706b]">{label}</p>
      <p className="mt-1 text-[13px] font-semibold tabular-nums text-ink">
        {formatCommissionCents(Math.round(euros * 100), currency)}
      </p>
    </div>
  );
}
