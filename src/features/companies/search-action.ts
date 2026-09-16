"use server";

import {
  categoryName,
  matchCategory,
  normalizeCategoryText,
} from "@/features/categories/match";
import { suggestCategories } from "@/features/categories/suggest";
import { searchCompanies } from "@/features/companies/queries";
import type { Company } from "@/types/company";

export type CompanySearchHit = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  country: string;
  summary: string;
  logoUrl: string | null;
  logoInitials: string;
  claimed: boolean;
  /** Domain verified — public. */
  verified: boolean;
  /** Accepted partnerships only; pending never counts. */
  confirmedPartnerCount: number;
  createdAt: string | null;
};

export type CategorySearchHit = {
  label: string;
  slug: string;
  count: number;
};

function summarize(tagline: string, description: string) {
  const text = (tagline || description || "").trim();
  if (!text) return "";
  return text.length > 140 ? `${text.slice(0, 137).trimEnd()}…` : text;
}

function toHit(c: Company): CompanySearchHit {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    category: c.category,
    city: c.city,
    country: c.country ?? "",
    summary: summarize(c.tagline ?? "", c.description ?? ""),
    logoUrl: c.logoUrl ?? null,
    logoInitials: c.logoInitials,
    claimed: c.claimed !== false,
    verified: Boolean(c.verified && c.claimed !== false),
    confirmedPartnerCount: c.confirmedPartnerCount ?? 0,
    createdAt: c.createdAt ?? null,
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

/** Homepage typeahead — companies and sectors the visitor can open. */
export async function searchPublicDirectory(query: string): Promise<{
  companies: CompanySearchHit[];
  categories: CategorySearchHit[];
}> {
  const q = sanitizeQuery(query);
  if (!q) return { companies: [], categories: [] };

  const rows = await searchCompanies(q, { includeUnclaimed: true });
  const bySlug = new Map<string, CategorySearchHit>();
  const nq = normalizeCategoryText(q);

  const addSector = (slug: string, label: string, count = 0) => {
    const prev = bySlug.get(slug);
    bySlug.set(slug, {
      label,
      slug,
      count: (prev?.count ?? 0) + count,
    });
  };

  const taxonomy = matchCategory(q);
  if (taxonomy) {
    addSector(taxonomy.slug, categoryName(taxonomy.slug) ?? q);
  }

  for (const cat of suggestCategories(q, 5)) {
    if (!bySlug.has(cat.slug)) addSector(cat.slug, cat.name);
  }

  for (const c of rows) {
    const raw = c.category.trim().split("·")[0]?.trim() ?? "";
    if (!raw) continue;
    const hit = matchCategory(raw);
    if (!hit) continue;
    addSector(hit.slug, categoryName(hit.slug) ?? raw, 1);
  }

  return {
    companies: rows.slice(0, 8).map(toHit),
    categories: [...bySlug.values()]
      .sort((a, b) => {
        const aExact = normalizeCategoryText(a.label) === nq ? 1 : 0;
        const bExact = normalizeCategoryText(b.label) === nq ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return b.count - a.count || a.label.localeCompare(b.label);
      })
      .slice(0, 5),
  };
}
