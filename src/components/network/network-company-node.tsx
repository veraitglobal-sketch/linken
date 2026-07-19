"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { LogoMark } from "@/components/ui/logo-mark";
import type { NetworkNodeData } from "@/features/network/types";
import { cn } from "@/lib/cn";

export type FlowNodeData = NetworkNodeData & {
  onSelect?: (data: NetworkNodeData) => void;
};

function NetworkCompanyNodeInner({ data }: NodeProps) {
  const d = data as FlowNodeData;
  const isHub = d.kind === "group";
  const isExternal = d.kind === "external";

  return (
    <button
      type="button"
      onClick={() => d.onSelect?.(d)}
      className={cn(
        "rounded-2xl border bg-white text-left shadow-[0_12px_40px_rgba(10,20,18,0.22)] transition-transform hover:scale-[1.02]",
        isHub
          ? "min-w-[200px] border-[#5ec4a8]/50 px-4 py-3.5"
          : "min-w-[168px] border-line px-3.5 py-3",
        isExternal && "opacity-90",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-[#5ec4a8]"
      />
      <div className="flex items-start gap-2.5">
        <LogoMark
          initials={d.logoInitials}
          size={isHub ? "md" : "sm"}
          className="bg-paper"
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
        className="!h-2 !w-2 !border-0 !bg-[#5ec4a8]"
      />
    </button>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
