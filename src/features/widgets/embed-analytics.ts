import type { AnalyticsSummary } from "@/features/analytics/queries";

export type EmbedAnalyticsPoint = {
  day: string;
  label: string;
  impressions: number;
  clicks: number;
};

function formatLabel(day: string) {
  const d = new Date(`${day.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/**
 * Impressions = embed_view. Clicks = profile_view with source=embed
 * (widget links already use ?src=embed).
 */
export function embedSeriesFromAnalytics(analytics: AnalyticsSummary): {
  series: EmbedAnalyticsPoint[];
  impressions: number;
  clicks: number;
} {
  return {
    impressions: analytics.embedViews,
    clicks: analytics.embedClicks,
    series: analytics.byDay.map((d) => ({
      day: d.day,
      label: formatLabel(d.day),
      impressions: d.embed,
      clicks: d.embedClicks,
    })),
  };
}
