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
import { NetworkEdgeLine } from "@/components/network/network-edge";
import { toFlowEdge } from "@/components/network/network-flow-edge";
import { NetworkHint } from "@/components/network/network-hint";
import { NetworkMapLegend } from "@/components/network/network-map-legend";
import type { OwnershipSlice } from "@/components/network/network-ownership-chart";
import { NetworkMapChrome } from "@/components/network/network-map-chrome";
import {
  MapCanvasToolbar,
  MapHeader,
  MapPalette,
  MapStatusBar,
  MapZoomControls,
  type MapDirection,
  type MapTool,
} from "@/components/network/network-map-workspace";
import {
  GraphSidePanel,
  type PanelMode,
} from "@/components/network/graph-side-panel";
import {
  connectGraphNodes,
  disconnectGraphEdge,
  reconnectStructureLink,
} from "@/features/network/graph-actions";
import { layoutOrg, layoutTree } from "@/features/network/layout";
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
};

const edgeTypes = {
  network: NetworkEdgeLine,
};

type ConnectMode = "structure" | "co_owner";

type Props = {
  graph: NetworkGraph;
  editable?: boolean;
  /** Outgoing pending partner invites (not drawn on the map). */
  pendingInviteCount?: number;
  title?: string;
  companySlug?: string;
};

function graphSignature(graph: NetworkGraph) {
  return [
    ...graph.nodes.map((n) => n.id).sort(),
    ...graph.edges.map((e) => e.id).sort(),
  ].join("|");
}

function usesOwnershipTree(graph: NetworkGraph) {
  return graph.edges.some((e) => e.type === "member_of" || e.type === "subsidiary");
}

/** Ownership structure → tree; a single company's links → flow. */
function computeLayout(graph: NetworkGraph, direction: MapDirection) {
  return usesOwnershipTree(graph)
    ? layoutTree(graph.nodes, graph.edges)
    : layoutOrg(graph.nodes, graph.edges, direction);
}

/** Every primary/co-owner edge pointing at this node, resolved to names. */
function resolveOwners(nodeId: string, graph: NetworkGraph): OwnershipSlice[] {
  const nameById = new Map(graph.nodes.map((n) => [n.id, n.data.name]));
  return graph.edges
    .filter(
      (e) =>
        e.target === nodeId && (e.type === "subsidiary" || e.type === "co_owner"),
    )
    .map((e) => ({
      name: nameById.get(e.source) ?? "Unknown",
      percentage: e.meta?.ownershipPercentage ?? null,
      type: e.meta?.ownershipType ?? null,
      primary: e.type === "subsidiary",
    }));
}

/** The company whose profile this graph renders on gets the hub/focus
 * treatment — falls back to the group, then the first company node. */
function resolveHubId(
  nodes: { id: string; data: NetworkNodeData }[],
  focusCompanyId?: string | null,
) {
  const focusId = focusCompanyId ? `company:${focusCompanyId}` : null;
  return (
    (focusId && nodes.find((n) => n.id === focusId)?.id) ??
    nodes.find((n) => n.data.kind === "group")?.id ??
    nodes.find((n) => n.data.kind === "company")?.id ??
    nodes[0]?.id
  );
}

export function NetworkMap({
  graph,
  editable = false,
  pendingInviteCount = 0,
  title = "Network",
  companySlug,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mode, setMode] = useState<ConnectMode>("structure");
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<NetworkNodeData | null>(null);
  const [selectedOwners, setSelectedOwners] = useState<OwnershipSlice[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>("inspect");
  const [connecting, setConnecting] = useState(false);
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [direction, setDirection] = useState<MapDirection>("vertical");
  const [tool, setTool] = useState<MapTool>("pan");
  const [showDots, setShowDots] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shellRef.current?.requestFullscreen?.();
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setSelected(null);
    setSelectedId(null);
    setSelectedOwners([]);
    setPanelMode("inspect");
  }, []);

  const onSelect = useCallback(
    (id: string, data: NetworkNodeData) => {
      if (data.moreCount) return;
      setSelectedId(id);
      setSelected(data);
      setSelectedOwners(resolveOwners(id, graph));
      setPanelMode("inspect");
      setPanelOpen(true);
    },
    [graph],
  );

  const onAdd = useCallback((id: string, data: NetworkNodeData) => {
    if (data.moreCount) return;
    setSelectedId(id);
    setSelected(data);
    setPanelMode("add");
    setPanelOpen(true);
  }, []);

  const signature = useMemo(() => graphSignature(graph), [graph]);
  const isTree = useMemo(() => usesOwnershipTree(graph), [graph]);
  const auto = useMemo(() => computeLayout(graph, direction), [graph, direction]);
  const hubId = useMemo(
    () => resolveHubId(auto.nodes, graph.context?.focusCompanyId) ?? null,
    [auto, graph.context?.focusCompanyId],
  );
  const routing = useMemo(
    () => ({ direction: isTree ? undefined : direction, hubId }),
    [isTree, direction, hubId],
  );
  const groupId = graph.context?.groupId ?? null;
  const layoutKey = useMemo(() => graphLayoutKey(graph), [graph]);
  const nodesById = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n] as const)),
    [graph.nodes],
  );

  const buildFlowEdges = useCallback(
    (companyNodes: Node[], activeId: string | null) => {
      const posMap = new Map(
        companyNodes.map((n) => [n.id, n.position] as const),
      );
      return graph.edges.map((e) => {
        const hot =
          Boolean(activeId) &&
          (e.source === activeId || e.target === activeId);
        return toFlowEdge(e, hot, editable, posMap, nodesById, routing);
      });
    },
    [graph.edges, editable, nodesById, routing],
  );

  useEffect(() => {
    if (graph.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Keep user-dragged positions across refresh / data updates
    const saved = loadGraphPositions(`${layoutKey}:${isTree ? "tree" : direction}`);
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
        direction: isTree ? undefined : direction,
      } satisfies FlowNodeData,
    }));

    setNodes(companyNodes);
    setEdges(buildFlowEdges(companyNodes, null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, layoutKey, editable, onSelect, onAdd, direction, setNodes, setEdges]);

  useEffect(() => {
    setNodes((prev) => {
      const next = prev.map((n) => ({
        ...n,
        selected: n.id === selectedId,
        data: {
          ...(n.data as FlowNodeData),
          onSelect,
          onAdd,
          selected: n.id === selectedId,
          editable,
        },
      }));
      if (next.length > 0) {
        setEdges(buildFlowEdges(next, selectedId));
      }
      return next;
    });
  }, [selectedId, onSelect, onAdd, editable, setNodes, setEdges, buildFlowEdges]);

  const flash = useCallback((msg: string, isError = false) => {
    if (!isError) return;
    setError(msg);
    window.setTimeout(() => setError(null), 3800);
  }, []);

  const persistPositions = useCallback(
    (nds: Node[]) => {
      saveGraphPositions(`${layoutKey}:${isTree ? "tree" : direction}`, positionsFromNodes(nds));
    },
    [layoutKey, isTree, direction],
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
      setEdges(buildFlowEdges(nds, selectedId));
      return nds;
    });
  }, [buildFlowEdges, persistPositions, selectedId, setEdges, setNodes]);

  const resetLayout = useCallback(() => {
    clearGraphPositions(`${layoutKey}:${isTree ? "tree" : direction}`);
    setNodes((prev) => {
      const next: Node[] = auto.nodes.map((n) => {
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
            direction: isTree ? undefined : direction,
          } satisfies FlowNodeData,
        };
      });
      setEdges(buildFlowEdges(next, selectedId));
      return next;
    });
  }, [
    auto,
    buildFlowEdges,
    direction,
    editable,
    hubId,
    isTree,
    layoutKey,
    onSelect,
    onAdd,
    selectedId,
    setEdges,
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
              coOwnerId: raw.meta?.coOwnerId,
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
            animated: false,
            style: {
              stroke: mode === "co_owner" ? "#0e1f1c" : "#66706b",
              strokeWidth: 2,
              strokeDasharray: mode === "co_owner" ? "7 3" : undefined,
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

  const firmCount = nodes.filter((n) => n.type === "company").length;

  const showOwnershipLegend = graph.edges.some((e) => e.type === "subsidiary");
  const showCoOwnerLegend = graph.edges.some((e) => e.type === "co_owner");
  const showPartnerLegend = graph.edges.some((e) => e.type === "partner");
  const showClientLegend = graph.edges.some((e) => e.type === "client");

  const legend = (inline: boolean) => (
    <NetworkMapLegend
      showOwnership={showOwnershipLegend}
      showCoOwner={showCoOwnerLegend}
      showPartner={showPartnerLegend}
      showClient={showClientLegend}
      inline={inline}
    />
  );

  const openAdd = () => {
    setPanelMode("add");
    setPanelOpen(true);
    if (!selected) {
      setSelectedId(null);
      setSelected(null);
    }
  };
  const addHref =
    companySlug && !groupId ? `/c/${companySlug}?add=1#add-partner` : null;

  const flow = (workspace: boolean) => (
    <ReactFlow
      key={signature}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={editable ? onConnect : undefined}
      onConnectStart={editable ? () => setConnecting(true) : undefined}
      onConnectEnd={editable ? () => setConnecting(false) : undefined}
      onReconnect={editable ? onReconnect : undefined}
      onNodeDragStop={onNodeDragStop}
      connectionMode={ConnectionMode.Loose}
      fitView
      fitViewOptions={{ padding: 0.25, maxZoom: 1.2 }}
      minZoom={0.3}
      maxZoom={1.5}
      nodesDraggable
      nodesConnectable={editable}
      edgesReconnectable={editable}
      elementsSelectable
      deleteKeyCode={editable ? ["Backspace", "Delete"] : null}
      selectNodesOnDrag={false}
      selectionOnDrag={workspace && tool === "select"}
      panOnDrag={workspace && tool === "select" ? [1, 2] : true}
      panOnScroll
      zoomOnScroll
      zoomOnDoubleClick
      preventScrolling
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: "smoothstep" }}
      connectionLineStyle={{ stroke: "var(--blue)", strokeWidth: 1.25 }}
      onPaneClick={closePanel}
      className="linken-flow-canvas"
    >
      {!workspace || showDots ? (
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#d9dfda"
          bgColor="transparent"
        />
      ) : null}
      {workspace ? (
        <>
          <MapCanvasToolbar
            tool={tool}
            onTool={setTool}
            direction={isTree ? null : direction}
            onDirection={setDirection}
            onArrange={resetLayout}
          />
          <MapZoomControls startId={hubId} />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            className="!m-4 !h-[124px] !w-[190px] overflow-hidden !rounded-md !border-[6px] !border-navy !bg-surface"
            maskColor="rgba(14,31,28,0.06)"
            nodeBorderRadius={3}
            nodeColor={(n) => {
              const d = n.data as FlowNodeData;
              if (d.isHub) return "#0e1f1c";
              return d.kind === "partner" ? "#9fd24a" : d.kind === "client" ? "#8a948f" : "#2b3a36";
            }}
          />
        </>
      ) : (
        <Controls showInteractive={false} position="bottom-left" className="!m-5" />
      )}
    </ReactFlow>
  );

  const sidePanel = (
    <GraphSidePanel
      open={panelOpen}
      mode={panelMode}
      selected={selected}
      owners={selectedOwners}
      context={graph.context}
      editable={editable}
      onClose={closePanel}
      onOpenAdd={() => setPanelMode("add")}
      onFlash={flash}
    />
  );

  const errorToast = error ? (
    <div className="absolute top-4 left-1/2 z-30 max-w-sm -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-2 text-center text-[12px] font-medium text-ink shadow-card">
      {error}
    </div>
  ) : null;

  /* Dashboard: builder layout — header, then palette + canvas in one surface. */
  if (companySlug) {
    const mapTitle =
      (graph.context?.focusCompanyId
        ? graph.nodes.find((n) => n.id === `company:${graph.context?.focusCompanyId}`)?.data.name
        : null) ??
      graph.nodes.find((n) => n.data.kind === "group")?.data.name ??
      graph.nodes[0]?.data.name ??
      title;
    return (
      <div
        ref={shellRef}
        className={`linken-flow flex h-full w-full flex-col gap-3 bg-[#f4f6f1] p-3 sm:p-4${connecting ? " linken-flow-connecting" : ""}`}
      >
        <MapHeader
          title={mapTitle}
          eyebrow={title}
          slug={companySlug}
          editable={editable}
          pendingInviteCount={pendingInviteCount}
          onAdd={openAdd}
          addHref={addHref}
          showDots={showDots}
          onToggleDots={() => setShowDots((v) => !v)}
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
          onReset={resetLayout}
          structureTools={
            groupId ? (
              <div className="flex items-center gap-1 rounded-xl bg-white/[0.06] p-1 ring-1 ring-white/20">
                {(
                  [
                    ["structure", "Ownership", "Drag parent → child"],
                    ["co_owner", "Shared", "Propose shared ownership — the other side must confirm"],
                  ] as const
                ).map(([m, label, hint]) => (
                  <button
                    key={m}
                    type="button"
                    title={hint}
                    onClick={() => setMode(m)}
                    className={`h-8 rounded-lg px-3 text-[13px] font-semibold transition-colors ${
                      mode === m ? "bg-lime text-navy" : "text-on-navy-soft hover:text-on-navy"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null
          }
        />
        <div className="flex min-h-0 flex-1 overflow-hidden rounded-[20px] bg-surface ring-1 ring-line/70">
          <MapPalette
            nodes={graph.nodes}
            selectedId={selectedId}
            onSelect={onSelect}
            onAdd={openAdd}
            addHref={addHref}
            isGroup={Boolean(groupId)}
            editable={editable}
          />
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div className="linken-flow-stage relative min-h-0 flex-1 bg-surface">
              <NetworkHint visible={editable && firmCount === 1 && !panelOpen} />
              {errorToast}
              {flow(true)}
              {sidePanel}
            </div>
            <MapStatusBar
              counts={countLabels}
              pendingInviteCount={pendingInviteCount}
              legend={legend(true)}
            />
          </div>
        </div>
      </div>
    );
  }

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
        onAdd={openAdd}
        addHref={addHref}
        showStructureTools={Boolean(groupId)}
        pendingInviteCount={pendingInviteCount}
        companySlug={companySlug}
      />

      <NetworkHint visible={editable && firmCount === 1 && !panelOpen} />
      {errorToast}
      {flow(false)}
      {legend(false)}
      {sidePanel}
    </div>
  );
}
