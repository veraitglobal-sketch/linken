import { createClient } from "@/lib/supabase/server";
import { parseWidgetSettings } from "@/features/widgets/settings";

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
};

export type LogoWallPendingInvite = {
  companyId: string;
  partnershipId: string;
  name: string;
  slug: string;
  inviteEmail: string | null;
  website: string | null;
  logoUrl: string | null;
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
 * Confirmed partners + confirmed clients (with company id), deduped, max 12.
 * Sort: ongoing clients → other clients → partners by shared evidence.
 * When `applySelection` is true (public embed), respects widget_settings.logoWall.excludedCompanyIds.
 */
export async function getLogoWallEntries(
  companyId: string,
  opts?: { applySelection?: boolean },
): Promise<LogoWallEntry[]> {
  if (!companyId) return [];

  try {
    const supabase = await createClient();

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
        .select("client_company_id, ongoing")
        .eq("provider_company_id", companyId)
        .eq("status", "confirmed")
        .not("client_company_id", "is", null),
      opts?.applySelection
        ? supabase
            .from("companies")
            .select("widget_settings")
            .eq("id", companyId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
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
      const id = r.client_company_id as string;
      if (!id) continue;
      clientMeta.set(id, clientMeta.get(id) === true || Boolean(r.ongoing));
    }

    const allIds = new Set([...partnerIds, ...clientMeta.keys()]);
    allIds.delete(companyId);
    if (allIds.size === 0) return [];

    const excluded = new Set(
      opts?.applySelection
        ? parseWidgetSettings(settingsRes.data?.widget_settings).logoWall
            .excludedCompanyIds
        : [],
    );

    const { data: companies } = await supabase
      .from("companies")
      .select("id, slug, name, logo_url, website, allow_logo_in_partner_widgets")
      .in("id", [...allIds]);

    const byId = new Map((companies ?? []).map((c) => [c.id as string, c]));

    const entries: LogoWallEntry[] = [];
    for (const id of allIds) {
      if (excluded.has(id)) continue;
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

      entries.push({
        id: c.id as string,
        slug: c.slug as string,
        name: c.name as string,
        logoUrl: (c.logo_url as string | null) ?? null,
        website: (c.website as string | null) ?? null,
        initials: initials(c.name as string),
        showLogo: c.allow_logo_in_partner_widgets !== false,
        kind,
        ongoing,
        evidenceScore,
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

    return entries.slice(0, 24);
  } catch {
    return [];
  }
}

/** All confirmed candidates for the configurator (ignores exclusion list). */
export async function getLogoWallConfirmedCandidates(
  companyId: string,
): Promise<LogoWallEntry[]> {
  return getLogoWallEntries(companyId, { applySelection: false });
}

/**
 * Pending partnership invites created by this firm — owner-only UI.
 * Never shown in the public Logo wall embed.
 */
export async function getLogoWallPendingInvites(
  companyId: string,
): Promise<LogoWallPendingInvite[]> {
  if (!companyId) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("partnerships")
      .select(
        `
        id,
        recipient:companies!recipient_id(
          id, slug, name, website, logo_url, claimed
        )
      `,
      )
      .eq("requester_id", companyId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const out: LogoWallPendingInvite[] = [];
    for (const row of data ?? []) {
      const raw = row.recipient;
      const c = Array.isArray(raw) ? raw[0] : raw;
      if (!c) continue;
      out.push({
        companyId: c.id as string,
        partnershipId: row.id as string,
        name: c.name as string,
        slug: c.slug as string,
        inviteEmail: null,
        website: (c.website as string | null) ?? null,
        logoUrl: (c.logo_url as string | null) ?? null,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export type LogoWallLabel = "none" | "partners" | "clients" | "both";

export function parseLogoWallLabel(raw: string | undefined): LogoWallLabel {
  if (
    raw === "none" ||
    raw === "partners" ||
    raw === "clients" ||
    raw === "both"
  ) {
    return raw;
  }
  return "both";
}

export function logoWallLabelText(label: LogoWallLabel): string | null {
  switch (label) {
    case "none":
      return null;
    case "partners":
      return "Our verified partners";
    case "clients":
      return "Trusted by";
    case "both":
    default:
      return "Verified partners & clients";
  }
}
