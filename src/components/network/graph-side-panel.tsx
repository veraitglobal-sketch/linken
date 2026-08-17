"use client";

import { GraphPanelAdd } from "@/components/network/graph-panel-add";
import { GraphPanelInspect } from "@/components/network/graph-panel-inspect";
import { CloseIcon } from "@/components/network/graph-panel-icons";
import type { OwnershipSlice } from "@/components/network/network-ownership-chart";
import { useGraphPanelState } from "@/components/network/use-graph-panel-state";
import type {
  NetworkGraphContext,
  NetworkNodeData,
} from "@/features/network/types";
import { cn } from "@/lib/cn";

export type PanelMode = "inspect" | "add";

type Props = {
  open: boolean;
  mode: PanelMode;
  selected: NetworkNodeData | null;
  owners?: OwnershipSlice[];
  context?: NetworkGraphContext;
  editable?: boolean;
  onClose: () => void;
  onOpenAdd: () => void;
  onFlash: (msg: string, isError?: boolean) => void;
};

export function GraphSidePanel({
  open,
  mode,
  selected,
  owners = [],
  context,
  editable = false,
  onClose,
  onOpenAdd,
  onFlash,
}: Props) {
  const panel = useGraphPanelState({
    open,
    mode,
    selected,
    context,
    editable,
    onFlash,
  });

  if (!open) return null;

  return (
    <aside
      className={cn(
        "linken-panel-enter absolute inset-y-0 right-0 z-30 flex w-[min(100%,22.5rem)] flex-col",
        "border-l border-line bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-display text-[16px] font-medium tracking-[-0.03em] text-ink">
            {mode === "add"
              ? "Add a company"
              : selected
                ? selected.name
                : "Company"}
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            {mode === "add"
              ? selected && selected.kind !== "group"
                ? `Search firms to attach near ${selected.name}.`
                : "Search an existing company to add to this workspace."
              : "A step that belongs to your network graph."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-plus transition-colors hover:bg-paper hover:text-ink"
          aria-label="Close panel"
        >
          <CloseIcon />
        </button>
      </div>

      {mode === "inspect" && selected ? (
        <GraphPanelInspect
          selected={selected}
          owners={owners}
          context={context}
          editable={editable}
          teamAccess={panel.teamAccess}
          showInviteTeam={panel.showInviteTeam}
          inviteFlash={panel.inviteFlash}
          pendingRefresh={panel.pendingRefresh}
          onOpenAdd={onOpenAdd}
          onShowInviteTeam={() => {
            panel.setInviteFlash(null);
            panel.setShowInviteTeam(true);
          }}
          onHideInviteTeam={() => panel.setShowInviteTeam(false)}
          onInviteSent={(email) => {
            panel.setShowInviteTeam(false);
            panel.setInviteFlash(email);
            panel.setPendingRefresh((n) => n + 1);
          }}
        />
      ) : null}

      {mode === "add" ? (
        <GraphPanelAdd
          query={panel.query}
          onQueryChange={panel.setQuery}
          hits={panel.hits}
          searching={panel.searching}
          pending={panel.pending}
          activeHit={panel.activeHit}
          canInviteToGroup={panel.canInviteToGroup}
          canCreateUnder={panel.canCreateUnder}
          showCreate={panel.showCreate}
          onToggleCreate={() => panel.setShowCreate((v) => !v)}
          context={context}
          parentCompanyId={panel.parentCompanyId}
          onAddCompany={panel.addCompany}
        />
      ) : null}
    </aside>
  );
}
