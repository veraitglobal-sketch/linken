import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";

/** Smoothstep edge — rounded corners, detach control when selected. */
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
  } = props;
  const { deleteElements } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 6,
  });

  const showDetach = Boolean(selected && deletable);

  return (
    <>
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
            className="nodrag nopan absolute flex h-5 w-5 items-center justify-center rounded-full border border-line bg-white text-[11px] font-semibold text-ink shadow-[0_2px_8px_rgba(8,20,18,0.18)] transition-colors hover:bg-paper"
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
