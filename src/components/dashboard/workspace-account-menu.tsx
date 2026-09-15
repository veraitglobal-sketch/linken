"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/features/auth/actions";
import { workspaceRoleLabel } from "@/features/workspace/role-label";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext;
  /** Avatar-only button for the icon rail; menu opens to the right. */
  compact?: boolean;
};

/** Account chip — tap to open Sign out (single sign-out entry on desktop). */
export function WorkspaceAccountMenu({ active, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (compact) {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 place-items-center rounded-full bg-navy text-[13px] font-semibold text-lime transition-opacity hover:opacity-85"
          aria-expanded={open}
          aria-haspopup="menu"
          title={`${active.name} · ${workspaceRoleLabel(active)}`}
        >
          {active.initials.slice(0, 1)}
          <span className="sr-only">Account menu</span>
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute bottom-0 left-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-line/80 bg-surface py-1 shadow-[0_18px_48px_rgba(8,20,18,0.12)]"
          >
            <div className="border-b border-line px-3 py-2.5">
              <p className="truncate text-[13px] font-semibold text-ink">{active.name}</p>
              <p className="truncate text-[11px] text-muted">{workspaceRoleLabel(active)}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center px-3 py-2.5 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-mute"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left ring-1 ring-line/70 transition-colors hover:bg-mute"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-semibold text-lime">
          {active.initials.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">{active.name}</p>
          <p className="truncate text-[12px] text-muted">
            {workspaceRoleLabel(active)}
          </p>
        </div>
        <svg
          viewBox="0 0 16 16"
          className={`h-3.5 w-3.5 shrink-0 text-plus transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M4.47 6.47a.75.75 0 0 1 1.06 0L8 8.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-[calc(100%+6px)] left-0 z-50 w-full overflow-hidden rounded-2xl border border-line/80 bg-surface py-1 shadow-[0_18px_48px_rgba(8,20,18,0.12)]"
        >
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center px-3 py-2.5 text-left text-[12px] font-semibold text-ink transition-colors hover:bg-navy/[0.035]"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
