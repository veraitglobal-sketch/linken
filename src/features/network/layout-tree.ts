import type { NetworkEdge, NetworkNode } from "@/features/network/types";
import { clusterEllipse } from "@/features/network/layout-clusters";
import {
  clusterUnitWidth,
  ownershipIds,
  partitionSatellites,
  placeClusterFan,
  weightedMidpoint,
} from "@/features/network/layout-place";
import type {
  LayoutResult,
  NetworkCluster,
  PositionedNode,
} from "@/features/network/layout-types";

const LEVEL_GAP_Y = 170;
const SIBLING_GAP_X = 240;

/**
 * Group scope: ownership tree + per-owner partner/client clusters
 * in non-overlapping downward sectors.
 */
export function layoutTree(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): LayoutResult {
  if (nodes.length === 0) return { nodes: [], clusters: [] };

  const hub =
    nodes.find((n) => n.data.kind === "group") ??
    nodes.find((n) => n.data.kind === "company") ??
    nodes[0];
  const hubId = hub.id;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ownership = ownershipIds(hubId, edges);

  const childrenOf = new Map<string, string[]>();
  for (const e of edges) {
    if (e.type !== "member_of" && e.type !== "subsidiary") continue;
    const list = childrenOf.get(e.source) ?? [];
    list.push(e.target);
    childrenOf.set(e.source, list);
  }

  const extras = nodes.filter(
    (n) => n.id !== hubId && !ownership.has(n.id) && n.data.kind !== "group",
  );
  const { exclusive, shared } = partitionSatellites(
    extras,
    edges,
    ownership,
    hubId,
  );

  const positions = new Map<string, { x: number; y: number }>();
  positions.set(hubId, { x: 0, y: 0 });

  function subtreeWidth(id: string): number {
    const kids = (childrenOf.get(id) ?? []).filter((c) => byId.has(c));
    if (kids.length === 0) {
      return clusterUnitWidth(exclusive.get(id)?.length ?? 0, SIBLING_GAP_X);
    }
    return kids.reduce((s, c) => s + subtreeWidth(c), 0);
  }

  function place(id: string, left: number, right: number, depth: number) {
    const kids = (childrenOf.get(id) ?? []).filter((c) => byId.has(c));
    const mid = (left + right) / 2;
    if (id !== hubId) positions.set(id, { x: mid, y: depth * LEVEL_GAP_Y });
    if (kids.length === 0) return;
    let cursor = left;
    for (const child of kids) {
      const w = subtreeWidth(child);
      place(child, cursor, cursor + w, depth + 1);
      cursor += w;
    }
  }

  const roots = (childrenOf.get(hubId) ?? []).filter((c) => byId.has(c));
  const totalWidth = Math.max(
    SIBLING_GAP_X,
    roots.reduce((s, r) => s + subtreeWidth(r), 0),
  );
  place(hubId, -totalWidth / 2, totalWidth / 2, 0);

  for (const ownerId of ownership) {
    const items = exclusive.get(ownerId);
    if (!items?.length) continue;
    placeClusterFan(items, positions.get(ownerId) ?? { x: 0, y: 0 }, positions);
  }

  const membership = new Map<string, string[]>();
  for (const [oid, items] of exclusive) {
    membership.set(
      oid,
      items.map((i) => i.id),
    );
  }

  for (const { node, links } of shared) {
    const parts = links
      .map((l) => {
        const pos = positions.get(l.ownerId);
        return pos ? { pos, weight: l.weight } : null;
      })
      .filter(Boolean) as { pos: { x: number; y: number }; weight: number }[];
    positions.set(node.id, weightedMidpoint(parts));
    const maxW = Math.max(...links.map((l) => l.weight));
    const tops = links.filter((l) => l.weight === maxW);
    if (tops.length === 1) {
      const list = membership.get(tops[0].ownerId) ?? [];
      list.push(node.id);
      membership.set(tops[0].ownerId, list);
    }
  }

  const result: PositionedNode[] = [];
  for (const n of nodes) {
    const p = positions.get(n.id);
    if (p) result.push({ ...n, position: p });
  }

  const clusters: NetworkCluster[] = [];
  for (const [ownerId, nodeIds] of membership) {
    const ellipse = clusterEllipse(ownerId, nodeIds, positions);
    if (ellipse) clusters.push(ellipse);
  }

  return { nodes: result, clusters };
}
