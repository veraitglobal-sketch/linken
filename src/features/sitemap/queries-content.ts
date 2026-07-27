import "server-only";

import type { SitemapCaseStudyRow, SitemapGroupRow } from "@/features/sitemap/types";
import { SITEMAP_CHUNK_SIZE } from "@/features/sitemap/types";
import { getSitemapDb } from "@/features/sitemap/client";

export async function countSitemapCaseStudies(): Promise<number> {
  const supabase = await getSitemapDb();
  if (!supabase) return 0;

  const { data: companies, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("claimed", true);

  if (companyError || !companies?.length) return 0;

  const { count, error } = await supabase
    .from("case_studies")
    .select("id", { count: "exact", head: true })
    .in(
      "company_id",
      companies.map((c) => c.id as string),
    );

  if (error) {
    console.error("[sitemap] count case studies", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function listSitemapCaseStudies(
  offset = 0,
  limit = SITEMAP_CHUNK_SIZE,
): Promise<SitemapCaseStudyRow[]> {
  const supabase = await getSitemapDb();
  if (!supabase) return [];

  const { data: companies, error: companyError } = await supabase
    .from("companies")
    .select("id, slug")
    .eq("claimed", true);

  if (companyError || !companies?.length) return [];

  const idToSlug = new Map(
    companies.map((c) => [c.id as string, c.slug as string]),
  );

  const { data, error } = await supabase
    .from("case_studies")
    .select("id, slug, created_at, cover_image_url, company_id")
    .in("company_id", [...idToSlug.keys()])
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[sitemap] case studies", error.message);
    return [];
  }
  if (!data?.length) return [];

  const caseIds = data.map((row) => row.id as string);
  const confirmed = await loadConfirmedCaseIds(supabase, caseIds);

  return data
    .map((row) => {
      const companySlug = idToSlug.get(row.company_id as string);
      if (!companySlug) return null;
      return {
        companySlug,
        caseSlug: row.slug as string,
        createdAt: (row.created_at as string) ?? new Date().toISOString(),
        coverImageUrl: (row.cover_image_url as string | null) ?? null,
        clientConfirmed: confirmed.has(row.id as string),
      };
    })
    .filter((row): row is SitemapCaseStudyRow => row != null);
}

async function loadConfirmedCaseIds(
  supabase: NonNullable<Awaited<ReturnType<typeof getSitemapDb>>>,
  caseIds: string[],
) {
  if (!caseIds.length) return new Set<string>();

  const { data } = await supabase
    .from("case_study_client_confirmation_requests")
    .select("case_study_id")
    .eq("status", "confirmed")
    .in("case_study_id", caseIds);

  return new Set((data ?? []).map((row) => row.case_study_id as string));
}

export async function countSitemapGroups(): Promise<number> {
  const supabase = await getSitemapDb();
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from("company_group_members")
    .select("group_id")
    .eq("status", "confirmed");

  if (error) {
    console.error("[sitemap] count groups", error.message);
    return 0;
  }
  return new Set((data ?? []).map((row) => row.group_id as string)).size;
}

export async function listSitemapGroups(): Promise<SitemapGroupRow[]> {
  const supabase = await getSitemapDb();
  if (!supabase) return [];

  const { data: memberships, error: memberError } = await supabase
    .from("company_group_members")
    .select("group_id")
    .eq("status", "confirmed");

  if (memberError) {
    console.error("[sitemap] group members", memberError.message);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of memberships ?? []) {
    const id = row.group_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  const { data: groups, error } = await supabase
    .from("company_groups")
    .select("id, slug, created_at")
    .in("id", [...counts.keys()])
    .order("created_at", { ascending: false })
    .limit(2_000);

  if (error) {
    console.error("[sitemap] groups", error.message);
    return [];
  }

  return (groups ?? []).map((row) => ({
    slug: row.slug as string,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    memberCount: counts.get(row.id as string) ?? 0,
  }));
}
