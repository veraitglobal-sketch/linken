import "server-only";

import type { ReferredClientRow } from "@/features/commissions/types";
import { createClient } from "@/lib/supabase/server";

export type { ReferredClientRow };

function monthStartIso(now = new Date()): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
}

function planRank(plan: string): number {
  if (plan === "pro" || plan === "founding") return 0;
  return 1;
}

/** Referred companies + this-month accrued commission + live widget variants. */
export async function getReferredClients(
  referrerCompanyId: string,
): Promise<ReferredClientRow[]> {
  if (!referrerCompanyId) return [];

  const supabase = await createClient();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, name, slug, plan, created_at")
    .eq("referred_by_company_id", referrerCompanyId);

  if (error || !companies?.length) return [];

  const ids = companies.map((c) => c.id as string);
  const start = monthStartIso();

  const [{ data: commissions }, { data: placements }] = await Promise.all([
    supabase
      .from("partner_commissions")
      .select("company_id, commission_cents, created_at")
      .eq("referrer_company_id", referrerCompanyId)
      .eq("status", "accrued")
      .in("company_id", ids)
      .gte("created_at", start),
    supabase
      .from("widget_placements")
      .select("company_id, variant")
      .in("company_id", ids),
  ]);

  const monthly = new Map<string, number>();
  for (const row of commissions ?? []) {
    const id = String(row.company_id);
    monthly.set(
      id,
      (monthly.get(id) ?? 0) + Number(row.commission_cents ?? 0),
    );
  }

  const variants = new Map<string, Set<string>>();
  for (const row of placements ?? []) {
    const id = String(row.company_id);
    const v = String(row.variant ?? "").trim();
    if (!v) continue;
    const set = variants.get(id) ?? new Set<string>();
    set.add(v);
    variants.set(id, set);
  }

  const rows: ReferredClientRow[] = companies.map((c) => {
    const id = c.id as string;
    const plan = String(c.plan ?? "free");
    return {
      id,
      name: String(c.name ?? ""),
      slug: String(c.slug ?? ""),
      plan,
      since: String(c.created_at ?? ""),
      monthlyCommissionCents: monthly.get(id) ?? 0,
      installedVariants: [...(variants.get(id) ?? [])].sort(),
    };
  });

  rows.sort((a, b) => {
    const byPlan = planRank(a.plan) - planRank(b.plan);
    if (byPlan !== 0) return byPlan;
    return a.name.localeCompare(b.name);
  });
  return rows;
}
