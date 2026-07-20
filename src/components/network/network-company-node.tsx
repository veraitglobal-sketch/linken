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
};

const ROLE_LABEL: Record<NetworkNodeKind, string> = {
  group: "Group",
  company: "Company",
  subsidiary: "Child firm",
  partner: "Partner",
  client: "Client",
};

/** Compact company card on the map — readable, not ornamental. */
function NetworkCompanyNodeInner({ id, data, selected }: NodeProps) {
  const d = data as FlowNodeData;
  const isSelected = Boolean(selected || d.selected);
  const canWire = Boolean(d.editable) && d.kind !== "group" && !d.moreCount;
  const meta = [d.category, d.city].filter(Boolean).join(" · ");
  const needsVerify =
    d.kind !== "group" && !d.moreCount && d.domainVerified === false;

  return (
    <div className="linken-node group/node relative flex w-[132px] flex-col items-center">
      <div className="relative w-full">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-1.5 rounded-[14px] border transition-opacity duration-100",
            isSelected
              ? needsVerify
                ? "border-[#f59e0b] opacity-100"
                : "border-[#1a5c51] opacity-100"
              : "border-transparent opacity-0",
          )}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => d.onSelect?.(id, d)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              d.onSelect?.(id, d);
            }
          }}
          className={cn(
            "relative w-full cursor-grab rounded-[12px] border text-center",
            "shadow-[0_2px_8px_rgba(8,20,18,0.06)] transition-colors duration-100",
            "active:cursor-grabbing",
            "border-l-[3px]",
            needsVerify
              ? "border-[#e2e8f0] border-l-[#f59e0b] bg-[#fafbfc] opacity-80"
              : "border-[#dce1e8] border-l-[#0e1f1c] bg-white hover:border-[#c5ccd6]",
            d.kind === "partner" && !needsVerify && "border-l-[#1a5c51]",
            d.kind === "client" && "border-dashed",
            isSelected && !needsVerify && "border-[#c5ccd6] bg-white",
          )}
        >
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={canWire}
            className={cn(
              "linken-handle !h-2.5 !w-2.5 !min-h-0 !min-w-0 !border-[1.5px] !border-white !bg-[#1a5c51]",
              canWire
                ? "!cursor-crosshair !opacity-100"
                : "!pointer-events-none !opacity-0",
            )}
          />

          <div className="relative flex flex-col items-center gap-2 px-3 pt-3 pb-2.5">
            <LogoTile
              name={d.name}
              initials={d.logoInitials}
              logoUrl={d.logoUrl}
              website={d.website}
              size="md"
              muted={needsVerify}
            />
            {d.publicTeamCount && d.publicTeamCount > 0 && d.companyId ? (
              <NetworkNodeTeam
                companyId={d.companyId}
                avatars={d.publicTeamAvatars ?? []}
                count={d.publicTeamCount}
              />
            ) : null}
            <span className="text-[9px] font-semibold tracking-[0.12em] text-[#8b93a1] uppercase">
              {ROLE_LABEL[d.kind]}
            </span>
          </div>

          <Handle
            type="source"
            position={Position.Right}
            isConnectable={canWire}
            className={cn(
              "linken-handle !h-2.5 !w-2.5 !min-h-0 !min-w-0 !border-[1.5px] !border-white !bg-[#0e1f1c]",
              canWire
                ? "!cursor-crosshair !opacity-100"
                : "!pointer-events-none !opacity-0",
            )}
          />
        </div>

        {d.editable && !d.moreCount ? (
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 right-0 z-10 flex translate-x-full -translate-y-1/2 items-center",
              "opacity-0 transition-opacity duration-120",
              "group-hover/node:opacity-100",
              isSelected && "opacity-100",
            )}
          >
            <div className="h-px w-5 bg-[#c5ccd6]" />
            <button
              type="button"
              title="Add company"
              className="nodrag nopan pointer-events-auto ml-1.5 flex h-6 w-6 items-center justify-center rounded-[6px] border border-[#dce1e8] bg-white text-ink shadow-sm transition-colors hover:border-ink"
              onClick={(e) => {
                e.stopPropagation();
                d.onAdd?.(id, d);
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-2 w-[148px] px-1 text-center">
        <p
          className={cn(
            "truncate text-[12px] font-semibold tracking-[-0.02em]",
            needsVerify ? "text-[#94a3b8]" : "text-ink",
          )}
        >
          {d.name}
        </p>
        {needsVerify ? (
          <p className="mt-0.5 text-[10px] font-semibold text-[#d97706]">
            Verify domain
          </p>
        ) : meta ? (
          <p className="mt-0.5 truncate text-[10px] text-[#94a3b8]">{meta}</p>
        ) : null}
      </div>
    </div>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
