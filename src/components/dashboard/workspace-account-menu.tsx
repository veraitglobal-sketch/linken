"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/features/auth/actions";
import { workspaceRoleLabel } from "@/features/workspace/role-label";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext;
};

/** Account chip — click for Sign out (and switch account). */
export function WorkspaceAccountMenu({ active }: Props) {
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

  return (
    <div ref={rootRef} className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-2xl border border-line/55 bg-paper/60 px-2.5 py-2 text-left transition-colors hover:bg-navy/[0.035]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/[0.08] text-[11px] font-semibold text-navy">
          {active.initials.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-ink">
            {active.name}
          </p>
          <p className="truncate text-[10px] text-muted">
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
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] font-semibold text-ink transition-colors hover:bg-navy/[0.035]"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
