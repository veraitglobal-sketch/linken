import type { MetadataRoute } from "next";
import {
  buildSitemapForId,
  listSitemapIds,
} from "@/features/sitemap/build";

/** Refresh hourly — balances freshness with egress. */
export const revalidate = 3600;

export async function generateSitemaps() {
  return listSitemapIds();
}

/**
 * Next.js 16: `id` is Promise<string> (was number in 15).
 * Without Number(), `"0" === 0` fails and every chunk returns [].
 */
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  if (!Number.isFinite(id)) return [];
  return buildSitemapForId(id);
}
