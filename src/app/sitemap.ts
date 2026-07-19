import type { MetadataRoute } from "next";
import { companies } from "@/data/mock/companies";
import { getCaseStudiesForCompany } from "@/data/mock/case-studies";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/search`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const companyRoutes: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${siteUrl}/c/${company.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = companies.flatMap((company) =>
    getCaseStudiesForCompany(company.slug).map((caseStudy) => ({
      url: `${siteUrl}/c/${company.slug}/case-studies/${caseStudy.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [...staticRoutes, ...companyRoutes, ...caseStudyRoutes];
}
