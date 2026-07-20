import type { NetworkCluster } from "@/features/network/layout-types";

const NODE_W = 132;
const NODE_H = 96;
const PAD = 28;

/** Ellipse around ≥2 satellites. Returns null for single-entity clusters. */
export function clusterEllipse(
  ownerId: string,
  nodeIds: string[],
  positions: Map<string, { x: number; y: number }>,
): NetworkCluster | null {
  if (nodeIds.length < 2) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const id of nodeIds) {
    const p = positions.get(id);
    if (!p) continue;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + NODE_W);
    maxY = Math.max(maxY, p.y + NODE_H);
  }

  if (!Number.isFinite(minX)) return null;

  return {
    ownerId,
    nodeIds,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    rx: (maxX - minX) / 2 + PAD,
    ry: (maxY - minY) / 2 + PAD,
  };
}

/** Rebuild ellipses after drag using stored membership. */
export function ellipsesFromMembership(
  membership: { ownerId: string; nodeIds: string[] }[],
  positions: Map<string, { x: number; y: number }>,
): NetworkCluster[] {
  const out: NetworkCluster[] = [];
  for (const m of membership) {
    const ellipse = clusterEllipse(m.ownerId, m.nodeIds, positions);
    if (ellipse) out.push(ellipse);
  }
  return out;
}
