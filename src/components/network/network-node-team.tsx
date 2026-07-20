"use client";

import { useEffect, useState } from "react";
import { fetchPublicTeamForPanel } from "@/features/team/panel-actions";
import {
  initialsFromName,
  type PublicTeamMember,
} from "@/features/team/types";

type Props = {
  companyId: string;
  avatars: { photoUrl: string | null; initials: string }[];
  count: number;
};

export function NetworkNodeTeam({ companyId, avatars, count }: Props) {
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
        className="nodrag nopan relative z-20 flex shrink-0 items-center"
        title={
          expanded
            ? "Collapse team"
            : `${count} public team member${count === 1 ? "" : "s"}`
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
                className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[#e2e6e3] text-[7px] font-semibold text-[#3a423e]"
              >
                {(a.initials || "?").slice(0, 1)}
              </span>
            ),
          )}
        </div>
        <span className="ml-0.5 rounded-full bg-[#0e1f1c] px-1 py-px text-[8px] font-semibold text-white">
          +{count}
        </span>
      </button>
      {expanded && members && members.length > 0 ? (
        <TeamSatelliteArc members={members} />
      ) : null}
    </>
  );
}

function TeamSatelliteArc({ members }: { members: PublicTeamMember[] }) {
  const max = 8;
  const shown = members.slice(0, max);
  const extra = members.length - max;
  const slots = shown.length + (extra > 0 ? 1 : 0);
  const startDeg = -210;
  const endDeg = 30;
  const radius = 52;

  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-30 h-0 w-0">
      {shown.map((m, i) => {
        const t = slots <= 1 ? 0.5 : i / Math.max(slots - 1, 1);
        const deg = startDeg + t * (endDeg - startDeg);
        const rad = (deg * Math.PI) / 180;
        const tip = m.displayTitle
          ? `${m.displayName} · ${m.displayTitle}`
          : m.displayName;
        const initials = initialsFromName(m.displayName);
        return (
          <div
            key={`${m.displayName}-${i}`}
            className="pointer-events-auto absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2"
            style={{ left: Math.cos(rad) * radius, top: Math.sin(rad) * radius }}
            title={tip}
          >
            {m.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.photoUrl}
                alt=""
                className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-md"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#e2e6e3] text-[8px] font-semibold text-[#3a423e] shadow-md">
                {initials.slice(0, 2)}
              </span>
            )}
          </div>
        );
      })}
      {extra > 0 ? (
        <div
          className="pointer-events-auto absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#0e1f1c] text-[8px] font-semibold text-white shadow-md"
          style={{
            left:
              Math.cos(
                ((startDeg + (endDeg - startDeg)) * Math.PI) / 180,
              ) * radius,
            top:
              Math.sin(
                ((startDeg + (endDeg - startDeg)) * Math.PI) / 180,
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
