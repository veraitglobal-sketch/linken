"use server";

import { categoryName, matchCategory } from "@/features/categories/match";
import { recordCategoryUnmatched } from "@/features/categories/unmatched";
import { listCompaniesInCategory } from "@/features/companies/queries-category";
import {
  searchCompaniesForGraph,
  type CompanySearchHit,
} from "@/features/companies/search-action";
import {
  suggestCategories,
  type CategorySuggestion,
} from "@/features/ranking/suggest-action";

export type BoardSearchResult = {
  sectors: CategorySuggestion[];
  companies: CompanySearchHit[];
};

/**
 * The one question the search field asks: which sectors and which companies
 * match this text. Sector text also pulls every claimed firm in that branch.
 */
export async function searchBoard(query: string): Promise<BoardSearchResult> {
  const q = query.trim().slice(0, 80);
  if (!q) return { sectors: [], companies: [] };

  const [sectors, nameHits] = await Promise.all([
    suggestCategories(q, { record: false }),
    searchCompaniesForGraph(q, { includeUnclaimed: true }),
  ]);

  const taxonomy = matchCategory(q);
  let sectorsOut = sectors;
  if (taxonomy && !sectors.some((s) => s.slug === taxonomy.slug)) {
    const name = categoryName(taxonomy.slug) ?? q;
    sectorsOut = [{ slug: taxonomy.slug, name, count: 0 }, ...sectors];
  }

  const sectorSlugs = [
    ...new Set(
      [
        taxonomy?.slug,
        ...sectorsOut.slice(0, 3).map((s) => s.slug),
      ].filter(Boolean) as string[],
    ),
  ];

  let companies = nameHits;
  if (sectorSlugs.length > 0) {
    const bySlug = new Map(nameHits.map((c) => [c.slug, c]));
    const sectorLists = await Promise.all(
      sectorSlugs.map((slug) =>
        listCompaniesInCategory(slug, { limit: 16, offset: 0 }),
      ),
    );
    for (let i = 0; i < sectorSlugs.length; i++) {
      const slug = sectorSlugs[i]!;
      const inSector = sectorLists[i]?.companies ?? [];
      for (const c of inSector) {
        if (bySlug.has(c.slug)) continue;
        bySlug.set(c.slug, {
          id: c.slug,
          slug: c.slug,
          name: c.name,
          category: c.category,
          city: c.place.split(",")[0]?.trim() ?? "",
          country: c.place.split(",").slice(1).join(",").trim(),
          summary: c.summary,
          logoUrl: c.logoUrl,
          logoInitials: c.initials,
          claimed: true,
          verified: c.verified,
          confirmedPartnerCount: 0,
          createdAt: c.createdAt ?? null,
        });
      }
      const hit = sectorsOut.find((s) => s.slug === slug);
      if (hit) {
        hit.count = Math.max(hit.count, sectorLists[i]?.total ?? inSector.length);
      }
    }
    companies = [...bySlug.values()];
  }

  if (sectorsOut.length === 0 && companies.length === 0 && q.length >= 3) {
    await recordCategoryUnmatched(q);
  }

  return { sectors: sectorsOut, companies };
}
