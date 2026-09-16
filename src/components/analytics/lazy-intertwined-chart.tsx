"use client";

import dynamic from "next/dynamic";
import type { ChartPoint } from "@/components/analytics/chart-types";
import { LoadingState } from "@/components/ui/loading-state";

const IntertwinedActivityChart = dynamic(
  () =>
    import("@/components/analytics/intertwined-activity-chart").then(
      (m) => m.IntertwinedActivityChart,
    ),
  {
    ssr: false,
    loading: () => (
      <LoadingState compact label="Loading chart…" className="h-[200px]" />
    ),
  },
);

type Props = { data: ChartPoint[] };

/** Lazy recharts bundle — only loaded when Insights needs the upgrade teaser. */
export function LazyIntertwinedChart({ data }: Props) {
  return <IntertwinedActivityChart data={data} />;
}
