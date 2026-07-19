import type { NetworkEdge, NetworkNode } from "@/features/network/types";

export type PositionedNode = NetworkNode & {
  position: { x: number; y: number };
};

const LEVEL_GAP_Y = 160;
const SIBLING_GAP_X = 220;

/**
 * Layered tree for group scope: hub on top, ownership levels below.
 * Width distributed by leaf count. No external layout library.
 */
export function layoutTree(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): PositionedNode[] {
  if (nodes.length === 0) return [];

  const hub =
    nodes.find((n) => n.data.kind === "group") ??
    nodes.find((n) => n.data.kind === "company") ??
    nodes[0];

  const hubId = hub.id;
  const structure = edges.filter(
    (e) => e.type === "member_of" || e.type === "subsidiary",
  );
  const childrenOf = new Map<string, string[]>();

  for (const e of structure) {
    const list = childrenOf.get(e.source) ?? [];
    list.push(e.target);
    childrenOf.set(e.source, list);
  }

  const memberIds = new Set(
    structure.flatMap((e) => [e.source, e.target]).filter((id) => id !== hubId),
  );

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const positions = new Map<string, { x: number; y: number }>();
  positions.set(hubId, { x: 0, y: 0 });

  function leafCount(id: string): number {
    const kids = (childrenOf.get(id) ?? []).filter((c) => byId.has(c));
    if (kids.length === 0) return 1;
    return kids.reduce((sum, c) => sum + leafCount(c), 0);
  }

  function place(id: string, left: number, right: number, depth: number) {
    const kids = (childrenOf.get(id) ?? []).filter((c) => byId.has(c));
    const mid = (left + right) / 2;
    if (id !== hubId) {
      positions.set(id, { x: mid, y: depth * LEVEL_GAP_Y });
    }
    if (kids.length === 0) return;

    let cursor = left;
    for (const child of kids) {
      const w = leafCount(child) * SIBLING_GAP_X;
      place(child, cursor, cursor + w, depth + 1);
      cursor += w;
    }
  }

  const roots = (childrenOf.get(hubId) ?? []).filter((c) => byId.has(c));
  const totalWidth = Math.max(
    SIBLING_GAP_X,
    roots.reduce((s, r) => s + leafCount(r) * SIBLING_GAP_X, 0),
  );
  place(hubId, -totalWidth / 2, totalWidth / 2, 0);

  // Partners / clients / externals: orbit near their company
  const extras = nodes.filter(
    (n) => n.id !== hubId && !memberIds.has(n.id) && !positions.has(n.id),
  );

  const result: PositionedNode[] = [];
  for (const n of nodes) {
    if (positions.has(n.id)) {
      result.push({ ...n, position: positions.get(n.id)! });
    }
  }

  let extraI = 0;
  for (const n of extras) {
    const link = edges.find(
      (e) =>
        (e.type === "partner" || e.type === "client") &&
        (e.source === n.id || e.target === n.id),
    );
    const anchorId = link
      ? link.source === n.id
        ? link.target
        : link.source
      : hubId;
    const anchor = positions.get(anchorId) ?? { x: 0, y: 0 };
    const angle = (extraI / Math.max(extras.length, 1)) * Math.PI * 2;
    result.push({
      ...n,
      position: {
        x: anchor.x + Math.cos(angle) * 140,
        y: anchor.y + Math.sin(angle) * 90 + 40,
      },
    });
    extraI += 1;
  }

  return result;
}

/**
 * Deterministic radial layout — company scope (hub center).
 */
export function layoutRadial(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): PositionedNode[] {
  if (nodes.length === 0) return [];

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

  const ring1: NetworkNode[] = [];
  const ring2: NetworkNode[] = [];

  for (const n of nodes) {
    if (n.id === hubId) continue;
    if (
      memberIds.has(n.id) ||
      n.data.kind === "company" ||
      n.data.kind === "subsidiary"
    ) {
      ring1.push(n);
    } else {
      ring2.push(n);
    }
  }

  const result: PositionedNode[] = [{ ...hub, position: { x: 0, y: 0 } }];
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
