import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  applyLogoWallOrder,
  displayLogoForWall,
  resolveLogoWallState,
  type LogoWallLogoState,
} from "@/features/widgets/logo-wall-resolve";
import { parseWidgetSettings } from "@/features/widgets/settings";

export type { LogoWallLogoState } from "@/features/widgets/logo-wall-resolve";
export type {
  LogoWallLabel,
  LogoWallPendingInvite,
} from "@/features/widgets/logo-wall-pending";
export {
  getLogoWallPendingInvites,
  logoWallLabelText,
  parseLogoWallLabel,
} from "@/features/widgets/logo-wall-pending";

export type LogoWallEntry = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  initials: string;
  showLogo: boolean;
  kind: "client" | "partner";
  ongoing: boolean;
  evidenceScore: number;
  logoSource: string | null;
  logoState: LogoWallLogoState;
  scale: number;
  padding: number;
  grayscale: boolean;
  invertOnDark: boolean;
  included: boolean;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Confirmed partners + confirmed clients (with company id), deduped, max 30.
 * Sort: ongoing clients → other clients → partners by shared evidence.
 * When `applySelection` is true (public embed), respects excludedCompanyIds.
 * Entries missing from `order` render after ordered ones (evidence sort kept).
 */
export async function getLogoWallEntries(
  companyId: string,
  opts?: { applySelection?: boolean; client?: SupabaseClient },
): Promise<LogoWallEntry[]> {
  if (!companyId) return [];

  try {
    const supabase = opts?.client ?? (await createClient());

    const [asReq, asRec, refs, settingsRes] = await Promise.all([
      supabase
        .from("partnerships")
        .select("recipient_id")
        .eq("status", "accepted")
        .eq("requester_id", companyId),
      supabase
        .from("partnerships")
        .select("requester_id")
        .eq("status", "accepted")
        .eq("recipient_id", companyId),
      supabase
        .from("service_references")
        .select("client_company_id, ongoing, disclosure")
        .eq("provider_company_id", companyId)
        .eq("status", "confirmed")
        .not("client_company_id", "is", null),
      supabase
        .from("companies")
        .select("widget_settings")
        .eq("id", companyId)
        .maybeSingle(),
    ]);

    const partnerIds = new Set<string>();
    for (const r of asReq.data ?? []) {
      if (r.recipient_id) partnerIds.add(r.recipient_id as string);
    }
    for (const r of asRec.data ?? []) {
      if (r.requester_id) partnerIds.add(r.requester_id as string);
    }

    const clientMeta = new Map<string, boolean>();
    for (const r of refs.data ?? []) {
      if ((r.disclosure as string | null) === "undisclosed") continue;
      const id = r.client_company_id as string;
      if (!id) continue;
      clientMeta.set(id, clientMeta.get(id) === true || Boolean(r.ongoing));
    }

    const allIds = new Set([...partnerIds, ...clientMeta.keys()]);
    allIds.delete(companyId);
    if (allIds.size === 0) return [];

    const settings = parseWidgetSettings(settingsRes.data?.widget_settings);
    const excluded = new Set(settings.logoWall.excludedCompanyIds);
    const overrides = settings.logoWall.overrides;

    const { data: companies } = await supabase
      .from("companies")
      .select(
        "id, slug, name, logo_url, website, allow_logo_in_partner_widgets, logo_source",
      )
      .in("id", [...allIds]);

    const byId = new Map((companies ?? []).map((c) => [c.id as string, c]));
    const entries: LogoWallEntry[] = [];

    for (const id of allIds) {
      const c = byId.get(id);
      if (!c) continue;
      const isClient = clientMeta.has(id);
      const ongoing = clientMeta.get(id) === true;
      const isPartner = partnerIds.has(id);
      const kind: "client" | "partner" = isClient ? "client" : "partner";
      let evidenceScore = 0;
      if (isPartner) evidenceScore += 1;
      if (isClient) evidenceScore += 2;
      if (ongoing) evidenceScore += 2;

      const showLogo = c.allow_logo_in_partner_widgets !== false;
      const override = overrides[id] ?? null;
      const profileLogo = (c.logo_url as string | null) ?? null;
      const display = displayLogoForWall({
        showLogo,
        profileLogoUrl: profileLogo,
        override,
      });
      const logoSource = (c.logo_source as string | null) ?? null;

      entries.push({
        id: c.id as string,
        slug: c.slug as string,
        name: c.name as string,
        logoUrl: display.logoUrl,
        website: (c.website as string | null) ?? null,
        initials: initials(c.name as string),
        showLogo,
        kind,
        ongoing,
        evidenceScore,
        logoSource,
        logoState: resolveLogoWallState({
          showLogo,
          overrideLogoUrl: override?.logoUrl,
          logoUrl: profileLogo,
          logoSource,
        }),
        scale: display.scale,
        padding: display.padding,
        grayscale: display.grayscale,
        invertOnDark: display.invertOnDark,
        included: !excluded.has(id),
      });
    }

    entries.sort((a, b) => {
      const rank = (e: LogoWallEntry) => {
        if (e.kind === "client" && e.ongoing) return 0;
        if (e.kind === "client") return 1;
        return 2;
      };
      const dr = rank(a) - rank(b);
      if (dr !== 0) return dr;
      if (b.evidenceScore !== a.evidenceScore) {
        return b.evidenceScore - a.evidenceScore;
      }
      return a.name.localeCompare(b.name);
    });

    const ordered = applyLogoWallOrder(entries, settings.logoWall.order);
    const filtered = opts?.applySelection
      ? ordered.filter((e) => e.included)
      : ordered;

    return filtered.slice(0, 30);
  } catch {
    return [];
  }
}

/** All confirmed candidates for the studio (ignores exclusion list). */
export async function getLogoWallConfirmedCandidates(
  companyId: string,
  client?: SupabaseClient,
): Promise<LogoWallEntry[]> {
  return getLogoWallEntries(companyId, { applySelection: false, client });
}
