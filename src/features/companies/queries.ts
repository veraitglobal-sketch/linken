import { parsePlan } from "@/features/plan/entitlements";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Company } from "@/types/company";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapRow(row: {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  services: string[] | null;
  verified: boolean | null;
  claimed: boolean | null;
  accepting_clients?: boolean | null;
  plan?: string | null;
  invite_email?: string | null;
  created_by?: { slug: string; name: string } | { slug: string; name: string }[] | null;
}): Company {
  const createdBy = Array.isArray(row.created_by)
    ? row.created_by[0]
    : row.created_by;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    category: row.category ?? "",
    city: row.city ?? "",
    country: row.country ?? "Germany",
    website: row.website ?? "",
    linkedinUrl: row.linkedin_url ?? null,
    facebookUrl: row.facebook_url ?? null,
    services: row.services ?? [],
    verified: Boolean(row.verified) && row.claimed !== false,
    verifiedAt: null,
    websiteLinked: false,
    logoInitials: initials(row.name),
    logoUrl: row.logo_url ?? null,
    coverImageUrl: row.cover_image_url ?? null,
    claimed: row.claimed !== false,
    acceptingClients: row.accepting_clients !== false,
    plan: parsePlan(row.plan),
    inviteEmail: row.invite_email ?? null,
    createdBySlug: createdBy?.slug ?? null,
    createdByName: createdBy?.name ?? null,
  };
}

/** Public company fetch — never selects claim_token. DB only; never mock. */
export async function getCompanyForPage(slug: string): Promise<Company | null> {
  if (!slug) return null;
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("companies")
      .select(
        "id, slug, name, tagline, description, category, city, country, website, logo_url, cover_image_url, linkedin_url, facebook_url, services, verified, claimed, accepting_clients, plan, created_by:companies!created_by_company_id(slug, name)",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[getCompanyForPage]", error.message);
      return null;
    }
    if (!data) return null;

    const company = mapRow({ ...data, invite_email: null });
    const { data: ver } = await supabase
      .from("company_verifications")
      .select("verified_at, website_linked")
      .eq("company_id", company.id)
      .maybeSingle();
    if (ver) {
      company.verifiedAt = ver.verified_at ?? null;
      company.websiteLinked = Boolean(ver.website_linked);
    }
    return company;
  } catch (err) {
    console.error("[getCompanyForPage]", err);
    return null;
  }
}

export type SearchFilters = {
  verifiedOnly?: boolean;
  hasPartners?: boolean;
  hasCaseStudies?: boolean;
  /** When true, include unclaimed draft profiles (default: claimed only). */
  includeUnclaimed?: boolean;
};

/** Verified + claimed profiles first, then claimed, then unclaimed drafts. */
function claimRank(company: Company): number {
  if (company.claimed && company.verified) return 0;
  if (company.claimed) return 1;
  return 2;
}

export async function searchCompanies(
  query: string,
  filters: SearchFilters = {},
): Promise<Company[]> {
  const q = query.trim().toLowerCase();

  try {
    const supabase = createPublicClient();
    let req = supabase
      .from("companies")
      .select(
        "id, slug, name, tagline, description, category, city, country, website, logo_url, linkedin_url, facebook_url, services, verified, claimed, accepting_clients, plan",
      )
      .order("name")
      .limit(60);

    if (!filters.includeUnclaimed) {
      req = req.eq("claimed", true);
    }

    if (filters.verifiedOnly) {
      req = req.eq("verified", true).eq("claimed", true);
    }

    if (q) {
      // Include slug so dashboard partner search works with public URLs / slugs.
      req = req.or(
        `name.ilike.%${q}%,slug.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`,
      );
    }

    const { data, error } = await req;
    if (error) {
      console.error("[searchCompanies]", error.message);
      return [];
    }

    let companies = (data ?? []).map((row) =>
      mapRow({ ...row, invite_email: null, created_by: null }),
    );

    const ids = companies.map((c) => c.id);
    if (ids.length) {
      const [asRequester, asRecipient, caseRows] = await Promise.all([
        supabase
          .from("partnerships")
          .select("requester_id")
          .eq("status", "accepted")
          .in("requester_id", ids),
        supabase
          .from("partnerships")
          .select("recipient_id")
          .eq("status", "accepted")
          .in("recipient_id", ids),
        supabase.from("case_studies").select("company_id").in("company_id", ids),
      ]);

      const partnerCounts = new Map<string, number>();
      const bump = (map: Map<string, number>, id: string | null) => {
        if (!id) return;
        map.set(id, (map.get(id) ?? 0) + 1);
      };
      for (const row of asRequester.data ?? []) {
        bump(partnerCounts, row.requester_id as string);
      }
      for (const row of asRecipient.data ?? []) {
        bump(partnerCounts, row.recipient_id as string);
      }
      const caseCounts = new Map<string, number>();
      for (const row of caseRows.data ?? []) {
        bump(caseCounts, row.company_id as string);
      }

      companies = companies.map((c) => ({
        ...c,
        confirmedPartnerCount: partnerCounts.get(c.id) ?? 0,
        caseStudyCount: caseCounts.get(c.id) ?? 0,
      }));
    }

    if (filters.hasPartners) {
      companies = companies.filter((c) => (c.confirmedPartnerCount ?? 0) > 0);
    }
    if (filters.hasCaseStudies) {
      companies = companies.filter((c) => (c.caseStudyCount ?? 0) > 0);
    }

    companies.sort((a, b) => claimRank(a) - claimRank(b));

    return companies.slice(0, 40);
  } catch (err) {
    console.error("[searchCompanies]", err);
    return [];
  }
}

/** Claimed company + case-study paths for sitemap (DB only). */
export async function listSitemapEntries(): Promise<{
  companies: { slug: string }[];
  caseStudies: { companySlug: string; caseSlug: string }[];
}> {
  const empty = {
    companies: [] as { slug: string }[],
    caseStudies: [] as { companySlug: string; caseSlug: string }[],
  };
  try {
    const supabase = await createClient();
    const { data: companies, error } = await supabase
      .from("companies")
      .select("id, slug")
      .eq("claimed", true)
      .order("name");

    if (error) {
      console.error("[listSitemapEntries]", error.message);
      return empty;
    }
    if (!companies?.length) return empty;

    const companySlugs = companies.map((c) => ({
      slug: c.slug as string,
    }));
    const idToSlug = new Map(
      companies.map((c) => [c.id as string, c.slug as string]),
    );

    const { data: cases, error: caseError } = await supabase
      .from("case_studies")
      .select("slug, company_id")
      .in(
        "company_id",
        companies.map((c) => c.id as string),
      );

    if (caseError) {
      console.error("[listSitemapEntries] cases", caseError.message);
      return { companies: companySlugs, caseStudies: [] };
    }

    const caseStudies = (cases ?? [])
      .map((row) => {
        const companySlug = idToSlug.get(row.company_id as string);
        if (!companySlug) return null;
        return {
          companySlug,
          caseSlug: row.slug as string,
        };
      })
      .filter((x): x is { companySlug: string; caseSlug: string } => Boolean(x));

    return { companies: companySlugs, caseStudies };
  } catch (err) {
    console.error("[listSitemapEntries]", err);
    return empty;
  }
}
