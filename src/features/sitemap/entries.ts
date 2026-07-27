import type { MetadataRoute } from "next";
import {
  caseStudyPriority,
  companyBookPriority,
  companyPartnersPriority,
  companyProfilePriority,
} from "@/features/sitemap/priorities";
import type {
  SitemapCaseStudyRow,
  SitemapCompanyRow,
} from "@/features/sitemap/types";
import { absoluteAssetUrl, sitemapUrl } from "@/features/sitemap/url";

type Entry = MetadataRoute.Sitemap[number];

function withImage(
  entry: Entry,
  siteUrl: string,
  imageUrl: string | null | undefined,
): Entry {
  const abs = absoluteAssetUrl(siteUrl, imageUrl);
  if (!abs) return entry;
  return { ...entry, images: [abs] };
}

export function companySitemapEntries(
  siteUrl: string,
  rows: SitemapCompanyRow[],
): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];

  for (const row of rows) {
    const lastModified = new Date(row.updatedAt);
    const profilePriority = companyProfilePriority(row);

    out.push(
      withImage(
        {
          url: sitemapUrl(siteUrl, `/c/${row.slug}`),
          lastModified,
          changeFrequency: "weekly",
          priority: profilePriority,
        },
        siteUrl,
        row.logoUrl,
      ),
    );

    if (row.partnerCount > 0) {
      out.push({
        url: sitemapUrl(siteUrl, `/c/${row.slug}/partners`),
        lastModified,
        changeFrequency: "weekly",
        priority: companyPartnersPriority(profilePriority),
      });
    }

    if (row.hasBooking) {
      out.push({
        url: sitemapUrl(siteUrl, `/c/${row.slug}/book`),
        lastModified,
        changeFrequency: "monthly",
        priority: companyBookPriority(row),
      });
    }
  }

  return out;
}

export function caseStudySitemapEntries(
  siteUrl: string,
  rows: SitemapCaseStudyRow[],
): MetadataRoute.Sitemap {
  return rows.map((cs) =>
    withImage(
      {
        url: sitemapUrl(
          siteUrl,
          `/c/${cs.companySlug}/case-studies/${cs.caseSlug}`,
        ),
        lastModified: new Date(cs.createdAt),
        changeFrequency: "monthly",
        priority: caseStudyPriority(Boolean(cs.coverImageUrl), cs.clientConfirmed),
      },
      siteUrl,
      cs.coverImageUrl,
    ),
  );
}
