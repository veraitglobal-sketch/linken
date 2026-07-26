import { WidgetAnalyticsCharts } from "@/components/widgets/widget-analytics-charts";
import { WidgetPlacementsPanel } from "@/components/widgets/widget-placements-panel";
import { getAnalytics } from "@/features/analytics/queries";
import { embedSeriesFromAnalytics } from "@/features/widgets/embed-analytics";
import { getWidgetPlacements } from "@/features/widgets/placement-queries";
import type { CompanyPlan } from "@/features/plan/entitlements";
import { getEntitlements } from "@/features/plan/entitlements";

type Props = {
  companyId: string;
  website: string | null | undefined;
  plan: CompanyPlan;
};

/** Placements (free) + embed trends (Pro charts). */
export async function WidgetAnalyticsSection({
  companyId,
  website,
  plan,
}: Props) {
  const fullAnalytics = getEntitlements(plan).fullAnalytics;
  const [placements, analytics] = await Promise.all([
    getWidgetPlacements(companyId, website),
    getAnalytics(companyId, 30),
  ]);
  const embed = embedSeriesFromAnalytics(analytics);

  return (
    <div className="mb-10 space-y-5">
      <WidgetPlacementsPanel placements={placements} />
      <WidgetAnalyticsCharts
        series={embed.series}
        impressions={embed.impressions}
        clicks={embed.clicks}
        days={analytics.days}
        fullAnalytics={fullAnalytics}
      />
    </div>
  );
}
