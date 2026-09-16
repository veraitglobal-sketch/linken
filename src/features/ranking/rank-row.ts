import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { initials } from "@/features/ranking/helpers";

/**
 * One stored ranking row, turned into the shape the lists render.
 *
 * Shared by every ranking read — the category page, the country page and the
 * search screen — so the rule that keeps unclaimed drafts out of positions
 * lives in exactly one place.
 */

export type RankedCompany = {
  id: string;
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

export type RankRow = {
  points: number | null;
  distinct_partners: number | null;
  confirmed_records: number | null;
  country_code: string | null;
  category_slug?: string | null;
  companies:
    | {
        id: string;
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

export const RANK_SELECT =
  "points, distinct_partners, confirmed_records, country_code, category_slug, companies!inner(id, slug, name, city, country, logo_url, website, verified, claimed)";

export function toRankedCompany(row: RankRow): RankedCompany | null {
  const c = Array.isArray(row.companies)
    ? (row.companies[0] as RankRow["companies"] & object)
    : row.companies;
  if (!c || typeof c !== "object" || !("slug" in c) || !c.slug) return null;
  const company = c as Exclude<RankRow["companies"], null | Array<unknown>>;
  /* An unclaimed draft profile is a record about a company, not a company that
     chose to be here — it never occupies a position. */
  if (company.claimed === false) return null;
  return {
    id: company.id,
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
