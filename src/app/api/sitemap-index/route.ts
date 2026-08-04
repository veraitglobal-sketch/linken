import { listSitemapIds } from "@/features/sitemap/build";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

/** Sitemap index for GSC — served at `/sitemap.xml` via rewrite. */
export async function GET() {
  const siteUrl = getSiteUrl();
  const ids = await listSitemapIds();
  const body = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...ids.map(
      ({ id }) =>
        `  <sitemap><loc>${siteUrl}/sitemap/${id}.xml</loc></sitemap>`,
    ),
    `</sitemapindex>`,
    ``,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
