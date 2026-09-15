import { getBezierPath, type EdgeProps } from "@xyflow/react";
import type { NetworkEdge } from "@/features/network/types";

/** Soft curves between handle dots, like a flow builder. */
export function buildEdgePath(
  props: Pick<
    EdgeProps,
    | "sourceX"
    | "sourceY"
    | "targetX"
    | "targetY"
    | "sourcePosition"
    | "targetPosition"
  >,
  _edgeType?: NetworkEdge["type"],
): [string, number, number] {
  const [path, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    curvature: 0.35,
  });
  return [path, labelX, labelY];
}
