import {
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { NetworkEdge } from "@/features/network/types";

/** Structure = orthogonal. Partner/client = soft bezier. */
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
  edgeType?: NetworkEdge["type"],
) {
  const base = {
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  };

  const structure =
    edgeType === "subsidiary" ||
    edgeType === "member_of" ||
    edgeType === "co_owner";

  if (structure) {
    return getSmoothStepPath({ ...base, borderRadius: 20, offset: 4 });
  }

  return getBezierPath({ ...base, curvature: 0.22 });
}
