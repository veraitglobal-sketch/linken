import { parsePlan } from "@/features/plan/entitlements";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("companies")
      .select(
        "id, slug, name, tagline, description, category, city, country, website, logo_url, linkedin_url, facebook_url, services, verified, claimed, accepting_clients, plan, created_by:companies!created_by_company_id(slug, name)",
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

export async function searchCompanies(query: string): Promise<Company[]> {
  const q = query.trim().toLowerCase();

  try {
    const supabase = await createClient();
    let req = supabase
      .from("companies")
      .select(
        "id, slug, name, tagline, description, category, city, country, website, logo_url, linkedin_url, facebook_url, services, verified, claimed, accepting_clients, plan",
      )
      .order("name")
      .limit(40);

    if (q) {
      req = req.or(
        `name.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`,
      );
    }

    const { data, error } = await req;
    if (error) {
      console.error("[searchCompanies]", error.message);
      return [];
    }
    return (data ?? []).map((row) =>
      mapRow({ ...row, invite_email: null, created_by: null }),
    );
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
