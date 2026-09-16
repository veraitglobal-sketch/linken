import "server-only";

import type { MetadataRoute } from "next";
import {
  caseStudySitemapEntries,
  companySitemapEntries,
  partnershipSitemapEntries,
} from "@/features/sitemap/entries";
import {
  countSitemapCompanies,
  listSitemapCompanies,
} from "@/features/sitemap/queries-companies";
import {
  countSitemapPartnerships,
  listSitemapPartnerships,
} from "@/features/sitemap/queries-partnerships";
import {
  countSitemapCaseStudies,
  countSitemapGroups,
  listSitemapCaseStudies,
  listSitemapGroups,
} from "@/features/sitemap/queries-content";
import { buildStaticSitemap } from "@/features/sitemap/static-routes";
import { rankingSitemapEntries } from "@/features/sitemap/queries-ranking";
import {
  SITEMAP_CASE_STUDY_BASE_ID,
  SITEMAP_CHUNK_SIZE,
  SITEMAP_COMPANY_BASE_ID,
  SITEMAP_GROUP_ID,
  SITEMAP_PARTNERSHIP_BASE_ID,
  SITEMAP_STATIC_ID,
} from "@/features/sitemap/types";
import { getSiteUrl } from "@/lib/site";
import { sitemapUrl } from "@/features/sitemap/url";

export async function listSitemapIds(): Promise<{ id: number }[]> {
  const [companyTotal, caseTotal, groupTotal, pairTotal] = await Promise.all([
    countSitemapCompanies(),
    countSitemapCaseStudies(),
    countSitemapGroups(),
    countSitemapPartnerships(),
  ]);

  const ids: { id: number }[] = [{ id: SITEMAP_STATIC_ID }];
  const pushChunks = (total: number, base: number) => {
    if (total <= 0) return;
    const chunks = Math.ceil(total / SITEMAP_CHUNK_SIZE);
    for (let i = 0; i < chunks; i++) ids.push({ id: base + i });
  };
  pushChunks(companyTotal, SITEMAP_COMPANY_BASE_ID);
  pushChunks(caseTotal, SITEMAP_CASE_STUDY_BASE_ID);
  if (groupTotal > 0) ids.push({ id: SITEMAP_GROUP_ID });
  pushChunks(pairTotal, SITEMAP_PARTNERSHIP_BASE_ID);
  return ids;
}

export async function buildSitemapForId(
  id: number,
): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  if (id === SITEMAP_STATIC_ID) {
    const ranking = await rankingSitemapEntries(siteUrl);
    return [...buildStaticSitemap(siteUrl), ...ranking];
  }

  if (id === SITEMAP_GROUP_ID) {
    const groups = await listSitemapGroups();
    return groups.map((group) => ({
      url: sitemapUrl(siteUrl, `/g/${group.slug}`),
      lastModified: new Date(group.createdAt),
      changeFrequency: "weekly" as const,
      priority: group.memberCount >= 3 ? 0.8 : 0.74,
    }));
  }

  if (id >= SITEMAP_PARTNERSHIP_BASE_ID) {
    const chunk = id - SITEMAP_PARTNERSHIP_BASE_ID;
    const rows = await listSitemapPartnerships(
      chunk * SITEMAP_CHUNK_SIZE,
      SITEMAP_CHUNK_SIZE,
    );
    return partnershipSitemapEntries(siteUrl, rows);
  }

  if (id >= SITEMAP_CASE_STUDY_BASE_ID) {
    const chunk = id - SITEMAP_CASE_STUDY_BASE_ID;
    const rows = await listSitemapCaseStudies(
      chunk * SITEMAP_CHUNK_SIZE,
      SITEMAP_CHUNK_SIZE,
    );
    return caseStudySitemapEntries(siteUrl, rows);
  }

  if (id >= SITEMAP_COMPANY_BASE_ID) {
    const chunk = id - SITEMAP_COMPANY_BASE_ID;
    const rows = await listSitemapCompanies(chunk * SITEMAP_CHUNK_SIZE);
    return companySitemapEntries(siteUrl, rows);
  }

  return [];
}
