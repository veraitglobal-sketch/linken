import type { NetworkEdge, NetworkNode } from "@/features/network/types";
import { clusterEllipse } from "@/features/network/layout-clusters";
import { placeFan } from "@/features/network/layout-place";
import type {
  LayoutResult,
  NetworkCluster,
  PositionedNode,
} from "@/features/network/layout-types";

/**
 * Hub at origin, structure + partners on the right-side fan.
 * Single-owner case — positions identical to the prior radial layout.
 */
export function layoutRadial(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): LayoutResult {
  if (nodes.length === 0) return { nodes: [], clusters: [] };

  const hub =
    nodes.find((n) => n.data.kind === "company") ??
    nodes.find((n) => n.data.kind === "group") ??
    nodes[0];

  const hubId = hub.id;
  const memberIds = new Set(
    edges
      .filter((e) => e.type === "member_of" || e.type === "subsidiary")
      .flatMap((e) => [e.source, e.target])
      .filter((id) => id !== hubId),
  );

  const structure: NetworkNode[] = [];
  const partners: NetworkNode[] = [];

  for (const n of nodes) {
    if (n.id === hubId) continue;
    if (
      memberIds.has(n.id) ||
      n.data.kind === "company" ||
      n.data.kind === "subsidiary"
    ) {
      structure.push(n);
    } else {
      partners.push(n);
    }
  }

  const result: PositionedNode[] = [{ ...hub, position: { x: 0, y: 0 } }];
  placeFan(structure, 300, result);
  placeFan(partners, structure.length ? 480 : 340, result, 0.12);

  const posMap = new Map(result.map((n) => [n.id, n.position]));
  const clusters: NetworkCluster[] = [];
  const partnerIds = partners.map((p) => p.id);
  const ellipse = clusterEllipse(hubId, partnerIds, posMap);
  if (ellipse) clusters.push(ellipse);

  return { nodes: result, clusters };
}
