import "server-only";

import type {
  AdminCompanyRow,
  AdminStats,
  AdminTestimonialRow,
} from "@/features/admin/types";
import { createAdminClient } from "@/lib/supabase/admin";

function weekAgoIso() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export async function getAdminStats(): Promise<AdminStats | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const since = weekAgoIso();

  const [
    total,
    claimed,
    verified,
    newWeek,
    tPending,
    tPublished,
    tWithdrawn,
    pPending,
    cPending,
  ] = await Promise.all([
    admin.from("companies").select("id", { count: "exact", head: true }),
    admin
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("claimed", true),
    admin
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
    admin
      .from("companies")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
    admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    admin
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "withdrawn"),
    admin
      .from("partnerships")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("case_study_client_confirmation_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    companiesTotal: total.count ?? 0,
    companiesClaimed: claimed.count ?? 0,
    companiesVerified: verified.count ?? 0,
    companiesNewWeek: newWeek.count ?? 0,
    testimonialsPending: tPending.count ?? 0,
    testimonialsPublished: tPublished.count ?? 0,
    testimonialsWithdrawn: tWithdrawn.count ?? 0,
    partnershipsPending: pPending.count ?? 0,
    confirmationsPending: cPending.count ?? 0,
  };
}

export async function getAdminRecentCompanies(
  limit = 15,
): Promise<AdminCompanyRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("companies")
    .select("id, name, slug, claimed, verified, plan, website, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    claimed: Boolean(r.claimed),
    verified: Boolean(r.verified),
    plan: (r.plan as string | null) ?? null,
    website: (r.website as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

export async function getAdminRecentTestimonials(
  limit = 15,
): Promise<AdminTestimonialRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("testimonials")
    .select(
      "id, status, body, author_name, source, author_domain, author_domain_verified, created_at, published_at, companies!inner(name, slug)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => {
    const co = r.companies as { name?: string; slug?: string } | null;
    return {
      id: r.id as string,
      status: r.status as string,
      body: r.body as string,
      authorName: r.author_name as string,
      source: r.source as string,
      companyName: co?.name ?? "—",
      companySlug: co?.slug ?? "",
      authorDomain: (r.author_domain as string | null) ?? null,
      authorDomainVerified: Boolean(r.author_domain_verified),
      createdAt: r.created_at as string,
      publishedAt: (r.published_at as string | null) ?? null,
    };
  });
}

export async function listAdminTestimonials(
  limit = 100,
): Promise<AdminTestimonialRow[]> {
  return getAdminRecentTestimonials(limit);
}
