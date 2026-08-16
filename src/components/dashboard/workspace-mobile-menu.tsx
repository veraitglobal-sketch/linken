"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import { useFocusTrap } from "@/components/a11y/use-focus-trap";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { NetworkMark } from "@/components/marketing/network-mark";
import { signOut } from "@/features/auth/actions";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext | null;
  allowedSections?: WorkspaceSection[] | null;
  showDeveloperNav?: boolean;
  partnerMode?: boolean;
  signedIn?: boolean;
};

/** Full workspace nav for phones — focus-trapped dialog. */
export function WorkspaceMobileMenu({
  active,
  allowedSections = null,
  showDeveloperNav = false,
  partnerMode = false,
  signedIn = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(open, close, panelRef);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3.5 text-[12px] font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-soft)]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? "workspace-mobile-menu" : undefined}
      >
        Menu
      </button>

      {open ? (
        <div
          id="workspace-mobile-menu"
          ref={panelRef}
          className="fixed inset-0 z-50 flex flex-col bg-paper"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="flex h-14 items-center justify-between border-b border-line/55 bg-surface px-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 text-ink"
              onClick={close}
            >
              <NetworkMark size={19} className="text-navy" />
              <span
                id={titleId}
                className="font-display text-[15px] font-semibold tracking-[-0.045em]"
              >
                Hansala
              </span>
            </Link>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-[12px] font-semibold text-muted"
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
                showDeveloperNav={showDeveloperNav}
                partnerMode={partnerMode}
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
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-line/70 bg-paper text-[13px] font-semibold text-ink"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/login?next=/dashboard"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-navy text-[13px] font-semibold text-white"
                onClick={close}
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
