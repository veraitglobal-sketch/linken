import "server-only";

import type { MetadataRoute } from "next";
import {
  caseStudySitemapEntries,
  companySitemapEntries,
} from "@/features/sitemap/entries";
import {
  countSitemapCompanies,
  listSitemapCompanies,
} from "@/features/sitemap/queries-companies";
import {
  countSitemapCaseStudies,
  countSitemapGroups,
  listSitemapCaseStudies,
  listSitemapGroups,
} from "@/features/sitemap/queries-content";
import { buildStaticSitemap } from "@/features/sitemap/static-routes";
import {
  SITEMAP_CASE_STUDY_BASE_ID,
  SITEMAP_CHUNK_SIZE,
  SITEMAP_COMPANY_BASE_ID,
  SITEMAP_GROUP_ID,
  SITEMAP_STATIC_ID,
} from "@/features/sitemap/types";
import { getSiteUrl } from "@/lib/site";
import { sitemapUrl } from "@/features/sitemap/url";

export async function listSitemapIds(): Promise<{ id: number }[]> {
  const [companyTotal, caseTotal, groupTotal] = await Promise.all([
    countSitemapCompanies(),
    countSitemapCaseStudies(),
    countSitemapGroups(),
  ]);

  const ids: { id: number }[] = [{ id: SITEMAP_STATIC_ID }];

  if (companyTotal > 0) {
    const chunks = Math.ceil(companyTotal / SITEMAP_CHUNK_SIZE);
    for (let i = 0; i < chunks; i++) {
      ids.push({ id: SITEMAP_COMPANY_BASE_ID + i });
    }
  }

  if (caseTotal > 0) {
    const chunks = Math.ceil(caseTotal / SITEMAP_CHUNK_SIZE);
    for (let i = 0; i < chunks; i++) {
      ids.push({ id: SITEMAP_CASE_STUDY_BASE_ID + i });
    }
  }

  if (groupTotal > 0) {
    ids.push({ id: SITEMAP_GROUP_ID });
  }

  return ids;
}

export async function buildSitemapForId(id: number): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  if (id === SITEMAP_STATIC_ID) {
    return buildStaticSitemap(siteUrl);
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

  if (id >= SITEMAP_CASE_STUDY_BASE_ID && id < SITEMAP_COMPANY_BASE_ID) {
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
