import { MarkerType, type Edge } from "@xyflow/react";
import { pickEdgeHandles } from "@/features/network/edge-handles";
import type { NetworkEdge, NetworkNode } from "@/features/network/types";

export function toFlowEdge(
  e: NetworkEdge,
  selected: boolean,
  editable = false,
  positions?: Map<string, { x: number; y: number }>,
  nodesById?: Map<string, NetworkNode>,
): Edge {
  const isOwns = e.type === "subsidiary";
  const isCoOwner = e.type === "co_owner";
  const isOwnership = isOwns || isCoOwner;
  const isStructure = isOwns || e.type === "member_of";
  const isPartner = e.type === "partner" || e.type === "client";

  const stroke = selected
    ? "#1a5c51"
    : isOwnership
      ? "#0e1f1c"
      : "#b0b8b3";

  const handles =
    positions && nodesById
      ? pickEdgeHandles(e.source, e.target, positions, nodesById)
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
      strokeWidth: selected ? 1.75 : isOwnership ? 1.25 : 1,
      strokeDasharray: isCoOwner
        ? "6 5"
        : isPartner
          ? "3 7"
          : undefined,
      strokeLinecap: "round" as const,
      opacity: selected ? 1 : isPartner ? 0.9 : 0.95,
    },
    animated: false,
    markerEnd: isOwnership
      ? {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 8,
          height: 8,
        }
      : undefined,
  };
}
