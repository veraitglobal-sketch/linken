import "server-only";

import type { CommissionMonthPoint } from "@/features/commissions/types";
import { createClient } from "@/lib/supabase/server";

export type { CommissionMonthPoint };

const MONTHS = 12;

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
}

function buildEmptySeries(now = new Date()): CommissionMonthPoint[] {
  const out: CommissionMonthPoint[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    const key = monthKey(d);
    out.push({ key, label: monthLabel(key), cents: 0, euros: 0 });
  }
  return out;
}

/** Last 12 UTC months of accrued commission — zeros filled so the graph tracks progress. */
export async function getCommissionMonthSeries(
  referrerCompanyId: string,
): Promise<CommissionMonthPoint[]> {
  const series = buildEmptySeries();
  if (!referrerCompanyId) return series;

  const start = series[0]?.key
    ? `${series[0].key}-01T00:00:00.000Z`
    : new Date(0).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_commissions")
    .select("commission_cents, created_at")
    .eq("referrer_company_id", referrerCompanyId)
    .eq("status", "accrued")
    .gte("created_at", start);

  if (error || !data?.length) return series;

  const byKey = new Map(series.map((p) => [p.key, p]));
  for (const row of data) {
    const t = Date.parse(String(row.created_at ?? ""));
    if (Number.isNaN(t)) continue;
    const key = monthKey(new Date(t));
    const point = byKey.get(key);
    if (!point) continue;
    point.cents += Number(row.commission_cents ?? 0);
    point.euros = point.cents / 100;
  }
  return series;
}
