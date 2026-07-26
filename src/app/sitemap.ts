import type { MetadataRoute } from "next";
import { listSitemapEntries } from "@/features/companies/queries";
import { listGroupSlugs } from "@/features/groups/queries";
import { getSiteUrl } from "@/lib/site";

/** Uses Supabase auth cookies via server client — must not be statically prerendered. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/developers`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/changelog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/status`, changeFrequency: "daily", priority: 0.6 },
    { url: `${siteUrl}/security`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/cookies`, changeFrequency: "yearly", priority: 0.35 },
    {
      url: `${siteUrl}/developers/api-terms`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/developers/webhooks`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${siteUrl}/demo`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const { companies, caseStudies } = await listSitemapEntries();

  const companyRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${siteUrl}/c/${company.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${siteUrl}/c/${cs.companySlug}/case-studies/${cs.caseSlug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const groupSlugs = await listGroupSlugs();
  const groupRoutes: MetadataRoute.Sitemap = groupSlugs.map((slug) => ({
    url: `${siteUrl}/g/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...companyRoutes,
    ...caseStudyRoutes,
    ...groupRoutes,
  ];
}
