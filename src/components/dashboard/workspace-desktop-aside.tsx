"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { WorkspaceAsideFooter } from "@/components/dashboard/workspace-aside-footer";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { NetworkMark } from "@/components/marketing/network-mark";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";
import { useMediaQuery } from "@/lib/use-media-query";

type Props = {
  active: WorkspaceContext | null;
  contexts: WorkspaceContext[];
  verified?: boolean;
  allowedSections?: WorkspaceSection[] | null;
  footer?: ReactNode;
};

/**
 * Desktop-only aside. Not in the DOM on phones — so if CSS fails to load
 * (email in-app browser), users do not see a raw unstyled nav dump.
 */
export function WorkspaceDesktopAside({
  active,
  contexts,
  verified,
  allowedSections = null,
  footer,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  if (!isDesktop) return null;

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-line/55 bg-surface">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-ink transition-opacity hover:opacity-75"
        >
          <NetworkMark size={19} className="text-navy" />
          <span className="font-display text-[15px] font-semibold tracking-[-0.045em]">
            Hansala
          </span>
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
        {active ? (
          <div className="mb-5 rounded-2xl border border-line/65 bg-paper/70 px-0.5 py-0.5">
            <WorkspaceSwitcher
              active={active}
              contexts={contexts}
              verified={verified}
            />
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-dashed border-line bg-paper/50 px-3.5 py-3">
            <p className="text-[12px] font-semibold text-ink">No company</p>
            <Link
              href="/onboarding"
              className="mt-1 inline-block text-[11px] font-semibold text-blue underline-offset-2 hover:underline"
            >
              Create company →
            </Link>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-0.5">
          <WorkspaceNav
            companySlug={active?.type === "company" ? active.slug : null}
            groupSlug={active?.type === "group" ? active.slug : null}
            contextType={active?.type ?? null}
            allowedSections={allowedSections}
          />
        </div>

        {footer ?? <WorkspaceAsideFooter active={active} />}
      </div>
    </aside>
  );
}
