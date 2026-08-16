import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CommissionTotals = {
  thisMonthCents: number;
  totalCents: number;
  currency: string;
};

export type { ReferredClientRow } from "@/features/commissions/types";
export { getReferredClients } from "@/features/commissions/referred-clients";

function monthStartIso(now = new Date()): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
}

/** True when this company has attributed at least one referral. */
export async function companyHasReferrals(
  companyId: string,
): Promise<boolean> {
  if (!companyId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("referred_by_company_id", companyId)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.id);
}

/** Accrued this UTC month + all-time for the referrer. */
export async function getCommissionTotals(
  referrerCompanyId: string,
): Promise<CommissionTotals> {
  const empty: CommissionTotals = {
    thisMonthCents: 0,
    totalCents: 0,
    currency: "eur",
  };
  if (!referrerCompanyId) return empty;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_commissions")
    .select("commission_cents, currency, created_at")
    .eq("referrer_company_id", referrerCompanyId)
    .eq("status", "accrued");

  if (error || !data?.length) return empty;

  const start = monthStartIso();
  let thisMonthCents = 0;
  let totalCents = 0;
  let currency = "eur";
  for (const row of data) {
    const cents = Number(row.commission_cents ?? 0);
    totalCents += cents;
    if (String(row.created_at) >= start) thisMonthCents += cents;
    if (row.currency) currency = String(row.currency);
  }
  return { thisMonthCents, totalCents, currency };
}
