import type { NetworkEdge, NetworkNode } from "@/features/network/types";

export type PositionedNode = NetworkNode & {
  position: { x: number; y: number };
};

/**
 * Deterministic radial layout — hub center, members ring 1, others ring 2.
 * Slight seeded jitter so edges do not perfectly overlap.
 */
export function layoutRadial(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): PositionedNode[] {
  if (nodes.length === 0) return [];

  const hub =
    nodes.find((n) => n.data.kind === "group") ??
    nodes.find((n) => n.data.kind === "company") ??
    nodes[0];

  const hubId = hub.id;
  const memberIds = new Set(
    edges
      .filter((e) => e.type === "member_of")
      .flatMap((e) => [e.source, e.target])
      .filter((id) => id !== hubId),
  );

  const ring1: NetworkNode[] = [];
  const ring2: NetworkNode[] = [];

  for (const n of nodes) {
    if (n.id === hubId) continue;
    if (memberIds.has(n.id) || n.data.kind === "company") {
      // For company-scope graphs, partners/clients are ring1 (no members)
      if (hub.data.kind === "group" && memberIds.has(n.id)) {
        ring1.push(n);
      } else if (hub.data.kind === "company") {
        ring1.push(n);
      } else {
        ring2.push(n);
      }
    } else {
      ring2.push(n);
    }
  }

  // If group hub: members in ring1, rest in ring2 (reclassify)
  if (hub.data.kind === "group") {
    ring1.length = 0;
    ring2.length = 0;
    for (const n of nodes) {
      if (n.id === hubId) continue;
      if (memberIds.has(n.id)) ring1.push(n);
      else ring2.push(n);
    }
  }

  const result: PositionedNode[] = [
    { ...hub, position: { x: 0, y: 0 } },
  ];

  placeRing(ring1, 280, result);
  placeRing(ring2, 480, result);

  return result;
}

function placeRing(
  items: NetworkNode[],
  radius: number,
  out: PositionedNode[],
) {
  const n = items.length;
  if (n === 0) return;
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const jitter = seededJitter(items[i].id);
    out.push({
      ...items[i],
      position: {
        x: Math.cos(angle) * radius + jitter.x,
        y: Math.sin(angle) * radius + jitter.y,
      },
    });
  }
}

function seededJitter(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = ((h % 17) - 8) * 3;
  const b = (((h >> 4) % 17) - 8) * 3;
  return { x: a, y: b };
}
