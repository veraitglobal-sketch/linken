import "server-only";

import { extractDomain } from "@/features/verification/domain";
import type { DuplicateCandidate } from "@/features/admin/duplicates";
import { createAdminClient } from "@/lib/supabase/admin";

/** Same registrable domain as this company, excluding itself and merge-losers. */
export async function listSameDomainPeers(
  companyId: string,
  website: string,
): Promise<{ domain: string; peers: DuplicateCandidate[] } | null> {
  const domain = extractDomain(website);
  if (!domain) return null;

  const admin = createAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("companies")
    .select("id, name, slug, website, claimed, verified, created_at")
    .not("website", "is", null)
    .neq("website", "")
    .is("merged_into_company_id", null)
    .neq("id", companyId)
    .order("created_at", { ascending: false })
    .limit(500);

  const peers: DuplicateCandidate[] = [];
  for (const row of data ?? []) {
    const site = (row.website as string | null) ?? "";
    if (extractDomain(site) !== domain) continue;
    peers.push({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      website: site,
      claimed: Boolean(row.claimed),
      verified: Boolean(row.verified),
      createdAt: row.created_at as string,
    });
  }

  if (peers.length === 0) return null;
  return { domain, peers };
}
