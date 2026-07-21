"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GettingStartedPill } from "@/components/activation/getting-started-pill";
import { WorkspaceAsideFooter } from "@/components/dashboard/workspace-aside-footer";
import { WorkspaceMobileNav } from "@/components/dashboard/workspace-mobile-nav";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { WORKSPACE_PAGE_META } from "@/components/dashboard/workspace-page-meta";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { NetworkMark } from "@/components/marketing/network-mark";
import type { ActivationChecklist } from "@/features/activation/checklist";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  children: ReactNode;
  active: WorkspaceContext | null;
  contexts: WorkspaceContext[];
  verified?: boolean;
  checklist?: ActivationChecklist | null;
  allowedSections?: WorkspaceSection[] | null;
  operatorBanner?: ReactNode;
};

export function WorkspaceShell({
  children,
  active,
  contexts,
  verified,
  checklist,
  allowedSections = null,
  operatorBanner = null,
}: Props) {
  const pathname = usePathname();
  const isGraph = pathname === "/dashboard" && active?.type !== "group";
  const meta =
    WORKSPACE_PAGE_META[pathname] ??
    Object.entries(WORKSPACE_PAGE_META).find(
      ([href]) => href !== "/dashboard" && pathname.startsWith(href),
    )?.[1] ??
    { title: "Workspace" };

  const publicHref =
    active?.type === "company"
      ? `/c/${active.slug}`
      : active?.type === "group"
        ? `/g/${active.slug}`
        : null;

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-[212px] shrink-0 flex-col border-r border-line/70 bg-[#f7f8f6] lg:flex">
        <div className="flex h-11 items-center gap-2 px-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ink transition-opacity hover:opacity-75"
          >
            <NetworkMark size={18} className="text-navy" />
            <span className="font-display text-[14px] font-semibold tracking-[-0.04em]">
              Linken
            </span>
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2.5">
          {active ? (
            <WorkspaceSwitcher
              active={active}
              contexts={contexts}
              verified={verified}
            />
          ) : (
            <div className="mb-4 rounded-xl border border-dashed border-line bg-surface/80 px-3 py-2.5">
              <p className="text-[12px] font-semibold text-ink">No company</p>
              <Link
                href="/onboarding"
                className="mt-1 inline-block text-[11px] font-semibold text-blue underline-offset-2 hover:underline"
              >
                Create company →
              </Link>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <WorkspaceNav
              companySlug={active?.type === "company" ? active.slug : null}
              groupSlug={active?.type === "group" ? active.slug : null}
              contextType={active?.type ?? null}
              allowedSections={allowedSections}
            />
          </div>

          <WorkspaceAsideFooter active={active} />
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col bg-[#f0f2f0]">
        {operatorBanner}

        {isGraph ? (
          <>
            <div className="pointer-events-none absolute top-3 right-3 z-40 flex items-center gap-2 sm:top-4 sm:right-4">
              {checklist && !checklist.complete ? (
                <div className="pointer-events-auto shrink-0">
                  <GettingStartedPill checklist={checklist} />
                </div>
              ) : null}
              {publicHref ? (
                <Link
                  href={publicHref}
                  className="pointer-events-auto inline-flex h-8 shrink-0 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink shadow-[0_8px_24px_rgba(8,20,18,0.06)] backdrop-blur-md transition-colors hover:bg-paper"
                >
                  Company
                </Link>
              ) : null}
            </div>
            <WorkspaceMobileNav
              pathname={pathname}
              companySlug={active?.type === "company" ? active.slug : null}
            />
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </>
        ) : (
          <>
            <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line/80 bg-[#f7f8f6]/90 px-4 py-2 backdrop-blur-md sm:h-11 sm:flex-nowrap sm:py-0 sm:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-[13px] font-semibold tracking-[-0.02em] text-ink">
                    {active?.type === "group" && pathname === "/dashboard"
                      ? "Company group"
                      : meta.title}
                  </h1>
                  {meta.description ? (
                    <p className="hidden truncate text-[11px] text-muted sm:block">
                      {meta.description}
                    </p>
                  ) : null}
                </div>
                {checklist && !checklist.complete ? (
                  <GettingStartedPill checklist={checklist} />
                ) : null}
              </div>
              {publicHref ? (
                <Link
                  href={publicHref}
                  className="inline-flex h-8 shrink-0 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
                >
                  {active?.type === "group" ? "Public group" : "Company"}
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className="inline-flex h-8 shrink-0 items-center rounded-full bg-navy px-3.5 text-[11px] font-semibold text-white"
                >
                  Create company
                </Link>
              )}
            </header>
            <WorkspaceMobileNav
              pathname={pathname}
              companySlug={active?.type === "company" ? active.slug : null}
            />
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}
