import type { NetworkGraph } from "@/features/network/types";

export type StoredPosition = { x: number; y: number };

const PREFIX = "linken:graph-layout:v3:";

export function graphLayoutKey(graph: NetworkGraph): string {
  const ctx = graph.context;
  if (ctx?.groupSlug) return `${PREFIX}group:${ctx.groupSlug}`;
  if (ctx?.viewerCompanyId) return `${PREFIX}company:${ctx.viewerCompanyId}`;

  const hub =
    graph.nodes.find((n) => n.data.kind === "group") ??
    graph.nodes.find((n) => n.data.kind === "company");
  return `${PREFIX}${hub?.id ?? "default"}`;
}

export function loadGraphPositions(
  key: string,
): Record<string, StoredPosition> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StoredPosition>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveGraphPositions(
  key: string,
  positions: Record<string, StoredPosition>,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(positions));
  } catch {
    // quota / private mode — ignore
  }
}

export function clearGraphPositions(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function positionsFromNodes(
  nodes: { id: string; position: StoredPosition }[],
): Record<string, StoredPosition> {
  const out: Record<string, StoredPosition> = {};
  for (const n of nodes) {
    out[n.id] = { x: n.position.x, y: n.position.y };
  }
  return out;
}
