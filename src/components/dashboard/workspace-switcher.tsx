"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SwitcherChevron,
  SwitcherGroupLabel,
  SwitcherMark,
  SwitcherMeta,
  SwitcherRow,
} from "@/components/dashboard/workspace-switcher-parts";
import { signOut } from "@/features/auth/actions";
import {
  isDraftWorkspace,
  workspaceRoleLabel,
} from "@/features/workspace/role-label";
import type { WorkspaceContext } from "@/features/workspace/types";
import { cn } from "@/lib/cn";

type Props = {
  active: WorkspaceContext;
  contexts: WorkspaceContext[];
  verified?: boolean;
};

export function WorkspaceSwitcher({ active, contexts, verified }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const draftActive = isDraftWorkspace(active);

  const { companies, drafts } = useMemo(() => {
    const companies: WorkspaceContext[] = [];
    const drafts: WorkspaceContext[] = [];
    for (const ctx of contexts) {
      if (isDraftWorkspace(ctx)) drafts.push(ctx);
      else companies.push(ctx);
    }
    return { companies, drafts };
  }, [contexts]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-navy/[0.035]",
          draftActive && "ring-1 ring-dashed ring-[#c5cdc8]",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <SwitcherMark ctx={active} />
        <SwitcherMeta
          name={active.name}
          subtitle={
            draftActive
              ? workspaceRoleLabel(active)
              : active.type === "group"
                ? "Group"
                : verified
                  ? "Verified workspace"
                  : workspaceRoleLabel(active)
          }
          draft={draftActive}
        />
        <SwitcherChevron open={open} />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 z-50 w-full min-w-[220px] overflow-hidden rounded-2xl border border-line/80 bg-surface py-1.5 shadow-[0_18px_48px_rgba(8,20,18,0.12)]"
        >
          <ul className="max-h-72 overflow-y-auto py-1">
            {companies.length > 0 ? (
              <SwitcherGroupLabel>Your companies</SwitcherGroupLabel>
            ) : null}
            {companies.map((ctx) => (
              <SwitcherRow
                key={`${ctx.type}:${ctx.id}`}
                ctx={ctx}
                active={active}
              />
            ))}
            {drafts.length > 0 ? (
              <>
                <SwitcherGroupLabel className="mt-1 border-t border-line pt-2">
                  Branch drafts
                </SwitcherGroupLabel>
                <li className="px-2.5 pb-1">
                  <p className="text-[10px] leading-snug text-muted">
                    Group subsidiaries waiting to be claimed.
                  </p>
                </li>
                {drafts.map((ctx) => (
                  <SwitcherRow
                    key={`${ctx.type}:${ctx.id}`}
                    ctx={ctx}
                    active={active}
                  />
                ))}
              </>
            ) : null}
          </ul>
          <div className="border-t border-line px-1 py-1">
            <Link
              href="/dashboard/workspaces/new"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2.5 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
            >
              Add workspace
            </Link>
            {active.type === "company" ? (
              <Link
                href={`/c/${active.slug}/edit`}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2.5 py-2 text-[12px] font-semibold text-muted transition-colors hover:bg-paper hover:text-ink"
              >
                Edit company
              </Link>
            ) : null}
            <form action={signOut}>
              <button
                type="submit"
                className="block w-full rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold text-muted transition-colors hover:bg-paper hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
