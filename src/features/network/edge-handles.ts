import type { NetworkNode } from "@/features/network/types";

/** Approximate node centre for handle routing (top-left position → centre). */
function nodeCentre(
  id: string,
  pos: { x: number; y: number },
  nodes: Map<string, NetworkNode>,
) {
  const kind = nodes.get(id)?.data.kind;
  const partner = kind === "partner" || kind === "client";
  const w = partner ? 48 : kind === "group" ? 152 : 148;
  const h = partner ? 48 : 52;
  return { x: pos.x + w / 2, y: pos.y + h / 2 };
}

/** Pick side handles so smoothstep lines exit toward the other node. */
export function pickEdgeHandles(
  sourceId: string,
  targetId: string,
  positions: Map<string, { x: number; y: number }>,
  nodes: Map<string, NetworkNode>,
) {
  const sp = positions.get(sourceId);
  const tp = positions.get(targetId);
  if (!sp || !tp) return {};

  const s = nodeCentre(sourceId, sp, nodes);
  const t = nodeCentre(targetId, tp, nodes);
  const dx = t.x - s.x;
  const dy = t.y - s.y;

  if (Math.abs(dy) > Math.abs(dx) * 0.85) {
    return dy > 0
      ? { sourceHandle: "bottom-s", targetHandle: "top-t" }
      : { sourceHandle: "top-s", targetHandle: "bottom-t" };
  }

  return dx > 0
    ? { sourceHandle: "right-s", targetHandle: "left-t" }
    : { sourceHandle: "left-s", targetHandle: "right-t" };
}
