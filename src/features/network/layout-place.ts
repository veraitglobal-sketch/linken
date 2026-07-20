import type { NetworkEdge, NetworkNode } from "@/features/network/types";
import type { PositionedNode } from "@/features/network/layout-types";

/** Right-side fan (~150°). Company-scope partner ring — keep identical. */
export function placeFan(
  items: NetworkNode[],
  radius: number,
  out: PositionedNode[],
  phase = 0,
) {
  const n = items.length;
  if (n === 0) return;

  const span = Math.PI * 0.85;
  const start = -span / 2 + phase;

  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = start + t * span;
    out.push({
      ...items[i],
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.92,
      },
    });
  }
}

const PREFERRED_STEP = 0.42;
const MAX_SPAN = Math.PI * 0.75;
const MIN_RADIUS = 150;
/** Min center-to-center gap inside a cluster (node width ~132). */
const MIN_CHORD = 155;
/** Extra empty margin between sibling cluster extents. */
const CLUSTER_MARGIN = 120;

function clusterArc(n: number) {
  if (n <= 1) return { span: 0, radius: MIN_RADIUS, step: 0 };
  const span = Math.min(MAX_SPAN, (n - 1) * PREFERRED_STEP);
  const step = span / (n - 1);
  const radius = Math.max(
    MIN_RADIUS,
    MIN_CHORD / (2 * Math.sin(step / 2)),
  );
  return { span, radius, step };
}

/**
 * Place satellites in a local angular sector around an owner.
 * Chord length stays ≥ MIN_CHORD; sibling clusters stay farther apart via width.
 */
export function placeClusterFan(
  items: NetworkNode[],
  origin: { x: number; y: number },
  positions: Map<string, { x: number; y: number }>,
  centerAngle = Math.PI / 2,
) {
  const n = items.length;
  if (n === 0) return;

  const { span, radius } = clusterArc(n);
  const start = centerAngle - span / 2;

  for (let i = 0; i < n; i++) {
    const angle = n === 1 ? centerAngle : start + (i / (n - 1)) * span;
    positions.set(items[i].id, {
      x: origin.x + Math.cos(angle) * radius,
      y: origin.y + Math.sin(angle) * radius * 0.82,
    });
  }
}

/** Horizontal width reserved for an owner's exclusive cluster. */
export function clusterUnitWidth(satelliteCount: number, baseGap: number) {
  if (satelliteCount <= 1) return baseGap;
  const { span, radius } = clusterArc(satelliteCount);
  const half = radius * Math.sin(span / 2) + 70;
  return Math.max(baseGap, half * 2 + CLUSTER_MARGIN);
}

export function ownershipIds(
  hubId: string,
  edges: NetworkEdge[],
): Set<string> {
  const ids = new Set<string>([hubId]);
  for (const e of edges) {
    if (e.type !== "member_of" && e.type !== "subsidiary") continue;
    ids.add(e.source);
    ids.add(e.target);
  }
  return ids;
}

/** Owners linked to a satellite, weighted by edge count (proxy for evidence). */
export function linkOwners(
  nodeId: string,
  edges: NetworkEdge[],
  ownership: Set<string>,
): { ownerId: string; weight: number }[] {
  const weights = new Map<string, number>();
  for (const e of edges) {
    if (e.type !== "partner" && e.type !== "client") continue;
    const other =
      e.source === nodeId
        ? e.target
        : e.target === nodeId
          ? e.source
          : null;
    if (!other || !ownership.has(other)) continue;
    weights.set(other, (weights.get(other) ?? 0) + 1);
  }
  return [...weights.entries()].map(([ownerId, weight]) => ({
    ownerId,
    weight,
  }));
}

export function weightedMidpoint(
  parts: { pos: { x: number; y: number }; weight: number }[],
): { x: number; y: number } {
  let wSum = 0;
  let x = 0;
  let y = 0;
  for (const p of parts) {
    wSum += p.weight;
    x += p.pos.x * p.weight;
    y += p.pos.y * p.weight;
  }
  if (wSum <= 0) return { x: 0, y: 0 };
  return { x: x / wSum, y: y / wSum + 36 };
}

export type SatellitePartition = {
  exclusive: Map<string, NetworkNode[]>;
  shared: {
    node: NetworkNode;
    links: { ownerId: string; weight: number }[];
  }[];
};

/** Split partner/client nodes into per-owner exclusive vs multi-owner shared. */
export function partitionSatellites(
  extras: NetworkNode[],
  edges: NetworkEdge[],
  ownership: Set<string>,
  fallbackOwnerId: string,
): SatellitePartition {
  const exclusive = new Map<string, NetworkNode[]>();
  const shared: SatellitePartition["shared"] = [];
  for (const n of extras) {
    const links = linkOwners(n.id, edges, ownership);
    if (links.length > 1) {
      shared.push({ node: n, links });
      continue;
    }
    const oid = links[0]?.ownerId ?? fallbackOwnerId;
    const list = exclusive.get(oid) ?? [];
    list.push(n);
    exclusive.set(oid, list);
  }
  return { exclusive, shared };
}
