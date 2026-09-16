import {
  buildSitemapForId,
  listSitemapIds,
} from "@/features/sitemap/build";
import { sitemapEntriesToXml } from "@/features/sitemap/xml";

export const revalidate = 3600;

/**
 * Full urlset at `/sitemap.xml` (via rewrite).
 *
 * A sitemap *index* with child chunks is fine at scale, but with a small
 * catalogue GSC often shows Success + 0 discovered pages while children are
 * still pending — and apex→www redirects on the submitted URL fail as
 * "Sitemap could not be read". One flat urlset is the reliable default.
 */
export async function GET() {
  const ids = await listSitemapIds();
  const chunks = await Promise.all(
    ids.map(({ id }) => buildSitemapForId(id)),
  );
  const entries = chunks.flat();
  const body = sitemapEntriesToXml(entries);

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
