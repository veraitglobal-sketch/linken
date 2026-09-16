import "server-only";

import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { CATEGORY_BY_SLUG, countryName, initials } from "@/features/ranking/helpers";
import { MIN_RANKED_FOR_POSITIONS } from "@/features/ranking/score";
import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { createPublicClient } from "@/lib/supabase/public";

export type { RankedCountry } from "@/features/ranking/queries-lists";
export {
  getRankedCountries,
  listRankedCategories,
} from "@/features/ranking/queries-lists";

/**
 * Reads for the ranking pages. Public, cached, confirmed rows only.
 *
 * A row is only here because two companies clicked confirm, so the list needs
 * no gate — but it does need the reason: every entry carries the counts that
 * produced its points, and a list too small to be a field carries no positions.
 */

export type RankedCompany = {
  slug: string;
  name: string;
  city: string;
  country: string;
  countryCode: string | null;
  logoUrl: string | null;
  logoInitials: string;
  verified: boolean;
  points: number;
  distinctPartners: number;
  confirmedRecords: number;
};

export type RankingList = {
  categorySlug: string;
  categoryName: string;
  countryCode: string | null;
  countryName: string | null;
  companies: RankedCompany[];
  total: number;
  /** Positions are only shown once the list is a real field. */
  showPositions: boolean;
};

type RankRow = {
  points: number | null;
  distinct_partners: number | null;
  confirmed_records: number | null;
  country_code: string | null;
  companies:
    | {
        slug: string;
        name: string;
        city: string | null;
        country: string | null;
        logo_url: string | null;
        website: string | null;
        verified: boolean | null;
        claimed: boolean | null;
      }
    | null
    | Array<Record<string, unknown>>;
};

function toCompany(row: RankRow): RankedCompany | null {
  const c = Array.isArray(row.companies)
    ? (row.companies[0] as RankRow["companies"] & object)
    : row.companies;
  if (!c || typeof c !== "object" || !("slug" in c) || !c.slug) return null;
  const company = c as Exclude<RankRow["companies"], null | Array<unknown>>;
  /* An unclaimed draft profile is a record about a company, not a company that
     chose to be here — it never occupies a position. */
  if (company.claimed === false) return null;
  return {
    slug: company.slug,
    name: company.name,
    city: company.city ?? "",
    country: company.country ?? "",
    countryCode: row.country_code,
    logoUrl: companyDisplayLogoUrl({
      logoUrl: company.logo_url,
      website: company.website,
      allowFavicon: false,
    }),
    logoInitials: initials(company.name),
    verified: Boolean(company.verified),
    points: Number(row.points ?? 0),
    distinctPartners: row.distinct_partners ?? 0,
    confirmedRecords: row.confirmed_records ?? 0,
  };
}

const SELECT =
  "points, distinct_partners, confirmed_records, country_code, companies!inner(slug, name, city, country, logo_url, website, verified, claimed)";

/** One category's list, worldwide or inside a country. */
export async function getRanking(input: {
  categorySlug: string;
  countryCode?: string | null;
  city?: string | null;
  limit?: number;
}): Promise<RankingList | null> {
  const categorySlug = canonicalCategorySlug(input.categorySlug);
  const category = categorySlug ? CATEGORY_BY_SLUG[categorySlug] : undefined;
  if (!category) return null;

  try {
    const supabase = createPublicClient();
    let req = supabase
      .from("company_rank")
      .select(SELECT)
      .eq("category_slug", category.slug)
      .gt("points", 0)
      .order("points", { ascending: false })
      .order("company_id", { ascending: true })
      .limit(input.limit ?? 50);

    if (input.countryCode) req = req.eq("country_code", input.countryCode);

    const { data, error } = await req;
    if (error) {
      console.error("[ranking]", error.message);
      return null;
    }

    let companies = (data ?? [])
      .map((row) => toCompany(row as unknown as RankRow))
      .filter((c): c is RankedCompany => c !== null);

    if (input.city) {
      const needle = input.city.trim().toLowerCase();
      companies = companies.filter((c) => c.city.trim().toLowerCase() === needle);
    }

    return {
      categorySlug: category.slug,
      categoryName: category.name,
      countryCode: input.countryCode ?? null,
      countryName: input.countryCode ? countryName(input.countryCode) : null,
      companies,
      total: companies.length,
      showPositions: companies.length >= MIN_RANKED_FOR_POSITIONS,
    };
  } catch (err) {
    console.error("[ranking]", err);
    return null;
  }
}
