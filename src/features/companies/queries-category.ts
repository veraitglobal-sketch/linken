import "server-only";

import { matchCategory } from "@/features/categories/match";
import { categoryBySlug, canonicalCategorySlug } from "@/features/categories/taxonomy";
import { asCompanySector, asPublicCompanyText } from "@/features/companies/sector";
import { createPublicClient } from "@/lib/supabase/public";
import type { DirectoryCardCompany } from "@/components/search/directory-company-card";

/**
 * Every claimed company in a sector — not only those with ranking points.
 * Matches `category_slug` and free-text categories that resolve to the same sector.
 */
export async function listCompaniesInCategory(
  categorySlug: string,
  opts?: { limit?: number; offset?: number },
): Promise<{ companies: DirectoryCardCompany[]; total: number }> {
  const slug = canonicalCategorySlug(categorySlug);
  const category = slug ? categoryBySlug(slug) : undefined;
  if (!category) return { companies: [], total: 0 };

  const limit = Math.min(Math.max(opts?.limit ?? 16, 1), 80);
  const offset = Math.max(opts?.offset ?? 0, 0);
  const needle = category.name.split(/\s+/)[0]?.replace(/[%_,]/g, "") ?? "";

  try {
    const supabase = createPublicClient();
    let req = supabase
      .from("companies")
      .select(
        "slug, name, tagline, description, category, category_slug, city, country, logo_url, verified, created_at",
        { count: "exact" },
      )
      .eq("claimed", true)
      .order("created_at", { ascending: false });

    if (needle.length >= 3) {
      req = req.or(
        `category_slug.eq.${category.slug},category.ilike.%${needle}%`,
      );
    } else {
      req = req.eq("category_slug", category.slug);
    }

    const { data, error, count } = await req.range(
      offset,
      offset + Math.min(limit * 3, 120) - 1,
    );
    if (error) {
      console.error("[listCompaniesInCategory]", error.message);
      return { companies: [], total: 0 };
    }

    const companies = (data ?? [])
      .filter((row) => {
        if (String(row.category_slug ?? "") === category.slug) return true;
        return matchCategory(String(row.category ?? ""))?.slug === category.slug;
      })
      .slice(0, limit)
      .map((row) => {
        const name = String(row.name ?? "");
        const text = (
          asPublicCompanyText("tagline", row.tagline) ||
          asPublicCompanyText("description", row.description)
        ).trim();
        return {
          slug: String(row.slug),
          name,
          category: asCompanySector(row.category) || category.name,
          summary: text.length > 140 ? `${text.slice(0, 137).trimEnd()}…` : text,
          place: [row.city, row.country].filter(Boolean).join(", "),
          logoUrl: (row.logo_url as string | null) ?? null,
          initials: name
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          verified: Boolean(row.verified),
          createdAt: String(row.created_at ?? ""),
          src: "search-category",
        };
      });

    return { companies, total: count ?? companies.length };
  } catch (err) {
    console.error("[listCompaniesInCategory]", err);
    return { companies: [], total: 0 };
  }
}
