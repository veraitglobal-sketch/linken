import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { getTrustProfile } from "@/features/trust/queries";
import type { TrustLevel } from "@/features/trust/score";
import { createClient } from "@/lib/supabase/server";
import type {
  ApiTrustLevelKey,
  RadarCompanyLead,
  RadarDigestSummary,
  RadarFeedReason,
  SavedSearch,
} from "@/types/radar-leads";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function asReason(value: string): RadarFeedReason {
  if (
    value === "became_verified" ||
    value === "accepting_clients" ||
    value === "level_up"
  ) {
    return value;
  }
  return "new_company";
}

function asMinLevel(value: string | null): ApiTrustLevelKey | null {
  if (
    value === "member" ||
    value === "established" ||
    value === "trusted" ||
    value === "pillar"
  ) {
    return value;
  }
  return null;
}

function toDisplayLevel(api: string | undefined): TrustLevel {
  switch ((api ?? "").toLowerCase()) {
    case "established":
      return "Established";
    case "trusted":
      return "Trusted";
    case "pillar":
      return "Pillar";
    default:
      return "Member";
  }
}

export async function listSavedSearches(
  companyId: string,
): Promise<SavedSearch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select(
      "id, company_id, name, category, country, city, min_trust_level, only_verified, only_accepting, created_at",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("listSavedSearches:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: String(row.id),
    companyId: String(row.company_id),
    name: String(row.name),
    category: (row.category as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    minTrustLevel: asMinLevel(row.min_trust_level as string | null),
    onlyVerified: Boolean(row.only_verified),
    onlyAccepting: Boolean(row.only_accepting),
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function listCompanyLeads(
  companyId: string,
  opts?: { limit?: number; unseenOnly?: boolean },
): Promise<RadarCompanyLead[]> {
  const supabase = await createClient();
  const limit = Math.min(Math.max(opts?.limit ?? 40, 1), 80);

  let query = supabase
    .from("radar_feed_items")
    .select(
      "id, reason, created_at, seen_at, saved_search_id, matched_company_id",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts?.unseenOnly) {
    query = query.is("seen_at", null);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("listCompanyLeads:", error?.message);
    return [];
  }

  if (data.length === 0) return [];

  const searchIds = [
    ...new Set(
      data
        .map((r) => r.saved_search_id as string | null)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const matchedIds = [
    ...new Set(data.map((r) => String(r.matched_company_id))),
  ];

  const [{ data: searches }, { data: companies }] = await Promise.all([
    searchIds.length
      ? supabase.from("saved_searches").select("id, name").in("id", searchIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    supabase
      .from("companies")
      .select(
        "id, slug, name, category, city, country, website, logo_url, verified, accepting_clients, receive_intros",
      )
      .in("id", matchedIds),
  ]);

  const searchName = new Map(
    (searches ?? []).map((s) => [String(s.id), String(s.name)]),
  );
  const companyMap = new Map(
    (companies ?? []).map((c) => [String(c.id), c]),
  );

  const trustById = new Map<string, TrustLevel>();
  await Promise.all(
    matchedIds.map(async (id) => {
      const c = companyMap.get(id);
      if (!c) return;
      const trust = await getTrustProfile(id, String(c.slug ?? ""));
      trustById.set(id, trust.level);
    }),
  );

  return data.flatMap((row) => {
    const matchedId = String(row.matched_company_id);
    const c = companyMap.get(matchedId);
    if (!c) return [];

    const name = String(c.name ?? "Company");
    const website = (c.website as string | null) ?? null;

    return [
      {
        id: Number(row.id),
        reason: asReason(String(row.reason)),
        createdAt: String(row.created_at ?? ""),
        seenAt: (row.seen_at as string | null) ?? null,
        searchName: row.saved_search_id
          ? (searchName.get(String(row.saved_search_id)) ?? null)
          : null,
        matched: {
          id: matchedId,
          slug: String(c.slug ?? ""),
          name,
          category: String(c.category ?? ""),
          city: String(c.city ?? ""),
          country: String(c.country ?? ""),
          website,
          logoUrl: companyDisplayLogoUrl({
            logoUrl: c.logo_url as string | null,
            website,
          }),
          logoInitials: initials(name),
          verified: Boolean(c.verified),
          acceptingClients: Boolean(c.accepting_clients),
          receiveIntros: c.receive_intros !== false,
          trustLevel: trustById.get(matchedId) ?? "Member",
        },
      } satisfies RadarCompanyLead,
    ];
  });
}

/** Counts for weekly digest. Cron wiring TODO. */
export async function getRadarDigest(
  companyId: string,
): Promise<RadarDigestSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_radar_digest", {
    p_company_id: companyId,
  });

  if (error || !data) {
    console.error("get_radar_digest:", error?.message);
    return null;
  }

  const row = data as Record<string, unknown>;
  return {
    companyId: String(row.company_id ?? companyId),
    companyLeads: Number(row.company_leads ?? 0),
    projectRequests: Number(row.project_requests ?? 0),
    windowDays: Number(row.window_days ?? 7),
  };
}

export function reasonLabel(reason: RadarFeedReason): string {
  switch (reason) {
    case "became_verified":
      return "Just verified";
    case "accepting_clients":
      return "Now accepting clients";
    case "level_up":
      return "Level up";
    default:
      return "New on Linken";
  }
}

export function apiLevelToDisplay(level: ApiTrustLevelKey | null): TrustLevel | null {
  if (!level) return null;
  return toDisplayLevel(level);
}
