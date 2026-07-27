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

export default async function sitemap(props: {
  id: Promise<number>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  return buildSitemapForId(id);
}
