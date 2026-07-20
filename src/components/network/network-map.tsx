"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
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
import { NetworkClusterHalo } from "@/components/network/network-cluster-halo";
import {
  isClusterNodeId,
  toHaloNodes,
} from "@/components/network/network-cluster-nodes";
import {
  GraphSidePanel,
  type PanelMode,
} from "@/components/network/graph-side-panel";
import {
  connectGraphNodes,
  disconnectGraphEdge,
  reconnectStructureLink,
} from "@/features/network/graph-actions";
import {
  ellipsesFromMembership,
  layoutRadial,
  layoutTree,
} from "@/features/network/layout";
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

const nodeTypes = {
  company: NetworkCompanyNode,
  clusterHalo: NetworkClusterHalo,
};

type ConnectMode = "structure" | "partner";

type Props = {
  graph: NetworkGraph;
  editable?: boolean;
  /** Outgoing pending partner invites (not drawn on the map). */
  pendingInviteCount?: number;
};

function toFlowEdge(e: NetworkEdge, selected: boolean): Edge {
  const isOwns = e.type === "subsidiary";
  const isMember = e.type === "member_of";
  const isStructure = isOwns || isMember;
  const isPartner = e.type === "partner";

  // Ownership = solid dark + arrow. Partner = dashed, mutual (no arrow).
  const stroke = selected
    ? "#1a5c51"
    : isOwns
      ? "#0e1f1c"
      : isMember
        ? "#3a423e"
        : isPartner
          ? "#66706b"
          : "#94a3b8";

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
    labelBgStyle: { fill: "#eef1ef" },
    labelBgPadding: [3, 6] as [number, number],
    labelBgBorderRadius: 4,
    style: {
      stroke,
      strokeWidth: selected ? 2.75 : isOwns ? 2.4 : isPartner ? 2 : 2.1,
      strokeDasharray: isPartner || e.type === "client" ? "6 5" : undefined,
      opacity: 1,
    },
    animated: false,
    markerEnd: isOwns
      ? {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 16,
          height: 16,
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

export function NetworkMap({
  graph,
  editable = false,
  pendingInviteCount = 0,
}: Props) {
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
  const clusterMembershipRef = useRef<
    { ownerId: string; nodeIds: string[] }[]
  >([]);

  useEffect(() => {
    if (graph.nodes.length === 0) {
      clusterMembershipRef.current = [];
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

    clusterMembershipRef.current = auto.clusters.map((c) => ({
      ownerId: c.ownerId,
      nodeIds: c.nodeIds,
    }));

    // Keep user-dragged positions across refresh / data updates
    const saved = loadGraphPositions(layoutKey);
    const companyNodes: Node[] = auto.nodes.map((n) => ({
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
    }));

    const posMap = new Map(
      companyNodes.map((n) => [n.id, n.position] as const),
    );
    const clusters = ellipsesFromMembership(
      clusterMembershipRef.current,
      posMap,
    );

    setNodes([...toHaloNodes(clusters), ...companyNodes]);
    setEdges(graph.edges.map((e) => toFlowEdge(e, false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, layoutKey, editable, onSelect, onAdd, setNodes, setEdges]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.type === "clusterHalo" || isClusterNodeId(n.id)) return n;
        return {
          ...n,
          selected: n.id === selectedId,
          data: {
            ...(n.data as FlowNodeData),
            onSelect,
            onAdd,
            selected: n.id === selectedId,
            editable,
          },
        };
      }),
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
      saveGraphPositions(
        layoutKey,
        positionsFromNodes(nds.filter((n) => !isClusterNodeId(n.id))),
      );
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
      const company = nds.filter((n) => !isClusterNodeId(n.id));
      persistPositions(company);
      const posMap = new Map(
        company.map((n) => [n.id, n.position] as const),
      );
      const clusters = ellipsesFromMembership(
        clusterMembershipRef.current,
        posMap,
      );
      return [...toHaloNodes(clusters), ...company];
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
    clusterMembershipRef.current = auto.clusters.map((c) => ({
      ownerId: c.ownerId,
      nodeIds: c.nodeIds,
    }));
    setNodes((prev) => {
      const companyNodes: Node[] = auto.nodes.map((n) => {
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
      });
      return [...toHaloNodes(auto.clusters), ...companyNodes];
    });
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
    <div className="linken-flow linken-flow-stage relative h-full w-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start p-3 pr-36 sm:pr-40">
        <div className="pointer-events-auto flex flex-col gap-2">
          {editable ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center rounded-full border border-black/[0.06] bg-white/80 p-0.5 shadow-[0_10px_30px_rgba(8,20,18,0.07)] backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMode("structure")}
                  title="Drag from parent → child firm (ownership)"
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    mode === "structure"
                      ? "bg-navy text-white"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  Ownership
                </button>
                <button
                  type="button"
                  onClick={() => setMode("partner")}
                  title="Drag between firms to request partnership"
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    mode === "partner"
                      ? "bg-navy text-white"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  Partner
                </button>
                <button
                  type="button"
                  onClick={resetLayout}
                  className="rounded-full px-2.5 py-1.5 text-[11px] text-muted transition-colors hover:text-ink"
                  title="Reset layout"
                >
                  Reset
                </button>
              </div>
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
                className="inline-flex h-8 items-center gap-1 rounded-full bg-navy px-3.5 text-[11px] font-semibold text-white shadow-[0_10px_28px_rgba(8,20,18,0.16)] transition-colors hover:bg-accent-hover"
              >
                + Add
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 px-1 text-[10px] font-medium text-muted/90">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative inline-block h-px w-4 bg-ink/70">
                <span className="absolute top-1/2 right-0 h-0 w-0 -translate-y-1/2 border-y-[3px] border-l-[4px] border-y-transparent border-l-ink/70" />
              </span>
              Owns
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-px w-4 border-t border-dashed border-plus"
                style={{ borderTopWidth: 1.5 }}
              />
              Partner
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-[2px] border border-dashed border-ember bg-[#faf4ec]" />
              Verify
            </span>
            {pendingInviteCount > 0 ? (
              <Link
                href="/dashboard/partners"
                className="pointer-events-auto inline-flex items-center gap-1 font-semibold text-ember underline-offset-2 hover:underline"
              >
                +{pendingInviteCount} pending
              </Link>
            ) : null}
          </div>
        </div>
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
        connectionLineStyle={{ stroke: "#1a5c51", strokeWidth: 2.25 }}
        onPaneClick={closePanel}
        className="linken-flow-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.4}
          color="#a8b0aa"
          bgColor="transparent"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="!m-3 !overflow-hidden !rounded-full !border !border-black/[0.06] !bg-white/85 !shadow-[0_10px_28px_rgba(8,20,18,0.07)] !backdrop-blur-md [&>button]:!h-7 [&>button]:!w-7 [&>button]:!border-transparent [&>button]:!bg-transparent [&>button]:!fill-[var(--muted)]"
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
