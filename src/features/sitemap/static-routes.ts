import type { MetadataRoute } from "next";
import { listUseCaseSlugs } from "@/features/seo/use-cases/catalog";
import { sitemapUrl } from "@/features/sitemap/url";

type StaticRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

const BASE: StaticRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.85 },
  { path: "/use-cases", changeFrequency: "monthly", priority: 0.8 },
  { path: "/company", changeFrequency: "monthly", priority: 0.55 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.55 },
  { path: "/developers", changeFrequency: "weekly", priority: 0.9 },
  { path: "/developers/webhooks", changeFrequency: "monthly", priority: 0.55 },
  { path: "/developers/api-terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.65 },
  { path: "/status", changeFrequency: "daily", priority: 0.5 },
  { path: "/security", changeFrequency: "monthly", priority: 0.5 },
  { path: "/disclosure", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.35 },
  { path: "/data-deletion", changeFrequency: "yearly", priority: 0.35 },
  { path: "/subprocessors", changeFrequency: "yearly", priority: 0.35 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.35 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/llms.txt", changeFrequency: "weekly", priority: 0.45 },
];

const ROUTES: StaticRoute[] = [
  ...BASE.slice(0, 4),
  ...listUseCaseSlugs().map(
    (slug): StaticRoute => ({
      path: `/use-cases/${slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  ),
  ...BASE.slice(4),
];

export function buildStaticSitemap(siteUrl: string): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: sitemapUrl(siteUrl, path || "/"),
    changeFrequency,
    priority,
  }));
}
