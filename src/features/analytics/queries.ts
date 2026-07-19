import { createClient } from "@/lib/supabase/server";

export type DayCount = {
  day: string;
  count: number;
};

export type AnalyticsSummary = {
  days: number;
  profileViews: number;
  onePagerViews: number;
  embedViews: number;
  inquiries: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  byDay: DayCount[];
};

const EMPTY: AnalyticsSummary = {
  days: 30,
  profileViews: 0,
  onePagerViews: 0,
  embedViews: 0,
  inquiries: 0,
  byType: {},
  bySource: {},
  byDay: [],
};

export async function getAnalytics(
  companyId: string,
  days = 30,
): Promise<AnalyticsSummary> {
  if (!companyId) return { ...EMPTY, days };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_profile_analytics", {
      p_company_id: companyId,
      p_days: days,
    });

    if (error || !data) return { ...EMPTY, days };

    const row = data as {
      days?: number;
      profile_views?: number;
      one_pager_views?: number;
      embed_views?: number;
      inquiries?: number;
      by_type?: Record<string, number>;
      by_source?: Record<string, number>;
      by_day?: { day: string; count: number }[] | null;
    };

    return {
      days: row.days ?? days,
      profileViews: Number(row.profile_views ?? 0),
      onePagerViews: Number(row.one_pager_views ?? 0),
      embedViews: Number(row.embed_views ?? 0),
      inquiries: Number(row.inquiries ?? 0),
      byType: row.by_type ?? {},
      bySource: row.by_source ?? {},
      byDay: (row.by_day ?? []).map((d) => ({
        day: d.day,
        count: Number(d.count ?? 0),
      })),
    };
  } catch {
    return { ...EMPTY, days };
  }
}
