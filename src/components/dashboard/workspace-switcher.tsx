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
  const multi = contexts.length > 1;
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

  if (!multi) {
    const href =
      active.type === "company" ? "/dashboard/settings" : "/dashboard/group";
    return (
      <Link
        href={href}
        className={cn(
          "group mb-5 flex items-center gap-2.5 rounded-xl bg-[#fafbfc] px-2.5 py-2 transition-colors hover:bg-[#f4f6f9]",
          draftActive
            ? "border border-dashed border-[#d4dae3]"
            : "border border-[#e8eaee] hover:border-[#d8dee8]",
        )}
        title={active.type === "company" ? "Company settings" : "Group"}
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
                  : "Workspace"
          }
          draft={draftActive}
        />
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative mb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl bg-[#fafbfc] px-2.5 py-2 text-left transition-colors hover:bg-[#f4f6f9]",
          draftActive
            ? "border border-dashed border-[#d4dae3]"
            : "border border-[#e8eaee] hover:border-[#d8dee8]",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <SwitcherMark ctx={active} />
        <SwitcherMeta
          name={active.name}
          subtitle={
            active.type === "group" ? "Group" : workspaceRoleLabel(active)
          }
          draft={draftActive}
        />
        <SwitcherChevron open={open} />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 z-50 w-full min-w-[220px] overflow-hidden rounded-xl border border-[#e8eaee] bg-white py-1 shadow-lg shadow-black/8"
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
                <SwitcherGroupLabel className="mt-1 border-t border-[#f1f5f9] pt-2">
                  Draft profiles you manage
                </SwitcherGroupLabel>
                <li className="px-2.5 pb-1">
                  <p className="text-[10px] leading-snug text-[#94a3b8]">
                    Not yet claimed by their owner.
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
          {active.type === "company" ? (
            <div className="border-t border-[#f1f5f9] px-1 py-1">
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2.5 py-2 text-[12px] font-semibold text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
              >
                Company settings
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
