"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { LogoMark } from "@/components/ui/logo-mark";
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
  subsidiary: "Subsidiary",
  partner: "Partner",
  client: "Client",
};

const ROLE_DOT: Record<NetworkNodeKind, string> = {
  group: "bg-[#334155]",
  company: "bg-[#0b1220]",
  subsidiary: "bg-[#64748b]",
  partner: "bg-[#3b82f6]",
  client: "bg-[#94a3b8]",
};

function NetworkCompanyNodeInner({ id, data, selected }: NodeProps) {
  const d = data as FlowNodeData;
  const isHub = d.kind === "group";
  const isSelected = Boolean(selected || d.selected);
  const canWire = Boolean(d.editable) && d.kind !== "group" && !d.moreCount;
  const meta = isHub
    ? d.stats.companyCount != null
      ? `${d.stats.companyCount} entities`
      : "Hub"
    : [d.category, d.city].filter(Boolean).join(" · ") || "—";

  return (
    <div className="linken-node group/node relative">
      {/* n8n-style selection frame */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-[7px] rounded-[14px] border-2 transition-opacity duration-100",
          isSelected
            ? "border-[#3b82f6] opacity-100"
            : "border-transparent opacity-0",
        )}
      />

      {/* Floating actions above selected node */}
      {isSelected && d.editable && !d.moreCount ? (
        <div className="nodrag nopan absolute -top-11 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-[#e2e8f0] bg-white p-0.5 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
          {d.href && d.href !== "#" ? (
            <a
              href={d.href}
              title="Open profile"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-ink"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalIcon />
            </a>
          ) : null}
          <button
            type="button"
            title="Add company"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-ink"
            onClick={(e) => {
              e.stopPropagation();
              d.onAdd?.(id, d);
            }}
          >
            <PlusIcon />
          </button>
        </div>
      ) : null}

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
          "relative cursor-grab rounded-[10px] border bg-white text-left transition-[border-color,box-shadow] duration-150 active:cursor-grabbing",
          "border-[#e2e8f0] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)]",
          "hover:border-[#cbd5e1] hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)]",
          isHub ? "min-w-[220px]" : "min-w-[200px]",
          d.kind === "client" && "border-dashed",
          isSelected && "border-[#cbd5e1]",
        )}
      >
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={canWire}
          className={cn(
            "linken-handle !h-2.5 !w-2.5 !min-h-0 !min-w-0 !border-2 !border-white !bg-[#94a3b8]",
            canWire ? "!cursor-crosshair" : "!pointer-events-none !opacity-0",
          )}
        />

        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="relative shrink-0">
            <LogoMark
              initials={d.logoInitials}
              logoUrl={d.logoUrl}
              website={d.website}
              size="sm"
              className="rounded-lg"
            />
            <span
              aria-hidden
              className={cn(
                "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white",
                ROLE_DOT[d.kind],
              )}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94a3b8] uppercase">
                {ROLE_LABEL[d.kind]}
              </p>
              {d.trustLevel ? (
                <span className="truncate text-[10px] font-medium text-[#64748b]">
                  · {d.trustLevel}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-[13px] font-semibold tracking-[-0.02em] text-ink">
              {d.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[#64748b]">{meta}</p>
          </div>
        </div>

        {!isHub && !d.moreCount ? (
          <div className="flex items-center gap-3 border-t border-[#f1f5f9] px-3.5 py-1.5 text-[10px] font-medium text-[#94a3b8]">
            <span>
              <span className="tabular-nums text-[#475569]">
                {d.stats.confirmedPartners}
              </span>{" "}
              partners
            </span>
            <span>
              <span className="tabular-nums text-[#475569]">
                {d.stats.confirmedReferences}
              </span>{" "}
              refs
            </span>
          </div>
        ) : null}

        <Handle
          type="source"
          position={Position.Right}
          isConnectable={canWire}
          className={cn(
            "linken-handle !h-2.5 !w-2.5 !min-h-0 !min-w-0 !border-2 !border-white !bg-[#64748b]",
            canWire ? "!cursor-crosshair" : "!pointer-events-none !opacity-0",
          )}
        />
      </div>

      {/* n8n-style trailing + */}
      {d.editable && !d.moreCount ? (
        <div
          className={cn(
            "pointer-events-none absolute top-1/2 right-0 z-10 flex translate-x-full -translate-y-1/2 items-center transition-opacity duration-150",
            isSelected
              ? "opacity-100"
              : "opacity-0 group-hover/node:opacity-100",
          )}
        >
          <div className="relative flex h-px w-5 items-center bg-[#cbd5e1]">
            <span className="absolute right-0 h-1.5 w-1.5 translate-x-1/2 rounded-full border border-white bg-[#94a3b8]" />
          </div>
          <button
            type="button"
            title="Add company"
            className="nodrag nopan pointer-events-auto ml-2 flex h-6 w-6 items-center justify-center rounded-md border border-[#e2e8f0] bg-white text-[#475569] shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all hover:border-[#3b82f6] hover:text-[#3b82f6]"
            onClick={(e) => {
              e.stopPropagation();
              d.onAdd?.(id, d);
            }}
          >
            <PlusIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5h5v5M19 5l-9 9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
