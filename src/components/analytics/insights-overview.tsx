import type { ReactNode } from "react";
import {
  MetricAreaChart,
  type ChartPoint,
} from "@/components/analytics/charts";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { cn } from "@/lib/cn";

type Props = {
  points: ChartPoint[];
  visitTotal: number;
  inquiryTotal: number;
  inquiryRate: string;
  channelTotal: number;
};

export function InsightsOverview({
  points,
  visitTotal,
  inquiryTotal,
  inquiryRate,
  channelTotal,
}: Props) {
  const engagement =
    visitTotal > 0
      ? Math.min(100, Math.round((inquiryTotal / visitTotal) * 100))
      : 0;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Overview
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Profile visits and inquiry conversion.
          </p>
        </div>
      </header>

      <WorkspaceCard padded={false} className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="border-b border-line p-5 lg:border-r lg:border-b-0">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
              Profile visits
            </p>
            <p className="mt-2 font-display text-[28px] font-semibold tracking-[-0.03em] text-ink">
              {visitTotal}
              <span className="ml-2 text-[15px] font-medium text-muted">
                · {inquiryTotal} inquiries
              </span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.max(engagement, visitTotal ? 4 : 0)}%`,
                  background:
                    "linear-gradient(90deg, #7eb8a4 0%, #1a5c51 55%, #0e1f1c 100%)",
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Inquiry rate {inquiryRate}% of visits
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <MiniStat label="Inquiry rate" value={`${inquiryRate}%`} />
              <MiniStat label="Channels" value={String(channelTotal)} />
            </div>
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            <ChartPane label="Visits" value={visitTotal}>
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
              className="border-t border-line sm:border-t-0 sm:border-l"
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
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper/60 px-3 py-2.5">
      <p className="text-[11px] text-muted">{label}</p>
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
      <p className="text-[12px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-ink">
        {value}
      </p>
      <div className="mt-3 h-[168px] rounded-2xl bg-paper/40 px-1 pt-2">
        {children}
      </div>
    </div>
  );
}
