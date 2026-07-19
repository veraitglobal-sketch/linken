"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  NetworkCompanyNode,
  type FlowNodeData,
} from "@/components/network/network-company-node";
import { Button } from "@/components/ui/button";
import { layoutRadial } from "@/features/network/layout";
import type {
  NetworkEdge,
  NetworkGraph,
  NetworkNodeData,
} from "@/features/network/types";

const nodeTypes = { company: NetworkCompanyNode };

type Props = {
  graph: NetworkGraph;
};

function edgeStyle(type: NetworkEdge["type"]): Partial<Edge> {
  if (type === "member_of") {
    return {
      style: { stroke: "#5ec4a8", strokeWidth: 2 },
      animated: false,
    };
  }
  if (type === "partner") {
    return {
      style: {
        stroke: "#5ec4a8",
        strokeWidth: 1.5,
        strokeDasharray: "6 4",
      },
      animated: false,
    };
  }
  return {
    style: { stroke: "rgba(94,196,168,0.55)", strokeWidth: 1.25 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#5ec4a8",
      width: 14,
      height: 14,
    },
    animated: false,
  };
}

export function NetworkMap({ graph }: Props) {
  const [selected, setSelected] = useState<NetworkNodeData | null>(null);

  const onSelect = useCallback((data: NetworkNodeData) => {
    if (data.moreCount) return;
    setSelected(data);
  }, []);

  const positioned = useMemo(
    () => layoutRadial(graph.nodes, graph.edges),
    [graph.edges, graph.nodes],
  );

  const nodes: Node[] = useMemo(
    () =>
      positioned.map((n) => ({
        id: n.id,
        type: "company",
        position: n.position,
        data: { ...n.data, onSelect } satisfies FlowNodeData,
        draggable: false,
      })),
    [onSelect, positioned],
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        ...edgeStyle(e.type),
      })),
    [graph.edges],
  );

  if (graph.nodes.length === 0) return null;

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        proOptions={{ hideAttribution: true }}
        onPaneClick={() => setSelected(null)}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.2}
          color="rgba(94,196,168,0.22)"
          bgColor="#0a1714"
        />
        <Controls
          showInteractive={false}
          className="!overflow-hidden !rounded-xl !border !border-white/15 !bg-[#10231f] !shadow-none [&>button]:!border-white/10 [&>button]:!bg-[#10231f] [&>button]:!fill-white/70"
        />
      </ReactFlow>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-2xl border border-white/12 bg-[#10231f]/95 px-3 py-2.5 text-[11px] text-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
        <p className="mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-white/40 uppercase">
          Legend
        </p>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="h-px w-6 bg-[#5ec4a8]" />
            Member of group
          </li>
          <li className="flex items-center gap-2">
            <span className="h-px w-6 border-t border-dashed border-[#5ec4a8]" />
            Partner
          </li>
          <li className="flex items-center gap-2">
            <span className="relative h-px w-6 bg-[#5ec4a8]/55">
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#5ec4a8]" />
            </span>
            Client
          </li>
        </ul>
      </div>

      {selected ? (
        <div className="absolute top-3 right-3 z-10 w-[min(100%-1.5rem,16rem)] rounded-2xl border border-line bg-white p-4 shadow-[0_18px_50px_rgba(10,20,18,0.25)]">
          <p className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
            {selected.name}
          </p>
          <p className="mt-1 text-[12px] text-ink-soft">
            {[selected.category, selected.city].filter(Boolean).join(" · ") ||
              selected.kind}
          </p>
          {selected.trustLevel ? (
            <p className="mt-2 text-[12px] text-ink">
              Level: {selected.trustLevel}
            </p>
          ) : null}
          {selected.kind !== "group" ? (
            <p className="mt-1 text-[12px] text-ink-soft">
              {selected.stats.confirmedPartners} partners ·{" "}
              {selected.stats.confirmedReferences} references
            </p>
          ) : null}
          {selected.href && selected.href !== "#" ? (
            <Button
              href={selected.href}
              variant="secondary"
              className="mt-3 h-10 w-full"
            >
              View profile →
            </Button>
          ) : null}
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mt-2 w-full text-center text-[12px] font-medium text-muted hover:text-ink"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
