import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getTrustProfile } from "@/features/trust/queries";
import type { TrustLevel } from "@/features/trust/score";
import { createClient } from "@/lib/supabase/server";
import type { RadarCompanyHit } from "@/types/intro";

export type RadarSearchFilters = {
  category?: string;
  country?: string;
  city?: string;
  level?: TrustLevel | "";
  acceptingClients?: boolean | null;
  excludeCompanyId?: string;
};

const LEVEL_RANK: Record<TrustLevel, number> = {
  Member: 0,
  Established: 1,
  Trusted: 2,
  Pillar: 3,
};

export async function searchRadarCompanies(
  filters: RadarSearchFilters,
): Promise<RadarCompanyHit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_radar_companies", {
    p_category: filters.category?.trim() ?? "",
    p_country: filters.country?.trim() ?? "",
    p_city: filters.city?.trim() ?? "",
    p_accepting_clients: filters.acceptingClients ?? null,
    p_limit: 40,
  });

  if (error || !data) {
    console.error("search_radar_companies:", error?.message);
    return [];
  }

  const minLevel = filters.level || "";
  const rows = (data as Record<string, unknown>[]).filter(
    (row) => String(row.id) !== filters.excludeCompanyId,
  );

  const enriched = await Promise.all(
    rows.map(async (row) => {
      const id = String(row.id);
      const slug = String(row.slug ?? "");
      const [trust, assessment] = await Promise.all([
        getTrustProfile(id, slug),
        getClientAssessmentSummary(id),
      ]);
      const would =
        assessment.wouldWorkAgainTotal >= 3
          ? `${assessment.wouldWorkAgainYes} of ${assessment.wouldWorkAgainTotal} would work again`
          : null;

      return {
        id,
        slug,
        name: String(row.name ?? ""),
        category: String(row.category ?? ""),
        city: String(row.city ?? ""),
        country: String(row.country ?? ""),
        verified: Boolean(row.verified),
        acceptingClients: Boolean(row.accepting_clients),
        receiveIntros: Boolean(row.receive_intros),
        website: String(row.website ?? ""),
        trustLevel: trust.level,
        wouldWorkAgain: would,
      } satisfies RadarCompanyHit;
    }),
  );

  if (!minLevel) return enriched;

  const minRank = LEVEL_RANK[minLevel as TrustLevel] ?? 0;
  return enriched.filter(
    (h) => LEVEL_RANK[(h.trustLevel as TrustLevel) ?? "Member"] >= minRank,
  );
}
