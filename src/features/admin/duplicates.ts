import "server-only";

import { extractDomain } from "@/features/verification/domain";
import { createAdminClient } from "@/lib/supabase/admin";

export type DuplicateCandidate = {
  id: string;
  name: string;
  slug: string;
  website: string;
  claimed: boolean;
  verified: boolean;
  createdAt: string;
};

export type DuplicateGroup = {
  domain: string;
  companies: DuplicateCandidate[];
};

/**
 * Groups claimed + unclaimed companies by registrable website domain.
 * Fetches a bounded batch (most recent first) — this is an admin tool, not
 * a paginated dataset, so we scan a generous window rather than everything.
 */
export async function listDuplicateGroups(
  maxGroups = 50,
  scanLimit = 3000,
): Promise<DuplicateGroup[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data } = await admin
    .from("companies")
    .select("id, name, slug, website, claimed, verified, created_at")
    .not("website", "is", null)
    .neq("website", "")
    .is("merged_into_company_id", null)
    .order("created_at", { ascending: false })
    .limit(scanLimit);

  const byDomain = new Map<string, DuplicateCandidate[]>();
  for (const row of data ?? []) {
    const website = (row.website as string | null) ?? "";
    const domain = extractDomain(website);
    if (!domain) continue;

    const candidate: DuplicateCandidate = {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      website,
      claimed: Boolean(row.claimed),
      verified: Boolean(row.verified),
      createdAt: row.created_at as string,
    };

    const bucket = byDomain.get(domain);
    if (bucket) bucket.push(candidate);
    else byDomain.set(domain, [candidate]);
  }

  return [...byDomain.entries()]
    .filter(([, companies]) => companies.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, maxGroups)
    .map(([domain, companies]) => ({ domain, companies }));
}
