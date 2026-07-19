import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Owner + public meta for the keyed company — every agent mutation starts here. */
export async function getAgentCompanyOwnerMeta(
  admin: SupabaseClient,
  companyId: string,
) {
  const { data } = await admin
    .from("companies")
    .select("id, name, slug, verified, website, owner_id, logo_url, logo_source")
    .eq("id", companyId)
    .eq("claimed", true)
    .maybeSingle();

  if (!data?.owner_id) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    verified: Boolean(data.verified),
    website: (data.website as string) ?? "",
    ownerUserId: data.owner_id as string,
    logoUrl: (data.logo_url as string | null) ?? null,
    logoSource: (data.logo_source as string | null) ?? null,
  };
}
