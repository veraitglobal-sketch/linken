import type { NetworkEdge, NetworkNode } from "@/features/network/types";
import type { LayoutResult, PositionedNode } from "@/features/network/layout-types";

/** Card size — kept in step with `network-company-node.tsx`. */
export const ORG_CARD_W = 196;
export const ORG_CARD_H = 72;
/** The map's own company is drawn as a pill, like a flow's starting point. */
export const ORG_HUB_W = 210;
export const ORG_HUB_H = 44;

export type OrgDirection = "vertical" | "horizontal";

const ORDER: Record<string, number> = {
  group: 0,
  company: 0,
  subsidiary: 1,
  partner: 2,
  client: 3,
};

/**
 * Company scope as a flow: the company first, everyone it is linked to after
 * it, ordered structure → partners → clients.
 * Vertical: rows beneath the company. Horizontal: columns to its right.
 */
export function layoutOrg(
  nodes: NetworkNode[],
  _edges: NetworkEdge[],
  direction: OrgDirection = "vertical",
): LayoutResult {
  if (nodes.length === 0) return { nodes: [], clusters: [] };

  const hub =
    nodes.find((n) => n.data.kind === "company") ??
    nodes.find((n) => n.data.kind === "group") ??
    nodes[0];

  const children = nodes
    .filter((n) => n.id !== hub.id)
    .sort(
      (a, b) =>
        (ORDER[a.data.kind] ?? 9) - (ORDER[b.data.kind] ?? 9) ||
        a.data.name.localeCompare(b.data.name),
    );

  const out: PositionedNode[] = [];

  if (direction === "vertical") {
    const perRow = 4;
    const stepX = ORG_CARD_W + 64;
    const stepY = 150;
    out.push({ ...hub, position: { x: -ORG_HUB_W / 2, y: 0 } });
    for (let i = 0; i < children.length; i += perRow) {
      const row = children.slice(i, i + perRow);
      const r = i / perRow;
      const width = (row.length - 1) * stepX;
      row.forEach((n, j) => {
        const cx = -width / 2 + j * stepX + (r % 2 ? stepX / 2 : 0);
        out.push({ ...n, position: { x: cx - ORG_CARD_W / 2, y: 130 + r * stepY } });
      });
    }
  } else {
    const perCol = 5;
    const stepY = ORG_CARD_H + 40;
    const stepX = ORG_CARD_W + 110;
    out.push({ ...hub, position: { x: 0, y: -ORG_HUB_H / 2 } });
    for (let i = 0; i < children.length; i += perCol) {
      const col = children.slice(i, i + perCol);
      const c = i / perCol;
      const height = (col.length - 1) * stepY;
      col.forEach((n, j) => {
        const cy = -height / 2 + j * stepY + (c % 2 ? stepY / 2 : 0);
        out.push({
          ...n,
          position: { x: ORG_HUB_W + 150 + c * stepX, y: cy - ORG_CARD_H / 2 },
        });
      });
    }
  }

  return { nodes: out, clusters: [] };
}
