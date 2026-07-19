"use client";

import { useEffect, useState, useTransition } from "react";
import { cancelTeamInvitationFromPanel } from "@/features/team/actions";
import { fetchPendingTeamInvitesForPanel } from "@/features/team/panel-actions";
import type { TeamInvitation } from "@/features/team/types";

type Props = {
  companyId: string;
  /** Bump to refetch after a new invite. */
  refreshKey?: number;
};

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function GraphPendingInvites({ companyId, refreshKey = 0 }: Props) {
  const [invites, setInvites] = useState<TeamInvitation[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    void fetchPendingTeamInvitesForPanel(companyId).then((rows) => {
      if (!cancelled) setInvites(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId, refreshKey]);

  if (invites === null) return null;
  if (invites.length === 0) return null;

  function cancelInvite(id: string) {
    setBusyId(id);
    startTransition(async () => {
      const result = await cancelTeamInvitationFromPanel(id);
      setBusyId(null);
      if (result.ok) {
        setInvites((prev) => (prev ?? []).filter((i) => i.id !== id));
      }
    });
  }

  return (
    <div className="mt-3 border-t border-[#eef0f3] px-3 pt-3 pb-2">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
        Awaiting response ({invites.length})
      </p>
      <p className="mt-1 text-[11px] text-[#64748b]">
        Visible only to you — never on the public profile or map.
      </p>
      <ul className="mt-2 space-y-1.5">
        {invites.map((inv) => (
          <li
            key={inv.id}
            className="flex items-start gap-2 rounded-xl border border-dashed border-[#d1d5db] bg-[#f8fafc] px-2.5 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-[#64748b]">
                {inv.inviteName}
              </p>
              {inv.inviteTitle ? (
                <p className="truncate text-[11px] text-[#94a3b8]">
                  {inv.inviteTitle}
                </p>
              ) : null}
              <p className="mt-0.5 text-[10px] text-[#94a3b8]">
                {relativeTime(inv.createdAt)}
                {inv.role === "admin" ? " · Admin" : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={pending && busyId === inv.id}
              onClick={() => cancelInvite(inv.id)}
              className="shrink-0 text-[10px] font-semibold text-[#64748b] underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
