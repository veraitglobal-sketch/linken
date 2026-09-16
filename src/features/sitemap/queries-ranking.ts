import "server-only";

import type { MetadataRoute } from "next";
import { MIN_RANKED_FOR_PAGE } from "@/features/ranking/score";
import { getRankedCountries, listRankedCategories } from "@/features/ranking/queries";
import { sitemapUrl } from "@/features/sitemap/url";

/** Public ranking pages that actually have companies — never empty lists. */
export async function rankingSitemapEntries(
  siteUrl: string,
): Promise<MetadataRoute.Sitemap> {
  try {
    const categories = await listRankedCategories();
    const entries: MetadataRoute.Sitemap = [
      {
        url: sitemapUrl(siteUrl, "/best"),
        changeFrequency: "daily",
        priority: 0.8,
      },
    ];
    for (const category of categories) {
      entries.push({
        url: sitemapUrl(siteUrl, `/best/${category.slug}`),
        changeFrequency: "daily",
        priority: 0.75,
      });
      const countries = await getRankedCountries(category.slug);
      for (const country of countries) {
        if (country.count < MIN_RANKED_FOR_PAGE) continue;
        entries.push({
          url: sitemapUrl(
            siteUrl,
            `/best/${category.slug}/${country.code.toLowerCase()}`,
          ),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
    return entries;
  } catch (err) {
    console.error("[sitemap ranking]", err);
    return [];
  }
}
