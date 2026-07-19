"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  reconnectEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  NetworkCompanyNode,
  type FlowNodeData,
} from "@/components/network/network-company-node";
import {
  GraphSidePanel,
  type PanelMode,
} from "@/components/network/graph-side-panel";
import {
  connectGraphNodes,
  disconnectGraphEdge,
  reconnectStructureLink,
} from "@/features/network/graph-actions";
import { layoutRadial, layoutTree } from "@/features/network/layout";
import {
  clearGraphPositions,
  graphLayoutKey,
  loadGraphPositions,
  positionsFromNodes,
  saveGraphPositions,
} from "@/features/network/layout-storage";
import type {
  NetworkEdge,
  NetworkGraph,
  NetworkNodeData,
} from "@/features/network/types";
import { cn } from "@/lib/cn";

const nodeTypes = { company: NetworkCompanyNode };

type ConnectMode = "structure" | "partner";

type Props = {
  graph: NetworkGraph;
  editable?: boolean;
};

function toFlowEdge(e: NetworkEdge, selected: boolean): Edge {
  const isOwns = e.type === "subsidiary";
  const isMember = e.type === "member_of";
  const isStructure = isOwns || isMember;
  const isPartner = e.type === "partner";

  // Ownership = solid dark + arrow. Partner = dashed, mutual (no arrow).
  const stroke = selected
    ? "#2563eb"
    : isOwns
      ? "#0b1220"
      : isMember
        ? "#475569"
        : isPartner
          ? "#94a3b8"
          : "#cbd5e1";

  const label = isOwns
    ? "owns"
    : isPartner
      ? "partner"
      : isMember
        ? "member"
        : e.type === "client"
          ? "client"
          : undefined;

  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: isStructure ? "smoothstep" : "default",
    data: e,
    selectable: true,
    focusable: true,
    deletable: Boolean(e.detachable),
    reconnectable: isStructure,
    interactionWidth: 28,
    label,
    labelStyle: {
      fill: isOwns ? "#0b1220" : "#64748b",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    labelBgStyle: { fill: "#f7f8fa" },
    labelBgPadding: [3, 6] as [number, number],
    labelBgBorderRadius: 4,
    style: {
      stroke,
      strokeWidth: selected ? 2.25 : isOwns ? 2 : isPartner ? 1.5 : 1.6,
      strokeDasharray: isPartner || e.type === "client" ? "5 4" : undefined,
      opacity: 1,
    },
    animated: false,
    markerEnd: isOwns
      ? {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 14,
          height: 14,
        }
      : undefined,
  };
}

function graphSignature(graph: NetworkGraph) {
  return [
    ...graph.nodes.map((n) => n.id).sort(),
    ...graph.edges.map((e) => e.id).sort(),
  ].join("|");
}

export function NetworkMap({ graph, editable = false }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mode, setMode] = useState<ConnectMode>("structure");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<NetworkNodeData | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>("inspect");
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setSelected(null);
    setSelectedId(null);
    setPanelMode("inspect");
  }, []);

  const onSelect = useCallback((id: string, data: NetworkNodeData) => {
    if (data.moreCount) return;
    setSelectedId(id);
    setSelected(data);
    setPanelMode("inspect");
    setPanelOpen(true);
  }, []);

  const onAdd = useCallback((id: string, data: NetworkNodeData) => {
    if (data.moreCount) return;
    setSelectedId(id);
    setSelected(data);
    setPanelMode("add");
    setPanelOpen(true);
  }, []);

  const signature = useMemo(() => graphSignature(graph), [graph]);
  const groupId = graph.context?.groupId ?? null;
  const layoutKey = useMemo(() => graphLayoutKey(graph), [graph]);

  useEffect(() => {
    if (graph.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const usesTree = graph.edges.some(
      (e) => e.type === "member_of" || e.type === "subsidiary",
    );
    const auto = usesTree
      ? layoutTree(graph.nodes, graph.edges)
      : layoutRadial(graph.nodes, graph.edges);

    // Keep user-dragged positions across refresh / data updates
    const saved = loadGraphPositions(layoutKey);

    setNodes(
      auto.map((n) => ({
        id: n.id,
        type: "company",
        position: saved[n.id] ?? n.position,
        draggable: true,
        connectable: editable && n.data.kind !== "group",
        data: {
          ...n.data,
          onSelect,
          onAdd,
          selected: false,
          nodeId: n.id,
          editable,
        } satisfies FlowNodeData,
      })),
    );
    setEdges(graph.edges.map((e) => toFlowEdge(e, false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, layoutKey, editable, onSelect, onAdd, setNodes, setEdges]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        selected: n.id === selectedId,
        data: {
          ...(n.data as FlowNodeData),
          onSelect,
          onAdd,
          selected: n.id === selectedId,
          editable,
        },
      })),
    );
    setEdges((prev) =>
      prev.map((e) => {
        const raw = e.data as NetworkEdge | undefined;
        const hot =
          Boolean(selectedId) &&
          (e.source === selectedId || e.target === selectedId);
        return toFlowEdge(
          raw ?? {
            id: e.id,
            source: e.source,
            target: e.target,
            type: "partner",
          },
          hot,
        );
      }),
    );
  }, [selectedId, onSelect, onAdd, editable, setNodes, setEdges]);

  const flash = useCallback((msg: string, isError = false) => {
    if (!isError) return;
    setError(msg);
    window.setTimeout(() => setError(null), 3800);
  }, []);

  const persistPositions = useCallback(
    (nds: Node[]) => {
      saveGraphPositions(layoutKey, positionsFromNodes(nds));
    },
    [layoutKey],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  const onNodeDragStop = useCallback(() => {
    setNodes((nds) => {
      persistPositions(nds);
      return nds;
    });
  }, [persistPositions, setNodes]);

  const resetLayout = useCallback(() => {
    clearGraphPositions(layoutKey);
    const usesTree = graph.edges.some(
      (e) => e.type === "member_of" || e.type === "subsidiary",
    );
    const auto = usesTree
      ? layoutTree(graph.nodes, graph.edges)
      : layoutRadial(graph.nodes, graph.edges);
    setNodes((prev) =>
      auto.map((n) => {
        const existing = prev.find((p) => p.id === n.id);
        return {
          id: n.id,
          type: "company" as const,
          position: n.position,
          draggable: true,
          connectable: editable && n.data.kind !== "group",
          data: {
            ...n.data,
            onSelect,
            onAdd,
            selected: existing?.id === selectedId,
            nodeId: n.id,
            editable,
          } satisfies FlowNodeData,
        };
      }),
    );
  }, [
    editable,
    graph.edges,
    graph.nodes,
    layoutKey,
    onSelect,
    onAdd,
    selectedId,
    setNodes,
  ]);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Handle deletes locally then persist
      const removes = changes.filter((c) => c.type === "remove");
      if (removes.length && editable) {
        for (const change of removes) {
          if (change.type !== "remove") continue;
          const edge = edges.find((e) => e.id === change.id);
          const raw = edge?.data as NetworkEdge | undefined;
          if (!raw?.detachable) continue;
          startTransition(async () => {
            const result = await disconnectGraphEdge({
              edgeType: raw.type,
              partnershipId: raw.meta?.partnershipId,
              groupId: raw.meta?.groupId,
              memberCompanyId: raw.meta?.memberCompanyId,
            });
            if (!result.ok) {
              flash(result.error, true);
              router.refresh();
              return;
            }
            router.refresh();
          });
        }
      }
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [editable, edges, flash, router, setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!editable || !connection.source || !connection.target) return;

      // Optimistic line
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `temp:${connection.source}->${connection.target}:${Date.now()}`,
            type: "smoothstep",
            animated: mode === "partner",
            style: {
              stroke: "#64748b",
              strokeWidth: 2,
              strokeDasharray: mode === "partner" ? "6 4" : undefined,
            },
          },
          eds,
        ),
      );

      startTransition(async () => {
        const result = await connectGraphNodes({
          mode,
          sourceNodeId: connection.source!,
          targetNodeId: connection.target!,
          groupId,
        });
        if (!result.ok) {
          flash(result.error, true);
          router.refresh();
          return;
        }
        router.refresh();
      });
    },
    [editable, flash, groupId, mode, router, setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (!editable || !groupId) return;
      const raw = oldEdge.data as NetworkEdge | undefined;
      if (!raw || (raw.type !== "subsidiary" && raw.type !== "member_of")) {
        flash("Only structure links can be re-parented by drag.", true);
        return;
      }

      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));

      const childId =
        raw.meta?.memberCompanyId ??
        (oldEdge.target.startsWith("company:")
          ? oldEdge.target.slice("company:".length)
          : null);
      const newParent =
        newConnection.source?.startsWith("company:")
          ? newConnection.source.slice("company:".length)
          : null;

      if (!childId) {
        flash("Could not resolve company to move.", true);
        router.refresh();
        return;
      }

      startTransition(async () => {
        const result = await reconnectStructureLink({
          groupId,
          childCompanyId: childId,
          newParentCompanyId: newParent,
        });
        if (!result.ok) {
          flash(result.error, true);
          router.refresh();
          return;
        }
        router.refresh();
      });
    },
    [editable, flash, groupId, router, setEdges],
  );

  if (graph.nodes.length === 0) return null;

  return (
    <div className="linken-flow relative h-full w-full bg-[#f7f8fa]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto flex flex-col gap-1.5">
          {editable ? (
            <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setMode("structure")}
                title="Drag from parent → child firm (ownership)"
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  mode === "structure"
                    ? "bg-ink text-white"
                    : "text-[#64748b] hover:text-ink",
                )}
              >
                Ownership
              </button>
              <button
                type="button"
                onClick={() => setMode("partner")}
                title="Drag between firms to request partnership"
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  mode === "partner"
                    ? "bg-ink text-white"
                    : "text-[#64748b] hover:text-ink",
                )}
              >
                Partner
              </button>
              <button
                type="button"
                onClick={resetLayout}
                className="rounded-md px-2 py-1.5 text-[11px] text-[#94a3b8] transition-colors hover:text-ink"
                title="Reset layout"
              >
                Reset
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[#e2e8f0] bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#64748b] shadow-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative inline-block h-px w-5 bg-ink">
                <span className="absolute top-1/2 right-0 h-0 w-0 -translate-y-1/2 border-y-[3px] border-l-[5px] border-y-transparent border-l-ink" />
              </span>
              Owns
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-px w-5 border-t border-dashed border-[#94a3b8]"
                style={{ borderTopWidth: 1.5 }}
              />
              Partner
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm border border-dashed border-[#f59e0b] bg-[#fffbeb]" />
              Needs domain verify
            </span>
          </div>
          {editable ? (
            <p className="px-0.5 text-[10px] text-[#94a3b8]">
              {mode === "structure"
                ? "Mode: parent → child (ownership / ćerka firma)"
                : "Mode: mutual partner link (pending until confirmed)"}
            </p>
          ) : null}
        </div>

        {editable ? (
          <button
            type="button"
            onClick={() => {
              setPanelMode("add");
              setPanelOpen(true);
              if (!selected) {
                setSelectedId(null);
                setSelected(null);
              }
            }}
            className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#1a2332]"
          >
            + Add
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="absolute top-14 left-1/2 z-30 max-w-sm -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-[12px] font-medium text-red-800 shadow-sm">
          {error}
        </div>
      ) : null}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={editable ? onConnect : undefined}
        onReconnect={editable ? onReconnect : undefined}
        onNodeDragStop={onNodeDragStop}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.25}
        maxZoom={1.6}
        nodesDraggable
        nodesConnectable={editable}
        edgesReconnectable={editable}
        elementsSelectable
        deleteKeyCode={editable ? ["Backspace", "Delete"] : null}
        selectNodesOnDrag={false}
        selectionOnDrag={false}
        panOnDrag
        panOnScroll
        zoomOnScroll
        zoomOnDoubleClick
        preventScrolling
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        connectionLineStyle={{ stroke: "#3b82f6", strokeWidth: 1.75 }}
        onPaneClick={closePanel}
        className="linken-flow-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="#d8dde6"
          bgColor="#f7f8fa"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="!m-3 !overflow-hidden !rounded-lg !border !border-[#e2e8f0] !bg-white !shadow-sm [&>button]:!h-7 [&>button]:!w-7 [&>button]:!border-[#f1f5f9] [&>button]:!bg-white [&>button]:!fill-[#64748b]"
        />
      </ReactFlow>

      <GraphSidePanel
        open={panelOpen}
        mode={panelMode}
        selected={selected}
        context={graph.context}
        editable={editable}
        onClose={closePanel}
        onOpenAdd={() => setPanelMode("add")}
        onFlash={flash}
      />
    </div>
  );
}
