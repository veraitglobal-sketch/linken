import "server-only";

import { isDeveloperPartnerKind } from "@/features/workspace/partner-mode";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { getSiteUrl } from "@/lib/site";

export type PartnerEmbedData = {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  website: string | null;
  logoUrl: string | null;
  referredCount: number;
  profileUrl: string;
  eligible: boolean;
};

/** Public partner badge payload — eligible when developer_partner or has referrals. */
export async function getPartnerEmbedData(
  slug: string,
): Promise<PartnerEmbedData | null> {
  if (!slug) return null;

  const publicClient = createPublicClient();
  const { data: row, error } = await publicClient
    .from("companies")
    .select(
      "id, name, slug, verified, website, logo_url, organization_kind, claimed",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row || row.claimed === false) return null;

  const admin = createAdminClient();
  let referredCount = 0;
  if (admin) {
    const { count } = await admin
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("referred_by_company_id", row.id);
    referredCount = count ?? 0;
  }

  const partner = isDeveloperPartnerKind(row.organization_kind as string);
  const eligible = partner || referredCount > 0;
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    verified: Boolean(row.verified),
    website: (row.website as string | null) ?? null,
    logoUrl: (row.logo_url as string | null) ?? null,
    referredCount,
    profileUrl: `${siteUrl}/c/${row.slug}?src=partner-badge`,
    eligible,
  };
}
