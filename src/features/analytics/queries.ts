import { createClient } from "@/lib/supabase/server";

export type DaySeries = {
  day: string;
  count: number;
  visits: number;
  inquiries: number;
  onePager: number;
  embed: number;
  /** profile_view with source=embed */
  embedClicks: number;
};

export type AnalyticsSummary = {
  days: number;
  profileViews: number;
  onePagerViews: number;
  embedViews: number;
  /** Click-throughs from widgets (?src=embed). */
  embedClicks: number;
  inquiries: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  byDay: DaySeries[];
};

const EMPTY: AnalyticsSummary = {
  days: 30,
  profileViews: 0,
  onePagerViews: 0,
  embedViews: 0,
  embedClicks: 0,
  inquiries: 0,
  byType: {},
  bySource: {},
  byDay: [],
};

function mapDay(raw: {
  day: string;
  count?: number;
  visits?: number;
  inquiries?: number;
  one_pager?: number;
  embed?: number;
  embed_clicks?: number;
}): DaySeries {
  const visits = Number(raw.visits ?? raw.count ?? 0);
  const inquiries = Number(raw.inquiries ?? 0);
  const onePager = Number(raw.one_pager ?? 0);
  const embed = Number(raw.embed ?? 0);
  const embedClicks = Number(raw.embed_clicks ?? 0);
  return {
    day: raw.day,
    visits,
    inquiries,
    onePager,
    embed,
    embedClicks,
    count: Number(raw.count ?? visits + onePager + embed),
  };
}

/** Fill missing calendar days so charts stay continuous. */
export function fillDaySeries(
  byDay: DaySeries[],
  days: number,
): DaySeries[] {
  const map = new Map(byDay.map((d) => [d.day.slice(0, 10), d]));
  const out: DaySeries[] = [];
  const end = new Date();
  end.setHours(12, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hit = map.get(key);
    out.push(
      hit ?? {
        day: key,
        count: 0,
        visits: 0,
        inquiries: 0,
        onePager: 0,
        embed: 0,
        embedClicks: 0,
      },
    );
  }
  return out;
}

export async function getAnalytics(
  companyId: string,
  days = 30,
): Promise<AnalyticsSummary> {
  const cappedDays = Math.min(Math.max(days, 1), 365);
  if (!companyId) return { ...EMPTY, days: cappedDays };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_profile_analytics", {
      p_company_id: companyId,
      p_days: cappedDays,
    });

    if (error || !data) return { ...EMPTY, days: cappedDays };

    const row = data as {
      days?: number;
      profile_views?: number;
      one_pager_views?: number;
      embed_views?: number;
      embed_clicks?: number;
      inquiries?: number;
      by_type?: Record<string, number>;
      by_source?: Record<string, number>;
      by_day?:
        | {
            day: string;
            count?: number;
            visits?: number;
            inquiries?: number;
            one_pager?: number;
            embed?: number;
            embed_clicks?: number;
          }[]
        | null;
    };

    const mappedDays = (row.by_day ?? []).map(mapDay);
    const span = row.days ?? days;

    return {
      days: span,
      profileViews: Number(row.profile_views ?? 0),
      onePagerViews: Number(row.one_pager_views ?? 0),
      embedViews: Number(row.embed_views ?? 0),
      embedClicks: Number(
        row.embed_clicks ?? row.by_source?.embed ?? 0,
      ),
      inquiries: Number(row.inquiries ?? 0),
      byType: row.by_type ?? {},
      bySource: row.by_source ?? {},
      byDay: fillDaySeries(mappedDays, span),
    };
  } catch {
    return { ...EMPTY, days };
  }
}
