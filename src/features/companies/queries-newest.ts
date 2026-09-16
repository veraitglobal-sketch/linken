import "server-only";

import { createPublicClient } from "@/lib/supabase/public";

export type NewCompany = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  place: string;
  logoUrl: string | null;
  initials: string;
  verified: boolean;
  createdAt: string;
};

/**
 * The companies that joined most recently — for the search page.
 *
 * Oldest on the left, newest in the last slot. A new join lands in the
 * corner and shifts everyone one place left; the leftmost falls off.
 *
 * Claimed profiles only: a draft a partner created is a record about a company,
 * not a company that chose to be here. Hidden and merged rows are already
 * outside the public read policy, so nothing staff removed can surface here.
 */
export async function getNewestCompanies(limit = 8): Promise<NewCompany[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("companies")
      .select("slug, name, tagline, description, category, city, country, logo_url, verified, created_at")
      .eq("claimed", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[newest companies]", error.message);
      return [];
    }

    // Newest last (corner): take the latest N, then oldest → newest.
    return [...(data ?? [])].reverse().map((row) => {
      const name = String(row.name ?? "");
      const text = String(row.tagline || row.description || "").trim();
      return {
        slug: String(row.slug),
        name,
        category: String(row.category ?? "").trim(),
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
        createdAt: String(row.created_at),
      };
    });
  } catch (err) {
    console.error("[newest companies]", err);
    return [];
  }
}
