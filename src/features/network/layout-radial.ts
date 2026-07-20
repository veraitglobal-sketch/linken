import type { NetworkEdge, NetworkNode } from "@/features/network/types";
import { clusterEllipse } from "@/features/network/layout-clusters";
import { placeColumn } from "@/features/network/layout-place";
import type {
  LayoutResult,
  NetworkCluster,
  PositionedNode,
} from "@/features/network/layout-types";

const COL_STRUCTURE = 240;
const COL_PARTNERS = 460;
const ROW_GAP = 88;

/**
 * Hub left, structure + partners in even vertical lanes to the right.
 * Reads as one composed graph — not a scattered fan.
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
  placeColumn(structure, COL_STRUCTURE, result, ROW_GAP);
  placeColumn(
    partners,
    structure.length ? COL_PARTNERS : COL_STRUCTURE,
    result,
    ROW_GAP,
  );

  const posMap = new Map(result.map((n) => [n.id, n.position]));
  const clusters: NetworkCluster[] = [];
  const partnerIds = partners.map((p) => p.id);
  const ellipse = clusterEllipse(hubId, partnerIds, posMap);
  if (ellipse) clusters.push(ellipse);

  return { nodes: result, clusters };
}
