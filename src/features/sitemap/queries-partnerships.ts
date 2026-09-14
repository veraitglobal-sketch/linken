import "server-only";

import type { SitemapPartnershipRow } from "@/features/sitemap/types";
import { SITEMAP_CHUNK_SIZE } from "@/features/sitemap/types";
import { getSitemapDb } from "@/features/sitemap/client";

export async function countSitemapPartnerships(): Promise<number> {
  const supabase = await getSitemapDb();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("partnerships")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted");
  if (error) {
    console.error("[sitemap] count partnerships", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function listSitemapPartnerships(
  offset: number,
  limit = SITEMAP_CHUNK_SIZE,
): Promise<SitemapPartnershipRow[]> {
  const supabase = await getSitemapDb();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("partnerships")
    .select("requester_id, recipient_id, responded_at, created_at")
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[sitemap] partnerships", error.message);
    return [];
  }
  if (!data?.length) return [];

  const ids = [
    ...new Set(
      data.flatMap((row) => [
        row.requester_id as string,
        row.recipient_id as string,
      ]),
    ),
  ];
  const { data: companies } = await supabase
    .from("companies")
    .select("id, slug")
    .in("id", ids);
  const slugById = new Map(
    (companies ?? []).map((c) => [c.id as string, c.slug as string]),
  );

  const out: SitemapPartnershipRow[] = [];
  for (const row of data) {
    const a = slugById.get(row.requester_id as string);
    const b = slugById.get(row.recipient_id as string);
    if (!a || !b || a === b) continue;
    const [leftSlug, rightSlug] = a.localeCompare(b) <= 0 ? [a, b] : [b, a];
    out.push({
      leftSlug,
      rightSlug,
      confirmedAt:
        (row.responded_at as string | null) || (row.created_at as string),
    });
  }
  return out;
}
