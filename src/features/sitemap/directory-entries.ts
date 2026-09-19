import type { MetadataRoute } from "next";
import {
  directoryLetterSlug,
  groupDirectoryByLetter,
} from "@/features/seo/directory-group";
import type { DirectoryCompany } from "@/features/seo/directory-queries";
import { sitemapUrl } from "@/features/sitemap/url";

/** /companies/{letter} — names as crawlable hubs. */
export function directoryLetterSitemapEntries(
  siteUrl: string,
  rows: DirectoryCompany[],
): MetadataRoute.Sitemap {
  return groupDirectoryByLetter(rows).map((g) => ({
    url: sitemapUrl(siteUrl, `/companies/${directoryLetterSlug(g.letter)}`),
    changeFrequency: "daily" as const,
    priority: 0.72,
  }));
}
