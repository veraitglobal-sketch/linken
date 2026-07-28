import "server-only";

import type { AdminCompanyDetail } from "@/features/admin/types";
import { resolveOwnerEmails } from "@/features/admin/owner-emails";
import { createAdminClient } from "@/lib/supabase/admin";

export type { AdminCompanyDetail };

export async function getAdminCompanyDetail(
  id: string,
): Promise<AdminCompanyDetail | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: c } = await admin
    .from("companies")
    .select(
      "id, name, slug, website, category, city, country, claimed, verified, plan, radar, owner_id, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!c) return null;

  const ownerIds = c.owner_id ? [c.owner_id as string] : [];
  const [
    emails,
    history,
    verification,
    credits,
    ledger,
    billing,
    partnersReq,
    partnersRec,
    testimonials,
    cases,
    placements,
  ] = await Promise.all([
    resolveOwnerEmails(admin, ownerIds),
    admin
      .from("company_slug_history")
      .select("old_slug, changed_at")
      .eq("company_id", id)
      .order("changed_at", { ascending: false })
      .limit(20),
    admin
      .from("company_verifications")
      .select(
        "verification_method, verified_at, last_verification_check, website_linked",
      )
      .eq("company_id", id)
      .maybeSingle(),
    admin.from("company_credits").select("balance").eq("company_id", id).maybeSingle(),
    admin
      .from("credit_ledger")
      .select("delta, reason, created_at")
      .eq("company_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    admin
      .from("company_billing")
      .select(
        "billing_status, stripe_subscription_id, plan_period_end, cancel_at_period_end",
      )
      .eq("company_id", id)
      .maybeSingle(),
    admin
      .from("partnerships")
      .select("id", { count: "exact", head: true })
      .eq("requester_id", id)
      .eq("status", "accepted"),
    admin
      .from("partnerships")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", id)
      .eq("status", "accepted"),
    admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("company_id", id),
    admin
      .from("case_studies")
      .select("id", { count: "exact", head: true })
      .eq("company_id", id),
    admin
      .from("widget_placements")
      .select("id", { count: "exact", head: true })
      .eq("company_id", id),
  ]);

  const v = verification.data;
  const b = billing.data;

  return {
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    website: (c.website as string) ?? "",
    category: (c.category as string) ?? "",
    city: (c.city as string) ?? "",
    country: (c.country as string) ?? "",
    claimed: Boolean(c.claimed),
    verified: Boolean(c.verified),
    plan: (c.plan as string | null) ?? null,
    radar: Boolean(c.radar),
    ownerId: (c.owner_id as string | null) ?? null,
    ownerEmail: c.owner_id ? (emails.get(c.owner_id as string) ?? null) : null,
    createdAt: c.created_at as string,
    slugHistory: (history.data ?? []).map((r) => ({
      slug: r.old_slug as string,
      changedAt: r.changed_at as string,
    })),
    verification: v
      ? {
          method: (v.verification_method as string | null) ?? null,
          verifiedAt: (v.verified_at as string | null) ?? null,
          lastCheck: (v.last_verification_check as string | null) ?? null,
          websiteLinked: Boolean(v.website_linked),
        }
      : null,
    creditsBalance: (credits.data?.balance as number | undefined) ?? 0,
    creditLedger: (ledger.data ?? []).map((r) => ({
      delta: r.delta as number,
      reason: r.reason as string,
      createdAt: r.created_at as string,
    })),
    billing: b
      ? {
          status: (b.billing_status as string | null) ?? null,
          subscriptionId: (b.stripe_subscription_id as string | null) ?? null,
          periodEnd: (b.plan_period_end as string | null) ?? null,
          cancelAtPeriodEnd: Boolean(b.cancel_at_period_end),
        }
      : null,
    partnersCount: (partnersReq.count ?? 0) + (partnersRec.count ?? 0),
    testimonialsCount: testimonials.count ?? 0,
    casesCount: cases.count ?? 0,
    placementsCount: placements.count ?? 0,
  };
}
