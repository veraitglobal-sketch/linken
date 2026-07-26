"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GettingStartedPill } from "@/components/activation/getting-started-pill";
import { WorkspaceDesktopAside } from "@/components/dashboard/workspace-desktop-aside";
import { WorkspaceMobileMenu } from "@/components/dashboard/workspace-mobile-menu";
import { WorkspaceMobileNav } from "@/components/dashboard/workspace-mobile-nav";
import { WORKSPACE_PAGE_META } from "@/components/dashboard/workspace-page-meta";
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
      <WorkspaceDesktopAside
        active={active}
        contexts={contexts}
        verified={verified}
        allowedSections={allowedSections}
      />

      <div className="relative flex min-w-0 flex-1 flex-col bg-paper">
        {operatorBanner}

        {isGraph ? (
          <>
            <div className="pointer-events-none absolute top-3 right-3 z-40 flex items-center gap-2 sm:top-4 sm:right-4">
              <div className="pointer-events-auto">
                <WorkspaceMobileMenu
                  active={active}
                  allowedSections={allowedSections}
                />
              </div>
              {checklist && !checklist.complete ? (
                <div className="pointer-events-auto shrink-0">
                  <GettingStartedPill checklist={checklist} />
                </div>
              ) : null}
              {publicHref ? (
                <Link
                  href={publicHref}
                  className="pointer-events-auto inline-flex h-8 shrink-0 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink shadow-[0_8px_24px_rgba(8,20,18,0.06)] transition-colors hover:bg-paper"
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
            <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line/60 bg-surface/85 px-4 py-2.5 sm:h-12 sm:flex-nowrap sm:py-0 sm:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <WorkspaceMobileMenu
                  active={active}
                  allowedSections={allowedSections}
                />
                <div className="min-w-0 flex-1">
                  <h1 className="truncate font-display text-[15px] font-medium tracking-[-0.03em] text-ink">
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
