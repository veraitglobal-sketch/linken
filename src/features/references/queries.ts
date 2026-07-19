import { createClient } from "@/lib/supabase/server";
import type { ServiceReference } from "@/types/service-reference";

export type ReferencePreview = {
  id: string;
  status: string;
  service: string;
  startedYear: string;
  ongoing: boolean;
  endedYear: string | null;
  clientName: string;
  inviteEmail: string | null;
  providerId: string;
  providerName: string;
  providerSlug: string;
};

export async function getReferencesForCompany(
  companyId: string,
): Promise<ServiceReference[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_references")
      .select(
        "id, client_name, client_company_id, service, started_year, ongoing, ended_year, status, confirmed_at, client:companies!client_company_id(slug)",
      )
      .eq("provider_company_id", companyId)
      .in("status", ["confirmed", "pending"])
      .order("status", { ascending: true })
      .order("started_year", { ascending: true });

    if (error || !data) return [];

    const mapped = data.map((row) => {
      const client = Array.isArray(row.client) ? row.client[0] : row.client;
      return {
        id: row.id,
        clientName: row.client_name,
        clientCompanyId: row.client_company_id,
        clientSlug: client?.slug ?? null,
        service: row.service,
        startedYear: row.started_year ?? "",
        ongoing: Boolean(row.ongoing),
        endedYear: row.ended_year,
        status: row.status as ServiceReference["status"],
        confirmedAt: row.confirmed_at,
      };
    });

    // Confirmed + ongoing first (strongest proof), then other confirmed, then pending
    return mapped.sort((a, b) => {
      const score = (r: ServiceReference) =>
        (r.status === "confirmed" ? 2 : 0) + (r.ongoing ? 1 : 0);
      return score(b) - score(a) || a.startedYear.localeCompare(b.startedYear);
    });
  } catch {
    return [];
  }
}

export async function getReferencePreview(
  token: string,
): Promise<ReferencePreview | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_service_reference_preview", {
      p_token: token,
    });
    if (error || !data?.[0]) return null;
    const row = data[0];
    return {
      id: row.id,
      status: row.status,
      service: row.service,
      startedYear: row.started_year ?? "",
      ongoing: Boolean(row.ongoing),
      endedYear: row.ended_year,
      clientName: row.client_name,
      inviteEmail: row.invite_email,
      providerId: row.provider_id,
      providerName: row.provider_name,
      providerSlug: row.provider_slug,
    };
  } catch {
    return null;
  }
}
