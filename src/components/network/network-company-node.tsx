"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { LogoMark } from "@/components/ui/logo-mark";
import type { NetworkNodeData } from "@/features/network/types";
import { cn } from "@/lib/cn";

export type FlowNodeData = NetworkNodeData & {
  onSelect?: (id: string, data: NetworkNodeData) => void;
  selected?: boolean;
  nodeId?: string;
};

function NetworkCompanyNodeInner({ id, data }: NodeProps) {
  const d = data as FlowNodeData;
  const isHub = d.kind === "group";
  const isExternal = d.kind === "external";
  const isSelected = Boolean(d.selected);

  return (
    <button
      type="button"
      onClick={() => d.onSelect?.(id, d)}
      className={cn(
        "rounded-2xl border bg-white text-left shadow-[0_12px_40px_rgba(10,20,18,0.22)] transition-[transform,box-shadow,border-color] duration-150 ease-out hover:scale-[1.02] hover:shadow-[0_18px_48px_rgba(10,20,18,0.32)]",
        isHub
          ? "min-w-[200px] border-[#5ec4a8]/50 px-4 py-3.5"
          : "min-w-[168px] border-line px-3.5 py-3",
        isExternal && "opacity-90",
        isSelected && "border-[#1f6b5c] shadow-[0_18px_48px_rgba(10,20,18,0.32)]",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-[#5ec4a8]"
      />
      <div className="flex items-start gap-2.5">
        <LogoMark
          initials={d.logoInitials}
          logoUrl={d.logoUrl}
          size={isHub ? "md" : "sm"}
        />
        <div className="min-w-0">
          <p
            className={cn(
              "font-display font-medium tracking-[-0.03em] text-ink",
              isHub ? "text-[16px]" : "text-[14px]",
            )}
          >
            {d.name}
          </p>
          {isHub && d.stats.companyCount != null ? (
            <p className="mt-1 text-[11px] text-ink-soft">
              {d.stats.companyCount} companies
              {d.stats.countryCount
                ? ` · ${d.stats.countryCount} countries`
                : ""}
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-ink-soft">
              {[d.category, d.city].filter(Boolean).join(" · ") || "—"}
            </p>
          )}
          {d.trustLevel ? (
            <div className="mt-1.5">
              <TrustLevelBadge level={d.trustLevel} />
            </div>
          ) : null}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-[#5ec4a8]"
      />
    </button>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
