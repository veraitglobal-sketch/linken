"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { NetworkMark } from "@/components/marketing/network-mark";
import { signOut } from "@/features/auth/actions";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext | null;
  allowedSections?: WorkspaceSection[] | null;
  signedIn?: boolean;
};

/** Full workspace nav for phones — desktop uses the aside. */
export function WorkspaceMobileMenu({
  active,
  allowedSections = null,
  signedIn = true,
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
          <div className="flex h-14 items-center justify-between border-b border-line/55 bg-surface px-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-ink"
              onClick={() => setOpen(false)}
            >
              <NetworkMark size={19} className="text-navy" />
              <span className="font-display text-[15px] font-semibold tracking-[-0.045em]">
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
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
            {signedIn && active ? (
              <p className="mb-4 truncate px-2.5 text-[12px] font-semibold text-ink">
                {active.name}
              </p>
            ) : null}
            {signedIn ? (
              <WorkspaceNav
                companySlug={active?.type === "company" ? active.slug : null}
                groupSlug={active?.type === "group" ? active.slug : null}
                contextType={active?.type ?? null}
                allowedSections={allowedSections}
              />
            ) : (
              <p className="px-2.5 text-[13px] text-muted">
                Sign in to open your workspace.
              </p>
            )}
          </div>
          <div className="border-t border-line/55 bg-surface px-3 py-3">
            {signedIn ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-line/70 bg-paper text-[13px] font-semibold text-ink"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/login?next=/dashboard"
                className="flex h-10 w-full items-center justify-center rounded-xl bg-navy text-[13px] font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
