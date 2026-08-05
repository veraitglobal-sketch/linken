"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
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
  /** Hub / root firm — slightly stronger card. */
  isHub?: boolean;
};

const ROLE_LABEL: Record<NetworkNodeKind, string> = {
  group: "Group",
  company: "Company",
  subsidiary: "Subsidiary",
  partner: "Partner",
  client: "Client",
};

const HANDLE = cn(
  "linken-handle !h-3 !w-3 !min-h-0 !min-w-0 !border-[1.5px] !border-white !bg-navy !z-20",
);

function wireClass(can: boolean) {
  return can
    ? "!pointer-events-auto !cursor-crosshair !opacity-100"
    : "!pointer-events-none !opacity-0";
}

/** Premium card — hub emphasis, quiet partners, handles outside click target. */
function NetworkCompanyNodeInner({ id, data, selected }: NodeProps) {
  const d = data as FlowNodeData;
  const isSelected = Boolean(selected || d.selected);
  const canWire = Boolean(d.editable) && d.kind !== "group" && !d.moreCount;
  const needsVerify =
    d.kind !== "group" && !d.moreCount && d.domainVerified === false;
  const isHub = Boolean(d.isHub);
  const isPartner = d.kind === "partner" || d.kind === "client";
  // Structure (group/company/subsidiary) always reads full. Partners stay
  // logo-only until clicked — quieter, less competing with the ownership tree.
  const expanded = !isPartner || isSelected;

  return (
    <div
      className={cn(
        "linken-node group/node relative linken-node-enter",
        expanded ? (isHub ? "w-[164px]" : "w-[150px]") : "w-11",
      )}
    >
      <Handle
        id="left-t"
        type="target"
        position={Position.Left}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />
      <Handle
        id="left-s"
        type="source"
        position={Position.Left}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />

      <Handle
        id="top-t"
        type="target"
        position={Position.Top}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />
      <Handle
        id="top-s"
        type="source"
        position={Position.Top}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />

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
          "relative w-full cursor-grab border bg-surface text-left",
          "transition-[border-color,box-shadow,transform,width] duration-150 active:cursor-grabbing",
          expanded ? (isHub ? "rounded-2xl" : "rounded-xl") : "rounded-full",
          d.kind === "client" ? "border-dashed border-line" : "border-line/90",
          isPartner && !isSelected && "opacity-[0.9]",
          isHub && !isSelected && "border-navy/20 ring-1 ring-navy/[0.06]",
          isSelected
            ? "border-blue/40 shadow-[0_0_0_2px_rgba(26,92,81,0.1),0_10px_24px_rgba(8,20,18,0.07)]"
            : cn(
                "shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_4px_14px_rgba(8,20,18,0.04)]",
                "hover:border-navy/15 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_10px_22px_rgba(8,20,18,0.06)]",
              ),
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2.5",
            expanded ? (isHub ? "px-3.5 py-3" : "px-3 py-2.5") : "p-1",
          )}
        >
          <LogoTile
            name={d.name}
            initials={d.logoInitials}
            logoUrl={d.logoUrl}
            website={d.website}
            allowFavicon
            size={expanded ? (isHub ? "md" : "sm") : "xs"}
          />
          {expanded ? (
            <>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-semibold tracking-[-0.025em] text-ink",
                    isHub ? "text-[13px]" : "text-[12px]",
                  )}
                >
                  {d.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-medium text-muted">
                  {ROLE_LABEL[d.kind]}
                  {needsVerify ? " · Unverified" : ""}
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

      <Handle
        id="right-t"
        type="target"
        position={Position.Right}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />
      <Handle
        id="right-s"
        type="source"
        position={Position.Right}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />

      <Handle
        id="bottom-t"
        type="target"
        position={Position.Bottom}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />
      <Handle
        id="bottom-s"
        type="source"
        position={Position.Bottom}
        isConnectable={canWire}
        isConnectableStart={canWire}
        isConnectableEnd={canWire}
        className={cn(HANDLE, wireClass(canWire))}
      />

      {d.editable && !d.moreCount ? (
        <button
          type="button"
          title="Add"
          className={cn(
            "nodrag nopan absolute -bottom-8 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center",
            "rounded-full border border-line bg-surface text-ink shadow-sm",
            "opacity-0 transition-opacity group-hover/node:opacity-100",
            isSelected && "opacity-100",
          )}
          onClick={(e) => {
            e.stopPropagation();
            d.onAdd?.(id, d);
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
