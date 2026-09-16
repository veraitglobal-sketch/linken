"use server";

import { listCompaniesInCategory } from "@/features/companies/queries-category";
import type { DirectoryCardCompany } from "@/components/search/directory-company-card";

/** Next page of sector cards — one slug or a merged set (e.g. IT + software). */
export async function loadSectorCompaniesPage(
  slugs: string[],
  offset: number,
  limit = 16,
): Promise<DirectoryCardCompany[]> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return [];

  if (unique.length === 1) {
    const { companies } = await listCompaniesInCategory(unique[0]!, {
      limit,
      offset,
    });
    return companies;
  }

  const lists = await Promise.all(
    unique.map((slug) => listCompaniesInCategory(slug, { limit: 80, offset: 0 })),
  );
  const seen = new Set<string>();
  const merged: DirectoryCardCompany[] = [];
  for (const { companies } of lists) {
    for (const c of companies) {
      if (seen.has(c.slug)) continue;
      seen.add(c.slug);
      merged.push(c);
    }
  }
  merged.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return merged.slice(offset, offset + limit);
}
