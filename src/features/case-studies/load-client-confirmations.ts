import {
  parseConfirmationLevel,
  parseDisclosure,
  UNDISCLOSED_CLIENT_LABEL,
  isUndisclosedPublic,
} from "@/features/confirmations/meta";
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
  opts?: { reveal?: boolean },
): Promise<Map<string, ClientConfirmation>> {
  const map = new Map<string, ClientConfirmation>();
  if (caseIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_study_client_confirmation_requests")
    .select(
      "id, case_study_id, status, confirmed_at, confirmed_by_company_id, confirmation_level, disclosure, confirmer:companies!confirmed_by_company_id(id, name, slug, logo_url)",
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
    const disclosure = parseDisclosure(conf.disclosure);
    const level = parseConfirmationLevel(conf.confirmation_level);
    const hide = !opts?.reveal && isUndisclosedPublic(disclosure);

    const firmRaw = conf.confirmer;
    const firm = Array.isArray(firmRaw) ? firmRaw[0] : firmRaw;
    if (!hide && (!firm?.name || !firm?.slug)) continue;

    const confirmedFirm = firm as {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
    } | null;

    map.set(caseId, {
      id: conf.id as string,
      caseStudyId: caseId,
      status: "confirmed",
      email: "",
      token: "",
      confirmedAt: (conf.confirmed_at as string) ?? undefined,
      confirmationLevel: level,
      disclosure,
      confirmedBy: hide
        ? {
            id: "undisclosed",
            name: UNDISCLOSED_CLIENT_LABEL,
            slug: "",
            logoUrl: null,
            logoInitials: "UC",
          }
        : {
            id: confirmedFirm!.id,
            name: confirmedFirm!.name,
            slug: confirmedFirm!.slug,
            logoUrl: confirmedFirm!.logo_url,
            logoInitials: initials(confirmedFirm!.name),
          },
    });
  }

  return map;
}
