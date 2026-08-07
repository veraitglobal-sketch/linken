import "server-only";

import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import {
  parseConfirmationLevel,
  parseDisclosure,
} from "@/features/confirmations/meta";
import { createClient } from "@/lib/supabase/server";
import type { ServiceReference } from "@/types/service-reference";

/**
 * Confirmed providers who list this company as client.
 * Public: confirmed only. Never pending.
 */
export async function getConfirmedProvidersForClient(
  clientCompanyId: string,
): Promise<ServiceReference[]> {
  if (!clientCompanyId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_references")
      .select(
        "id, client_name, client_company_id, service, started_year, ongoing, ended_year, status, confirmed_at, confirmation_level, disclosure, provider:companies!provider_company_id(slug, name, logo_url, website)",
      )
      .eq("client_company_id", clientCompanyId)
      .eq("status", "confirmed")
      .order("started_year", { ascending: true });

    if (error || !data) return [];

    const out: ServiceReference[] = [];
    for (const row of data) {
      const provider = Array.isArray(row.provider)
        ? row.provider[0]
        : row.provider;
      if (!provider?.slug || !provider?.name) continue;
      const website = (provider.website as string | null) ?? null;
      out.push({
        id: row.id as string,
        clientName: provider.name as string,
        clientCompanyId: null,
        clientSlug: provider.slug as string,
        clientLogoUrl: companyDisplayLogoUrl({
          logoUrl: (provider.logo_url as string | null) ?? null,
          website,
          allowFavicon: false,
        }),
        clientWebsite: website,
        service: row.service as string,
        startedYear: (row.started_year as string) ?? "",
        ongoing: Boolean(row.ongoing),
        endedYear: (row.ended_year as string | null) ?? null,
        status: "confirmed",
        confirmedAt: (row.confirmed_at as string | null) ?? null,
        confirmationLevel: parseConfirmationLevel(row.confirmation_level),
        disclosure: parseDisclosure(row.disclosure),
      });
    }
    return out;
  } catch {
    return [];
  }
}
