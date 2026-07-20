"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
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
import { NetworkHint } from "@/components/network/network-hint";
import { NetworkMapChrome } from "@/components/network/network-map-chrome";
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
  title?: string;
};

function toFlowEdge(e: NetworkEdge, selected: boolean): Edge {
  const isOwns = e.type === "subsidiary";
  const isStructure = isOwns || e.type === "member_of";
  const isPartner = e.type === "partner";

  const stroke = selected
    ? "#1a5c51"
    : isOwns
      ? "#0e1f1c"
      : isPartner
        ? "#a3aba6"
        : "#8a948e";

  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    data: e,
    selectable: true,
    focusable: true,
    deletable: Boolean(e.detachable),
    reconnectable: isStructure,
    interactionWidth: 28,
    style: {
      stroke,
      strokeWidth: selected ? 2 : isOwns ? 1.6 : 1.2,
      strokeDasharray: isPartner || e.type === "client" ? "2.5 5" : undefined,
      opacity: selected ? 1 : isPartner ? 0.8 : 0.9,
    },
    animated: false,
    markerEnd: isOwns
      ? {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 11,
          height: 11,
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
  title = "Network",
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mode, setMode] = useState<ConnectMode>("structure");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<NetworkNodeData | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>("inspect");
  const [connecting, setConnecting] = useState(false);
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
    const hubId =
      auto.nodes.find((n) => n.data.kind === "group")?.id ??
      auto.nodes.find((n) => n.data.kind === "company")?.id ??
      auto.nodes[0]?.id;
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
        isHub: n.id === hubId,
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
    const hubId =
      auto.nodes.find((n) => n.data.kind === "group")?.id ??
      auto.nodes.find((n) => n.data.kind === "company")?.id ??
      auto.nodes[0]?.id;
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
            isHub: n.id === hubId,
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

  const countLabels = [
    graph.summary.companies
      ? `${graph.summary.companies} ${graph.summary.companies === 1 ? "company" : "companies"}`
      : null,
    graph.summary.subsidiaries
      ? `${graph.summary.subsidiaries} subsidiaries`
      : null,
    graph.summary.partners
      ? `${graph.summary.partners} partners`
      : null,
  ].filter(Boolean) as string[];

  const firmCount = nodes.filter(
    (n) => n.type === "company" && !isClusterNodeId(n.id),
  ).length;

  return (
    <div
      className={`linken-flow linken-flow-stage relative h-full w-full${connecting ? " linken-flow-connecting" : ""}`}
    >
      <NetworkMapChrome
        title={title}
        counts={countLabels}
        editable={editable}
        mode={mode}
        onMode={setMode}
        onReset={resetLayout}
        onAdd={() => {
          setPanelMode("add");
          setPanelOpen(true);
          if (!selected) {
            setSelectedId(null);
            setSelected(null);
          }
        }}
        pendingInviteCount={pendingInviteCount}
      />

      <NetworkHint visible={editable && firmCount === 1 && !panelOpen} />

      {error ? (
        <div className="absolute top-14 left-1/2 z-30 max-w-sm -translate-x-1/2 rounded-2xl border border-red-200/80 bg-red-50/95 px-3.5 py-2 text-center text-[12px] font-medium text-red-800 shadow-[0_10px_28px_rgba(8,20,18,0.08)] backdrop-blur-md">
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
        onConnectStart={editable ? () => setConnecting(true) : undefined}
        onConnectEnd={editable ? () => setConnecting(false) : undefined}
        onReconnect={editable ? onReconnect : undefined}
        onNodeDragStop={onNodeDragStop}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.24, maxZoom: 1.25 }}
        minZoom={0.3}
        maxZoom={1.5}
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
        connectionLineStyle={{ stroke: "#1a5c51", strokeWidth: 1.75 }}
        onPaneClick={closePanel}
        className="linken-flow-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(14, 31, 28, 0.1)"
          bgColor="transparent"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="!m-4 !overflow-hidden !rounded-2xl !border !border-white/80 !bg-white/78 !shadow-[0_10px_32px_rgba(8,20,18,0.07)] !backdrop-blur-xl [&>button]:!h-8 [&>button]:!w-8 [&>button]:!border-transparent [&>button]:!bg-transparent [&>button]:!fill-[var(--muted)]"
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
