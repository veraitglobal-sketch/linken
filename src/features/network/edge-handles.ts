import type { NetworkNode } from "@/features/network/types";

/** Approximate node centre for handle routing (top-left position → centre). */
function nodeCentre(
  id: string,
  pos: { x: number; y: number },
  nodes: Map<string, NetworkNode>,
  hubId?: string | null,
) {
  const hub = id === hubId;
  const w = hub ? 210 : 196;
  const h = hub ? 44 : 72;
  void nodes;
  return { x: pos.x + w / 2, y: pos.y + h / 2 };
}

/** Pick side handles so lines leave toward the other node. */
export function pickEdgeHandles(
  sourceId: string,
  targetId: string,
  positions: Map<string, { x: number; y: number }>,
  nodes: Map<string, NetworkNode>,
  opts?: { direction?: "vertical" | "horizontal"; hubId?: string | null },
) {
  const sp = positions.get(sourceId);
  const tp = positions.get(targetId);
  if (!sp || !tp) return {};

  const s = nodeCentre(sourceId, sp, nodes, opts?.hubId);
  const t = nodeCentre(targetId, tp, nodes, opts?.hubId);
  const dx = t.x - s.x;
  const dy = t.y - s.y;

  const vertical =
    opts?.direction === "vertical"
      ? Math.abs(dy) > 40
      : opts?.direction === "horizontal"
        ? Math.abs(dx) < 40
        : Math.abs(dy) > Math.abs(dx) * 0.85;

  if (vertical) {
    return dy > 0
      ? { sourceHandle: "bottom-s", targetHandle: "top-t" }
      : { sourceHandle: "top-s", targetHandle: "bottom-t" };
  }

  return dx > 0
    ? { sourceHandle: "right-s", targetHandle: "left-t" }
    : { sourceHandle: "left-s", targetHandle: "right-t" };
}
