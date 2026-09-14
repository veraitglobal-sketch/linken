import "server-only";

import { partnerCreditSnippet, partnersCreditSnippet } from "@/features/credits/snippet";
import type { PartnerCreditFlags } from "@/features/credits/types";
import type { PartnershipRow } from "@/features/partners/inbox";
import { createClient } from "@/lib/supabase/server";
import type { Partner } from "@/types/partner";

export async function getCreditFlagsByPartnership(
  companyId: string,
  partnershipIds: string[],
): Promise<Map<string, PartnerCreditFlags>> {
  const flags = new Map<string, PartnerCreditFlags>();
  for (const id of partnershipIds) {
    flags.set(id, { publishedByMe: false, publishedByThem: false });
  }
  if (!companyId || partnershipIds.length === 0) return flags;

  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_site_credits")
    .select("partnership_id, publisher_id")
    .in("partnership_id", partnershipIds);

  for (const row of data ?? []) {
    const current = flags.get(row.partnership_id as string);
    if (!current) continue;
    if (row.publisher_id === companyId) current.publishedByMe = true;
    else current.publishedByThem = true;
  }
  return flags;
}

/** Publishers who posted a credit for this company (partner ids). */
export async function getLivePublisherIds(
  creditedCompanyId: string,
  publisherIds: string[],
): Promise<Set<string>> {
  const live = new Set<string>();
  if (!creditedCompanyId || publisherIds.length === 0) return live;

  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_site_credits")
    .select("publisher_id")
    .eq("credited_id", creditedCompanyId)
    .in("publisher_id", publisherIds);

  for (const row of data ?? []) {
    live.add(row.publisher_id as string);
  }
  return live;
}

export async function withLiveOnSite(
  creditedCompanyId: string,
  partners: Partner[],
): Promise<Partner[]> {
  const live = await getLivePublisherIds(
    creditedCompanyId,
    partners.map((p) => p.id),
  );
  return partners.map((p) => ({ ...p, liveOnSite: live.has(p.id) }));
}

export function snippetForPartner(input: {
  slug: string;
  name: string;
  website?: string | null;
}): string | null {
  const website = (input.website ?? "").trim();
  if (!website) return null;
  return partnerCreditSnippet({
    slug: input.slug,
    name: input.name,
    website,
  });
}

export async function decorateAcceptedCredits(
  companyId: string,
  accepted: PartnershipRow[],
) {
  const flags = await getCreditFlagsByPartnership(
    companyId,
    accepted.map((row) => row.id),
  );
  const rows = accepted.map((row) => ({
    ...row,
    snippet: snippetForPartner(row.other),
    flags: flags.get(row.id) ?? {
      publishedByMe: false,
      publishedByThem: false,
    },
  }));
  const allSnippet = partnersCreditSnippet(
    accepted
      .filter((row) => row.other.website.trim())
      .map((row) => ({
        slug: row.other.slug,
        name: row.other.name,
        website: row.other.website,
      })),
  );
  return { rows, allSnippet };
}
