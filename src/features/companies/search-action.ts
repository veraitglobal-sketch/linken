"use server";

import { searchCompanies } from "@/features/companies/queries";
import type { Company } from "@/types/company";

export type CompanySearchHit = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  logoUrl: string | null;
  logoInitials: string;
  claimed: boolean;
};

export type CategorySearchHit = {
  label: string;
  count: number;
};

function toHit(c: Company): CompanySearchHit {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    category: c.category,
    city: c.city,
    logoUrl: c.logoUrl ?? null,
    logoInitials: c.logoInitials,
    claimed: c.claimed !== false,
  };
}

function sanitizeQuery(query: string) {
  return query.trim().replace(/[%_,]/g, "").slice(0, 80);
}

/** Lightweight search for the graph add drawer and public directory. */
export async function searchCompaniesForGraph(
  query: string,
  options?: { includeUnclaimed?: boolean },
): Promise<CompanySearchHit[]> {
  const rows = await searchCompanies(query, {
    includeUnclaimed: options?.includeUnclaimed,
  });
  return rows.slice(0, 20).map(toHit);
}

/** Homepage typeahead — companies and categories that actually exist. */
export async function searchPublicDirectory(query: string): Promise<{
  companies: CompanySearchHit[];
  categories: CategorySearchHit[];
}> {
  const q = sanitizeQuery(query);
  if (!q) return { companies: [], categories: [] };

  const rows = await searchCompanies(q, { includeUnclaimed: true });
  const needle = q.toLowerCase();
  const counts = new Map<string, number>();
  for (const c of rows) {
    const cat = c.category.trim();
    if (cat && cat.toLowerCase().includes(needle)) {
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
  }

  return {
    companies: rows.slice(0, 8).map(toHit),
    categories: [...counts]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count })),
  };
}
