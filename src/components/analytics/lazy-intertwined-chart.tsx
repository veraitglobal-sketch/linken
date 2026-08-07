"use client";

import dynamic from "next/dynamic";
import type { ChartPoint } from "@/components/analytics/chart-types";

const IntertwinedActivityChart = dynamic(
  () =>
    import("@/components/analytics/intertwined-activity-chart").then(
      (m) => m.IntertwinedActivityChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[200px] items-center justify-center text-[13px] text-muted"
        role="status"
      >
        Loading chart…
      </div>
    ),
  },
);

type Props = { data: ChartPoint[] };

/** Lazy recharts bundle — only loaded when Insights needs the upgrade teaser. */
export function LazyIntertwinedChart({ data }: Props) {
  return <IntertwinedActivityChart data={data} />;
}
