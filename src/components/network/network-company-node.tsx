"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { NetworkNodeHandles } from "@/components/network/network-node-handles";
import { NetworkNodeTeam } from "@/components/network/network-node-team";
import { LogoTile } from "@/components/ui/logo-tile";
import type { NetworkNodeData, NetworkNodeKind } from "@/features/network/types";
import { cn } from "@/lib/cn";

export type FlowNodeData = NetworkNodeData & {
  onSelect?: (id: string, data: NetworkNodeData) => void;
  onAdd?: (id: string, data: NetworkNodeData) => void;
  selected?: boolean;
  nodeId?: string;
  editable?: boolean;
  isHub?: boolean;
};

const ROLE: Record<NetworkNodeKind, string> = {
  group: "Group",
  company: "Company",
  subsidiary: "Subsidiary",
  partner: "Partner",
  client: "Client",
};

const CARD =
  "border bg-surface transition-[border-color,box-shadow] duration-200";

/** Quiet enterprise cards — hub reads first, partners stay compact. */
function NetworkCompanyNodeInner({ id, data, selected }: NodeProps) {
  const d = data as FlowNodeData;
  const on = Boolean(selected || d.selected);
  const canWire = Boolean(d.editable) && d.kind !== "group" && !d.moreCount;
  const hub = Boolean(d.isHub);
  const partner = d.kind === "partner" || d.kind === "client";
  const open = !partner || on;

  return (
    <div
      className={cn(
        "linken-node group/node relative linken-node-enter",
        open ? (hub ? "w-[164px]" : "w-[150px]") : "w-12",
      )}
    >
      <NetworkNodeHandles canWire={canWire} />

      <div
        onClick={() => d.onSelect?.(id, d)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            d.onSelect?.(id, d);
          }
        }}
        role="button"
        tabIndex={0}
        className={cn(
          CARD,
          "relative w-full cursor-grab rounded-tile text-left active:cursor-grabbing",
          d.kind === "client" ? "border-dashed border-line" : "border-line",
          on
            ? "border-blue/40 shadow-card"
            : cn(hub && "border-navy/20", "hover:border-navy/25"),
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2",
            open ? (hub ? "px-3 py-2.5" : "px-2.5 py-2") : "p-1.5",
          )}
        >
          <LogoTile
            name={d.name}
            initials={d.logoInitials}
            logoUrl={d.logoUrl}
            website={d.website}
            allowFavicon
            size={open ? (hub ? "md" : "sm") : "xs"}
          />
          {open ? (
            <>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-display font-medium tracking-[-0.03em] text-ink",
                    hub ? "text-[13px]" : "text-[12px]",
                  )}
                >
                  {d.name}
                </p>
                <p className="mt-px truncate text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {ROLE[d.kind]}
                </p>
              </div>
              {d.publicTeamCount && d.publicTeamCount > 0 && d.companyId ? (
                <NetworkNodeTeam
                  companyId={d.companyId}
                  avatars={d.publicTeamAvatars ?? []}
                  count={d.publicTeamCount}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {d.editable && !d.moreCount ? (
        <button
          type="button"
          title="Add"
          className={cn(
            "nodrag nopan absolute -bottom-7 left-1/2 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center",
            "rounded-full border border-line bg-surface text-muted",
            "opacity-0 transition-opacity group-hover/node:opacity-100",
            on && "opacity-100",
          )}
          onClick={(e) => {
            e.stopPropagation();
            d.onAdd?.(id, d);
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
