import type { ClientConfirmation } from "@/types/client-confirmation";
import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Confirmed client rows keyed by case_study_id (latest per case). */
export async function loadClientConfirmationsForCases(
  caseIds: string[],
): Promise<Map<string, ClientConfirmation>> {
  const map = new Map<string, ClientConfirmation>();
  if (caseIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_study_client_confirmation_requests")
    .select(
      "id, case_study_id, status, email, token, confirmed_at, confirmed_by_company_id, confirmer:companies!confirmed_by_company_id(id, name, slug, logo_url)",
    )
    .eq("status", "confirmed")
    .in("case_study_id", caseIds)
    .order("confirmed_at", { ascending: false });

  if (error) {
    console.error("[loadClientConfirmationsForCases]", error.message);
    return map;
  }

  for (const conf of data ?? []) {
    const caseId = conf.case_study_id as string;
    if (map.has(caseId)) continue;
    const firmRaw = conf.confirmer;
    const firm = Array.isArray(firmRaw) ? firmRaw[0] : firmRaw;
    if (!firm?.name || !firm?.slug) continue;
    const confirmedFirm = firm as {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
    };
    map.set(caseId, {
      id: conf.id as string,
      caseStudyId: caseId,
      status: "confirmed",
      email: conf.email as string,
      token: conf.token as string,
      confirmedAt: (conf.confirmed_at as string) ?? undefined,
      confirmedBy: {
        id: confirmedFirm.id,
        name: confirmedFirm.name,
        slug: confirmedFirm.slug,
        logoUrl: confirmedFirm.logo_url,
        logoInitials: initials(confirmedFirm.name),
      },
    });
  }

  return map;
}
