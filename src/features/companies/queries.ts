import { getCompanyBySlug as getMockCompany } from "@/data/mock/companies";
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

/** Public company fetch — never selects claim_token. */
export async function getCompanyForPage(slug: string): Promise<Company | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("companies")
      .select(
        "id, slug, name, tagline, description, category, city, country, website, logo_url, services, verified, claimed, accepting_clients, plan, created_by:companies!created_by_company_id(slug, name)",
      )
      .eq("slug", slug)
      .maybeSingle();

    // Never select claim_token or invite_email for public page payloads
    if (data) {
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
    }
  } catch {
    // fall through to mock
  }

  const mock = getMockCompany(slug);
  if (!mock) return null;
  return { ...mock, claimed: true, acceptingClients: true, plan: "free" };
}

export async function searchCompanies(query: string): Promise<Company[]> {
  const q = query.trim().toLowerCase();

  try {
    const supabase = await createClient();
    let req = supabase
      .from("companies")
      .select(
        "id, slug, name, tagline, description, category, city, country, website, logo_url, services, verified, claimed, accepting_clients, plan",
      )
      .order("name")
      .limit(40);

    if (q) {
      req = req.or(
        `name.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`,
      );
    }

    const { data, error } = await req;
    if (!error && data) {
      return data.map((row) => mapRow({ ...row, invite_email: null, created_by: null }));
    }
  } catch {
    // mock fallback
  }

  const { companies } = await import("@/data/mock/companies");
  return companies
    .filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    })
    .map((c) => ({ ...c, claimed: true, acceptingClients: true, plan: "free" as const }));
}
