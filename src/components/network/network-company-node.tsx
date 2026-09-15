"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { NetworkNodeHandles } from "@/components/network/network-node-handles";
import { LogoTile } from "@/components/ui/logo-tile";
import { ORG_CARD_W, ORG_HUB_W } from "@/features/network/layout-org";
import type { NetworkNodeData, NetworkNodeKind } from "@/features/network/types";
import { cn } from "@/lib/cn";

export type FlowNodeData = NetworkNodeData & {
  onSelect?: (id: string, data: NetworkNodeData) => void;
  onAdd?: (id: string, data: NetworkNodeData) => void;
  selected?: boolean;
  nodeId?: string;
  editable?: boolean;
  isHub?: boolean;
  /** Which sides the lines meet the card on. */
  direction?: "vertical" | "horizontal";
};

const ROLE: Record<NetworkNodeKind, string> = {
  group: "Group",
  company: "Company",
  subsidiary: "Subsidiary",
  partner: "Partner",
  client: "Client",
};

/* Small glyph per kind in the header — drawn for this map, not an icon set. */
function KindGlyph({ kind }: { kind: NetworkNodeKind }) {
  const common = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, fill: "none" };
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden>
      {kind === "partner" ? (
        <>
          <circle cx="4.5" cy="8" r="2.5" {...common} />
          <circle cx="11.5" cy="8" r="2.5" {...common} />
          <path d="M7 8h2" {...common} />
        </>
      ) : kind === "client" ? (
        <>
          <circle cx="8" cy="8" r="5.5" {...common} />
          <path d="m5.5 8.2 1.7 1.7 3.3-3.6" {...common} />
        </>
      ) : kind === "subsidiary" ? (
        <>
          <rect x="5.5" y="2" width="5" height="4" rx="1" {...common} />
          <path d="M8 6v3M4 12V9h8v3" {...common} />
        </>
      ) : (
        <>
          <rect x="3" y="3" width="10" height="10" rx="2" {...common} />
          <path d="M6 7h4M6 10h2" {...common} />
        </>
      )}
    </svg>
  );
}

/** Decorative port dots where lines meet the card (wiring handles sit on top). */
function PortDots({ horizontal = false }: { horizontal?: boolean }) {
  const dot = "absolute size-[6px] rounded-full border border-surface bg-[#b9c1bc]";
  return horizontal ? (
    <>
      <span aria-hidden className={`${dot} top-1/2 -left-[3px] -translate-y-1/2`} />
      <span aria-hidden className={`${dot} top-1/2 -right-[3px] -translate-y-1/2`} />
    </>
  ) : (
    <>
      <span aria-hidden className={`${dot} -top-[3px] left-1/2 -translate-x-1/2`} />
      <span aria-hidden className={`${dot} -bottom-[3px] left-1/2 -translate-x-1/2`} />
    </>
  );
}

/**
 * Flow-builder node. Linked companies are small cards — a navy header with
 * the kind and the profile handle, a white body with the name. The map's own
 * company is the starting pill at the top.
 */
function NetworkCompanyNodeInner({ id, data, selected }: NodeProps) {
  const d = data as FlowNodeData;
  const on = Boolean(selected || d.selected);
  const canWire = Boolean(d.editable) && d.kind !== "group" && !d.moreCount;
  const hub = Boolean(d.isHub);

  const select = () => d.onSelect?.(id, d);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select();
    }
  };

  if (hub) {
    return (
      <div className="linken-node group/node relative linken-node-enter" style={{ width: ORG_HUB_W }}>
        <NetworkNodeHandles canWire={canWire} />
        <div
          onClick={select}
          onKeyDown={onKey}
          role="button"
          tabIndex={0}
          aria-pressed={on}
          className={cn(
            "relative flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-full bg-surface pr-4 pl-1.5 text-left transition-shadow",
            on ? "ring-2 ring-navy" : "ring-[1.5px] ring-navy/70 hover:ring-navy",
            "shadow-[0_6px_16px_-10px_rgba(14,31,28,0.45)]",
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-lime text-navy">
            <LogoTile
              name={d.name}
              initials={d.logoInitials}
              logoUrl={d.logoUrl}
              website={d.website}
              allowFavicon
              size="xs"
              className="rounded-full!"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[8.5px] leading-none font-semibold tracking-[0.14em] text-muted uppercase">
              {ROLE[d.kind]}
            </span>
            <span className="mt-1 block truncate text-[12.5px] leading-none font-semibold text-ink">
              {d.name}
            </span>
          </span>
          <PortDots horizontal={d.direction === "horizontal"} />
        </div>
      </div>
    );
  }

  return (
    <div className="linken-node group/node relative linken-node-enter" style={{ width: ORG_CARD_W }}>
      <NetworkNodeHandles canWire={canWire} />

      <div
        onClick={select}
        onKeyDown={onKey}
        role="button"
        tabIndex={0}
        aria-pressed={on}
        className={cn(
          "relative w-full cursor-pointer rounded-[10px] bg-surface text-left transition-shadow",
          "shadow-[0_1px_2px_rgba(14,31,28,0.06),0_8px_18px_-12px_rgba(14,31,28,0.35)]",
          on ? "ring-2 ring-navy" : "ring-1 ring-line hover:ring-navy/40",
        )}
      >
        <div
          className={cn(
            "flex h-[34px] items-center gap-2 rounded-t-[10px] px-2",
            d.kind === "client" ? "bg-[#2b3a36]" : "bg-navy",
          )}
        >
          <span
            className={cn(
              "grid size-[18px] shrink-0 place-items-center rounded-full",
              d.kind === "partner" || d.kind === "company" ? "bg-lime text-navy" : "bg-white/15 text-white",
            )}
          >
            <KindGlyph kind={d.kind} />
          </span>
          <span className="text-[8.5px] leading-[1.15] font-semibold tracking-[0.1em] text-white uppercase">
            {ROLE[d.kind]}
          </span>
          <span className="ml-auto truncate font-mono text-[8px] text-on-navy-muted">{d.slug}</span>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2">
          <LogoTile
            name={d.name}
            initials={d.logoInitials}
            logoUrl={d.logoUrl}
            website={d.website}
            allowFavicon
            size="xs"
          />
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink">{d.name}</span>
          {d.domainVerified ? (
            <span title="Verified domain" className="grid size-4 shrink-0 place-items-center rounded-full bg-lime text-navy">
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only">Verified domain</span>
            </span>
          ) : null}
        </div>
        <PortDots horizontal={d.direction === "horizontal"} />
      </div>

      {d.editable && !d.moreCount ? (
        <button
          type="button"
          title="Add a company"
          className={cn(
            "nodrag nopan absolute -top-2 -right-2 z-10 grid size-6 place-items-center rounded-full bg-navy text-lime shadow-[0_6px_14px_-6px_rgba(14,31,28,0.6)]",
            "opacity-0 transition-opacity group-hover/node:opacity-100",
            on && "opacity-100",
          )}
          onClick={(e) => {
            e.stopPropagation();
            d.onAdd?.(id, d);
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Add a company</span>
        </button>
      ) : null}
    </div>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
