import "server-only";

import type { SitemapCompanyRow } from "@/features/sitemap/types";
import { SITEMAP_CHUNK_SIZE } from "@/features/sitemap/types";
import { getSitemapDb } from "@/features/sitemap/client";
import {
  countCaseStudiesBySlug,
  countPartnersBySlug,
} from "@/features/sitemap/company-stats";

export async function countSitemapCompanies(): Promise<number> {
  const supabase = await getSitemapDb();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("companies")
    /* No `claimed` filter: unclaimed profiles are indexable now, and a page
       Google is never told about is a page Google does not index. */
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[sitemap] count companies", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function listSitemapCompanies(
  offset: number,
  limit = SITEMAP_CHUNK_SIZE,
): Promise<SitemapCompanyRow[]> {
  const supabase = await getSitemapDb();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("companies")
    .select(
      "slug, verified, updated_at, logo_url, website, scheduling_url",
    )
    .order("verified", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[sitemap] companies", error.message);
    return [];
  }
  if (!data?.length) return [];

  const slugs = data.map((row) => row.slug as string);
  const [caseCounts, partnerCounts] = await Promise.all([
    countCaseStudiesBySlug(supabase, slugs),
    countPartnersBySlug(supabase, slugs),
  ]);

  return data.map((row) => {
    const slug = row.slug as string;
    const website = String(row.website ?? "").trim();
    return {
      slug,
      verified: Boolean(row.verified),
      updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
      logoUrl: (row.logo_url as string | null) ?? null,
      hasWebsite: website.length > 0,
      hasBooking: Boolean(String(row.scheduling_url ?? "").trim()),
      hasCaseStudies: (caseCounts.get(slug) ?? 0) > 0,
      partnerCount: partnerCounts.get(slug) ?? 0,
    };
  });
}
