"use server";

import { searchCompanies } from "@/features/companies/queries";

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

/** Lightweight search for the graph add drawer. */
export async function searchCompaniesForGraph(
  query: string,
): Promise<CompanySearchHit[]> {
  const rows = await searchCompanies(query);
  return rows.slice(0, 20).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    category: c.category,
    city: c.city,
    logoUrl: c.logoUrl ?? null,
    logoInitials: c.logoInitials,
    claimed: c.claimed !== false,
  }));
}
