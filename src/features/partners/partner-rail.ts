export type PartnerRailSettings = {
  /** Partner company ids in display order (missing ids fall to default sort). */
  sortIds: string[];
  /** How many partners show in the profile rail before “show all”. */
  limit: number;
};

const DEFAULT_LIMIT = 12;
const MIN_LIMIT = 3;
const MAX_LIMIT = 40;

export function parsePartnerRail(raw: unknown): PartnerRailSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { sortIds: [], limit: DEFAULT_LIMIT };
  }
  const obj = raw as Record<string, unknown>;
  const sortIds = Array.isArray(obj.sortIds)
    ? obj.sortIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  const n = Number(obj.limit);
  const limit =
    Number.isFinite(n) && n >= MIN_LIMIT && n <= MAX_LIMIT
      ? Math.floor(n)
      : DEFAULT_LIMIT;
  return { sortIds, limit };
}

export function clampPartnerRailLimit(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(n)));
}

export const PARTNER_RAIL_DEFAULT_LIMIT = DEFAULT_LIMIT;
export const PARTNER_RAIL_LIMIT_OPTIONS = [6, 12, 18, 24, 40] as const;

/** Apply owner sort, then keep remaining by default ranking. */
export function applyPartnerSort<T extends { id: string }>(
  partners: T[],
  sortIds: string[],
): T[] {
  if (sortIds.length === 0) return partners;
  const byId = new Map(partners.map((p) => [p.id, p]));
  const out: T[] = [];
  const seen = new Set<string>();
  for (const id of sortIds) {
    const p = byId.get(id);
    if (!p || seen.has(id)) continue;
    out.push(p);
    seen.add(id);
  }
  for (const p of partners) {
    if (seen.has(p.id)) continue;
    out.push(p);
  }
  return out;
}
