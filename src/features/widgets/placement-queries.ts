import {
  classifyEmbedPlacement,
  stripWww,
  type PlacementKind,
} from "@/features/widgets/placement";
import { createClient } from "@/lib/supabase/server";

/** Host with no render in this many days → stale warning. */
export const PLACEMENT_STALE_DAYS = 14;

export type WidgetPlacementHost = {
  host: string;
  kind: Extract<PlacementKind, "owned" | "foreign">;
  variants: string[];
  renderCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  stale: boolean;
};

export type WidgetPlacementsSummary = {
  hosts: WidgetPlacementHost[];
  foreignCount: number;
  staleCount: number;
  ownedCount: number;
};

function isStale(lastSeenAt: string, now: number): boolean {
  const t = Date.parse(lastSeenAt);
  if (Number.isNaN(t)) return false;
  return now - t > PLACEMENT_STALE_DAYS * 24 * 60 * 60 * 1000;
}

/** Aggregate placement rows by host; classify owned vs foreign from website. */
export async function getWidgetPlacements(
  companyId: string,
  companyWebsite: string | null | undefined,
): Promise<WidgetPlacementsSummary> {
  const empty: WidgetPlacementsSummary = {
    hosts: [],
    foreignCount: 0,
    staleCount: 0,
    ownedCount: 0,
  };
  if (!companyId) return empty;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("widget_placements")
      .select("host, variant, first_seen_at, last_seen_at, render_count")
      .eq("company_id", companyId)
      .order("last_seen_at", { ascending: false });

    if (error || !data?.length) return empty;

    const now = Date.now();
    const byHost = new Map<
      string,
      {
        host: string;
        variants: Set<string>;
        renderCount: number;
        firstSeenAt: string;
        lastSeenAt: string;
      }
    >();

    for (const row of data) {
      const host = stripWww(String(row.host ?? ""));
      if (!host) continue;
      const prev = byHost.get(host);
      const first = String(row.first_seen_at ?? "");
      const last = String(row.last_seen_at ?? "");
      const count = Number(row.render_count ?? 0);
      const variant = String(row.variant ?? "").trim();
      if (!prev) {
        byHost.set(host, {
          host,
          variants: new Set(variant ? [variant] : []),
          renderCount: count,
          firstSeenAt: first,
          lastSeenAt: last,
        });
        continue;
      }
      if (variant) prev.variants.add(variant);
      prev.renderCount += count;
      if (first && (!prev.firstSeenAt || first < prev.firstSeenAt)) {
        prev.firstSeenAt = first;
      }
      if (last && (!prev.lastSeenAt || last > prev.lastSeenAt)) {
        prev.lastSeenAt = last;
      }
    }

    const hosts: WidgetPlacementHost[] = [];
    for (const row of byHost.values()) {
      const classified = classifyEmbedPlacement(
        `https://${row.host}/`,
        companyWebsite,
      );
      const kind =
        classified.kind === "owned" || classified.kind === "foreign"
          ? classified.kind
          : "foreign";
      hosts.push({
        host: row.host,
        kind,
        variants: [...row.variants].sort(),
        renderCount: row.renderCount,
        firstSeenAt: row.firstSeenAt,
        lastSeenAt: row.lastSeenAt,
        stale: isStale(row.lastSeenAt, now),
      });
    }

    hosts.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "foreign" ? -1 : 1;
      return b.lastSeenAt.localeCompare(a.lastSeenAt);
    });

    return {
      hosts,
      foreignCount: hosts.filter((h) => h.kind === "foreign").length,
      staleCount: hosts.filter((h) => h.stale).length,
      ownedCount: hosts.filter((h) => h.kind === "owned").length,
    };
  } catch {
    return empty;
  }
}
