"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { NetworkMark } from "@/components/marketing/network-mark";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext | null;
  allowedSections?: WorkspaceSection[] | null;
};

/** Full workspace nav for phones — desktop uses the aside. */
export function WorkspaceMobileMenu({
  active,
  allowedSections = null,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-[11px] font-semibold text-ink"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        Menu
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper" role="dialog">
          <div className="flex h-12 items-center justify-between border-b border-line/70 bg-surface px-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-ink"
              onClick={() => setOpen(false)}
            >
              <NetworkMark size={18} className="text-navy" />
              <span className="font-display text-[14px] font-semibold tracking-[-0.04em]">
                Hansala
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[12px] font-semibold text-muted"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            {active ? (
              <p className="mb-3 truncate px-2 text-[12px] font-semibold text-ink">
                {active.name}
              </p>
            ) : null}
            <WorkspaceNav
              companySlug={active?.type === "company" ? active.slug : null}
              groupSlug={active?.type === "group" ? active.slug : null}
              contextType={active?.type ?? null}
              allowedSections={allowedSections}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
