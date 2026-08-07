import "server-only";

import { initialsFromName } from "@/features/team/types";
import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { emailDomain, extractDomain, isPublicEmailProvider } from "@/features/verification/domain";
import { createClient } from "@/lib/supabase/server";

export type ListingCompany = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  logoInitials: string;
};

function normalizeClientName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Public providers who already list this firm as a client
 * (confirmed references + confirmed case-study clients).
 */
export async function getCompaniesListingClient(input: {
  clientCompanyId: string | null;
  clientName: string;
  email: string | null;
}): Promise<ListingCompany[]> {
  const supabase = await createClient();
  const nameKey = normalizeClientName(input.clientName);
  const mail = input.email ? emailDomain(input.email) : null;
  const domain =
    mail && !isPublicEmailProvider(mail) ? mail : null;

  const clientIds = new Set<string>();
  if (input.clientCompanyId) clientIds.add(input.clientCompanyId);

  if (nameKey.length >= 2) {
    const { data: byName } = await supabase
      .from("companies")
      .select("id, name, website")
      .ilike("name", nameKey)
      .eq("claimed", true)
      .limit(25);
    for (const row of byName ?? []) {
      if (normalizeClientName(row.name as string) === nameKey) {
        clientIds.add(row.id as string);
      }
    }
  }

  if (domain) {
    const { data: bySite } = await supabase
      .from("companies")
      .select("id, website")
      .ilike("website", `%${domain}%`)
      .eq("claimed", true)
      .limit(40);
    for (const row of bySite ?? []) {
      const site = extractDomain((row.website as string) ?? "");
      // Exact registrable domain only — reject subdomain / partial matches.
      if (site === domain) clientIds.add(row.id as string);
    }
  }

  const providerMap = new Map<string, ListingCompany>();

  const { data: refs } = await supabase
    .from("service_references")
    .select(
      "provider_company_id, client_company_id, client_name, provider:companies!provider_company_id(id, name, slug, logo_url, website, claimed)",
    )
    .eq("status", "confirmed")
    .limit(200);

  for (const row of refs ?? []) {
    const clientId = row.client_company_id as string | null;
    const refName = normalizeClientName((row.client_name as string) ?? "");
    const matchId = clientId && clientIds.has(clientId);
    const matchName = Boolean(nameKey) && refName === nameKey;
    if (!matchId && !matchName) continue;

    const provider = Array.isArray(row.provider) ? row.provider[0] : row.provider;
    if (!provider?.id || provider.claimed === false) continue;
    if (clientId && provider.id === clientId) continue;
    if (input.clientCompanyId && provider.id === input.clientCompanyId) continue;
    addProvider(providerMap, provider);
  }

  if (clientIds.size > 0) {
    const { data: cases } = await supabase
      .from("case_study_client_confirmation_requests")
      .select(
        "requested_by_company_id, confirmed_by_company_id, requester:companies!requested_by_company_id(id, name, slug, logo_url, website, claimed)",
      )
      .eq("status", "confirmed")
      .in("confirmed_by_company_id", [...clientIds])
      .limit(100);

    for (const row of cases ?? []) {
      const requester = Array.isArray(row.requester)
        ? row.requester[0]
        : row.requester;
      if (!requester?.id || requester.claimed === false) continue;
      if (
        input.clientCompanyId &&
        requester.id === input.clientCompanyId
      ) {
        continue;
      }
      addProvider(providerMap, requester);
    }
  }

  return [...providerMap.values()].slice(0, 12);
}

function addProvider(
  map: Map<string, ListingCompany>,
  provider: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
    website?: string | null;
  },
) {
  if (map.has(provider.id)) return;
  const website = (provider.website as string | null) ?? null;
  map.set(provider.id, {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    website,
    logoUrl: companyDisplayLogoUrl({
      logoUrl: provider.logo_url ?? null,
      website,
      allowFavicon: false,
    }),
    logoInitials: initialsFromName(provider.name),
  });
}

/** Suggested website from invite email domain (never public mail providers). */
export function suggestedWebsiteFromEmail(email: string | null): string {
  if (!email) return "";
  const domain = emailDomain(email);
  if (!domain || isPublicEmailProvider(domain)) return "";
  return `https://${domain}`;
}
