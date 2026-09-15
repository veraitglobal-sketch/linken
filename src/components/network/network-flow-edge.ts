import { MarkerType, type Edge } from "@xyflow/react";
import { pickEdgeHandles } from "@/features/network/edge-handles";
import type { NetworkEdge, NetworkNode } from "@/features/network/types";

export function toFlowEdge(
  e: NetworkEdge,
  selected: boolean,
  editable = false,
  positions?: Map<string, { x: number; y: number }>,
  nodesById?: Map<string, NetworkNode>,
  routing?: { direction?: "vertical" | "horizontal"; hubId?: string | null },
): Edge {
  const isOwns = e.type === "subsidiary";
  const isCoOwner = e.type === "co_owner";
  const isOwnership = isOwns || isCoOwner;
  const isStructure = isOwns || e.type === "member_of";

  // Quiet grey lines like an org chart; the selected company's links turn ink.
  const stroke = selected ? "var(--navy)" : isOwnership ? "#9aa59f" : "#cdd3cf";

  const handles =
    positions && nodesById
      ? pickEdgeHandles(e.source, e.target, positions, nodesById, routing)
      : {};

  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: "network",
    data: e,
    selectable: true,
    focusable: true,
    deletable: Boolean(e.detachable) && editable,
    reconnectable: isStructure,
    interactionWidth: 24,
    ...handles,
    style: {
      stroke,
      strokeWidth: selected ? 1.75 : 1.25,
      // Confirmed partnerships are solid; a client link and proposed shared
      // ownership are dashed so the kinds read apart without colour.
      strokeDasharray: isCoOwner ? "6 5" : e.type === "client" ? "5 5" : undefined,
      strokeLinecap: "round" as const,
      opacity: 1,
    },
    animated: false,
    markerEnd: isOwnership
      ? {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 7,
          height: 7,
        }
      : undefined,
  };
}
