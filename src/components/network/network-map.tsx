"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
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
  const ink = selected ? "#3b82f6" : "#94a3b8";
  const style =
    e.type === "subsidiary"
      ? {
          stroke: selected ? "#3b82f6" : "#64748b",
          strokeWidth: selected ? 2.25 : 1.75,
        }
      : e.type === "partner"
        ? {
            stroke: ink,
            strokeWidth: selected ? 2 : 1.5,
            strokeDasharray: "5 4",
          }
        : e.type === "member_of"
          ? { stroke: ink, strokeWidth: selected ? 2 : 1.5 }
          : {
              stroke: selected ? "#93c5fd" : "#cbd5e1",
              strokeWidth: 1.25,
              strokeDasharray: "4 4",
            };

  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    data: e,
    selectable: true,
    focusable: true,
    deletable: Boolean(e.detachable),
    reconnectable: e.type === "subsidiary" || e.type === "member_of",
    interactionWidth: 28,
    style,
    animated: false,
    markerEnd:
      e.type === "subsidiary" || e.type === "client"
        ? {
            type: MarkerType.ArrowClosed,
            color: selected ? "#3b82f6" : "#64748b",
            width: 12,
            height: 12,
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
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<ConnectMode>("structure");
  const [toast, setToast] = useState<string | null>(null);
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
    if (isError) {
      setError(msg);
      setToast(null);
    } else {
      setToast(msg);
      setError(null);
    }
    window.setTimeout(() => {
      setToast(null);
      setError(null);
    }, 4200);
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
    flash("Layout reset.");
  }, [
    editable,
    flash,
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
            flash(result.message ?? "Detached.");
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
        flash(result.message ?? "Connected.");
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
        flash(result.message ?? "Moved.");
        router.refresh();
      });
    },
    [editable, flash, groupId, router, setEdges],
  );

  if (graph.nodes.length === 0) return null;

  const edgeCounts = useMemo(() => {
    let structure = 0;
    let partner = 0;
    let client = 0;
    for (const e of graph.edges) {
      if (e.type === "subsidiary" || e.type === "member_of") structure += 1;
      else if (e.type === "partner") partner += 1;
      else if (e.type === "client") client += 1;
    }
    return { structure, partner, client, nodes: graph.nodes.length };
  }, [graph.edges, graph.nodes.length]);

  return (
    <div className="linken-flow relative h-full w-full bg-[#f7f8fa]">
      {/* Floating command cluster — stays out of the canvas */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {editable ? (
            <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-white/95 p-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setMode("structure")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  mode === "structure"
                    ? "bg-ink text-white"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-ink",
                )}
              >
                Structure
              </button>
              <button
                type="button"
                onClick={() => setMode("partner")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  mode === "partner"
                    ? "bg-ink text-white"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-ink",
                )}
              >
                Partner
              </button>
              <span className="mx-1 h-4 w-px bg-[#e2e8f0]" />
              <button
                type="button"
                onClick={resetLayout}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-ink"
                title="Auto-arrange"
              >
                Reset
              </button>
            </div>
          ) : null}
          <div className="hidden items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white/90 px-2.5 py-1.5 text-[10px] text-[#64748b] shadow-sm backdrop-blur-sm sm:flex">
            <span className="tabular-nums font-semibold text-ink">
              {edgeCounts.nodes}
            </span>
            nodes
            <span className="text-[#e2e8f0]">·</span>
            <span className="tabular-nums font-semibold text-ink">
              {edgeCounts.partner}
            </span>
            partners
            <span className="text-[#e2e8f0]">·</span>
            <span className="tabular-nums font-semibold text-ink">
              {edgeCounts.structure}
            </span>
            ownership
          </div>
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
            className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-ink px-3.5 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.14)] transition-colors hover:bg-[#1a2332]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 text-[14px] leading-none">
              +
            </span>
            Add company
          </button>
        ) : null}
      </div>

      {(toast || error || pending) && (
        <div
          className={cn(
            "absolute top-16 left-1/2 z-30 max-w-md -translate-x-1/2 rounded-xl border px-4 py-2.5 text-center text-[12px] font-medium shadow-lg",
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-[#e2e8f0] bg-white text-ink",
          )}
        >
          {pending ? "Saving…" : error ?? toast}
        </div>
      )}

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
          size={1.1}
          color="#d4d9e2"
          bgColor="#f7f8fa"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="!m-3 !overflow-hidden !rounded-xl !border !border-[#e2e8f0] !bg-white !shadow-[0_8px_24px_rgba(15,23,42,0.08)] [&>button]:!h-8 [&>button]:!w-8 [&>button]:!border-[#f1f5f9] [&>button]:!bg-white [&>button]:!fill-[#64748b]"
        />
        {!panelOpen ? (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeStrokeWidth={3}
            nodeColor={(n) =>
              n.selected ? "#3b82f6" : "#94a3b8"
            }
            maskColor="rgba(15,23,42,0.06)"
            className="!m-3 !h-[96px] !w-[140px] !overflow-hidden !rounded-xl !border !border-[#e2e8f0] !bg-white !shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          />
        ) : null}
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
