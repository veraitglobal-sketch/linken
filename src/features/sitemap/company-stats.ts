import "server-only";

import type { getSitemapDb } from "@/features/sitemap/client";

type Db = NonNullable<Awaited<ReturnType<typeof getSitemapDb>>>;

export async function countCaseStudiesBySlug(db: Db, slugs: string[]) {
  const { data: companies } = await db
    .from("companies")
    .select("id, slug")
    .in("slug", slugs);

  if (!companies?.length) return new Map<string, number>();

  const idToSlug = new Map(companies.map((c) => [c.id as string, c.slug as string]));
  const { data: cases } = await db
    .from("case_studies")
    .select("company_id")
    .in("company_id", [...idToSlug.keys()]);

  const counts = new Map<string, number>();
  for (const row of cases ?? []) {
    const slug = idToSlug.get(row.company_id as string);
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

export async function countPartnersBySlug(db: Db, slugs: string[]) {
  const { data: companies } = await db
    .from("companies")
    .select("id, slug")
    .in("slug", slugs);

  if (!companies?.length) return new Map<string, number>();

  const idToSlug = new Map(companies.map((c) => [c.id as string, c.slug as string]));
  const ids = [...idToSlug.keys()];

  const [{ data: asRequester }, { data: asRecipient }] = await Promise.all([
    db
      .from("partnerships")
      .select("requester_id")
      .eq("status", "accepted")
      .in("requester_id", ids),
    db
      .from("partnerships")
      .select("recipient_id")
      .eq("status", "accepted")
      .in("recipient_id", ids),
  ]);

  const counts = new Map<string, number>();
  const bump = (companyId: string | null) => {
    if (!companyId) return;
    const slug = idToSlug.get(companyId);
    if (!slug) return;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  };
  for (const row of asRequester ?? []) bump(row.requester_id as string);
  for (const row of asRecipient ?? []) bump(row.recipient_id as string);
  return counts;
}
