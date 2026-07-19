"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { LogoTile } from "@/components/ui/logo-tile";
import { fetchPublicTeamForPanel } from "@/features/team/panel-actions";
import {
  initialsFromName,
  type PublicTeamMember,
} from "@/features/team/types";
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
                : "border-[#3b82f6] opacity-100"
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
            "shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-colors duration-100",
            "active:cursor-grabbing",
            "border-l-[3px]",
            needsVerify
              ? "border-[#e2e8f0] border-l-[#f59e0b] bg-[#fafbfc] opacity-80"
              : "border-[#dce1e8] border-l-[#0b1220] bg-[#fbfbfc] hover:border-[#c5ccd6] hover:bg-white",
            d.kind === "partner" && !needsVerify && "border-l-[#64748b]",
            d.kind === "client" && "border-dashed",
            isSelected && !needsVerify && "border-[#c5ccd6] bg-white",
          )}
        >
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={canWire}
            className={cn(
              "linken-handle !h-2 !w-2 !min-h-0 !min-w-0 !border-[1.5px] !border-[#fbfbfc] !bg-[#94a3b8]",
              canWire ? "!cursor-crosshair" : "!pointer-events-none !opacity-0",
            )}
          />

          <div className="relative flex flex-col items-center gap-2.5 px-3 pt-3.5 pb-3">
            <LogoTile
              name={d.name}
              initials={d.logoInitials}
              logoUrl={d.logoUrl}
              website={d.website}
              size="md"
              muted={needsVerify}
            />
            {d.publicTeamCount && d.publicTeamCount > 0 && d.companyId ? (
              <TeamAvatarStack
                companyId={d.companyId}
                avatars={d.publicTeamAvatars ?? []}
                count={d.publicTeamCount}
              />
            ) : null}
            <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-[#8b93a1] uppercase">
              {ROLE_LABEL[d.kind]}
            </span>
          </div>

          <Handle
            type="source"
            position={Position.Right}
            isConnectable={canWire}
            className={cn(
              "linken-handle !h-2 !w-2 !min-h-0 !min-w-0 !border-[1.5px] !border-[#fbfbfc] !bg-[#64748b]",
              canWire ? "!cursor-crosshair" : "!pointer-events-none !opacity-0",
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

function TeamAvatarStack({
  companyId,
  avatars,
  count,
}: {
  companyId: string;
  avatars: { photoUrl: string | null; initials: string }[];
  count: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [members, setMembers] = useState<PublicTeamMember[] | null>(null);
  const shown = avatars.slice(0, 3);

  useEffect(() => {
    if (!expanded || !companyId) return;
    let cancelled = false;
    void fetchPublicTeamForPanel(companyId).then((rows) => {
      if (!cancelled) setMembers(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [expanded, companyId]);

  return (
    <>
      <button
        type="button"
        className="nodrag nopan absolute -top-1 -right-1 z-20 flex items-center"
        title={
          expanded
            ? "Collapse team"
            : `${count} public team member${count === 1 ? "" : "s"} — click to expand`
        }
        aria-label={
          expanded
            ? "Collapse public team"
            : `Expand ${count} public team members`
        }
        aria-expanded={expanded}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setExpanded((v) => !v);
        }}
      >
        <div className="flex -space-x-1.5">
          {shown.map((a, i) =>
            a.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${a.initials}-${i}`}
                src={a.photoUrl}
                alt=""
                className="h-4 w-4 rounded-full border border-white object-cover"
              />
            ) : (
              <span
                key={`${a.initials}-${i}`}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[#e2e8f0] text-[7px] font-semibold text-[#475569]"
              >
                {(a.initials || "?").slice(0, 1)}
              </span>
            ),
          )}
        </div>
        <span className="ml-0.5 rounded-full bg-[#0b1220] px-1 py-px text-[8px] font-semibold text-white">
          +{count}
        </span>
      </button>
      {expanded && members && members.length > 0 ? (
        <TeamSatelliteArc members={members} />
      ) : null}
    </>
  );
}

/** Visual-only satellites — not React Flow nodes, no edges, no panel. */
function TeamSatelliteArc({ members }: { members: PublicTeamMember[] }) {
  const max = 8;
  const shown = members.slice(0, max);
  const extra = members.length - max;
  const slots = shown.length + (extra > 0 ? 1 : 0);
  const startDeg = -210;
  const endDeg = 30;
  const radius = 48;

  return (
    <div
      className="pointer-events-none absolute top-[30px] left-1/2 z-30 h-0 w-0"
      aria-hidden={false}
    >
      {shown.map((m, i) => {
        const t = slots <= 1 ? 0.5 : i / Math.max(slots - 1, 1);
        const deg = startDeg + t * (endDeg - startDeg);
        const rad = (deg * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const tip = m.displayTitle
          ? `${m.displayName} · ${m.displayTitle}`
          : m.displayName;
        const initials = initialsFromName(m.displayName);
        return (
          <div
            key={`${m.displayName}-${i}`}
            className="pointer-events-auto absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            title={tip}
          >
            {m.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.photoUrl}
                alt=""
                className="h-6 w-6 rounded-full border border-white object-cover shadow-sm"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#e2e8f0] text-[8px] font-semibold text-[#475569] shadow-sm">
                {initials.slice(0, 2)}
              </span>
            )}
          </div>
        );
      })}
      {extra > 0 ? (
        <div
          className="pointer-events-auto absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-[#0b1220] text-[8px] font-semibold text-white shadow-sm"
          style={{
            left:
              Math.cos(
                ((startDeg +
                  ((slots - 1) / Math.max(slots - 1, 1)) *
                    (endDeg - startDeg)) *
                  Math.PI) /
                  180,
              ) * radius,
            top:
              Math.sin(
                ((startDeg +
                  ((slots - 1) / Math.max(slots - 1, 1)) *
                    (endDeg - startDeg)) *
                  Math.PI) /
                  180,
              ) * radius,
          }}
          title={`${extra} more`}
        >
          +{extra}
        </div>
      ) : null}
    </div>
  );
}

export const NetworkCompanyNode = memo(NetworkCompanyNodeInner);
