import { matchCategory, normalizeCategoryText } from "@/features/categories/match";
import type { CompanySearchHit } from "@/features/companies/search-action";
import { sectorTextMatches } from "@/features/search/sector-text-match";

/** Firms whose name matches the typed text (e.g. “Vera IT Hamburg” for “it”). */
export function nameMatchingCompanies(
  query: string,
  companies: CompanySearchHit[],
): CompanySearchHit[] {
  const q = normalizeCategoryText(query);
  if (q.length < 2) return [];
  return companies.filter((c) => {
    if (q.includes(" ")) {
      return normalizeCategoryText(c.name).includes(q);
    }
    return sectorTextMatches(c.name, q);
  });
}

/** Sector browse cards: claimed firms in the matched sector(s) only. */
export function sectorBrowseCompanies(
  query: string,
  companies: CompanySearchHit[],
  sectorSlugs: string[] = [],
): CompanySearchHit[] {
  const named = new Set(nameMatchingCompanies(query, companies).map((c) => c.id));
  const rest = companies.filter((c) => !named.has(c.id));
  if (sectorSlugs.length === 0) return rest;

  const slugs = new Set(sectorSlugs);
  return rest.filter((c) => {
    const hit = matchCategory(c.category);
    return hit != null && slugs.has(hit.slug);
  });
}
