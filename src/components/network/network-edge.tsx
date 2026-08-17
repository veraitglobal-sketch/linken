import {
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { buildEdgePath } from "@/components/network/network-edge-path";
import type { NetworkEdge } from "@/features/network/types";

/** Hairline edges — bezier for partners, smoothstep for structure. */
export function NetworkEdgeLine(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    selected,
    deletable,
    data,
  } = props;
  const { deleteElements } = useReactFlow();
  const raw = data as NetworkEdge | undefined;

  const [edgePath, labelX, labelY] = buildEdgePath(
    {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
    },
    raw?.type,
  );

  const showDetach = Boolean(selected && deletable);
  const halo = selected
    ? { stroke: "color-mix(in srgb, var(--blue) 12%, transparent)", strokeWidth: 5 }
    : null;

  return (
    <>
      {halo ? (
        <BaseEdge id={`${id}-halo`} path={edgePath} style={halo} />
      ) : null}
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {showDetach ? (
        <EdgeLabelRenderer>
          <button
            type="button"
            title="Disconnect"
            onClick={(e) => {
              e.stopPropagation();
              deleteElements({ edges: [{ id }] });
            }}
            className="nodrag nopan absolute flex h-5 w-5 items-center justify-center rounded-full border border-line/80 bg-surface text-[11px] font-medium text-muted transition-colors hover:border-blue/30 hover:text-blue"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
          >
            ×
          </button>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
