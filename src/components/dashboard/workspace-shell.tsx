"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SkipLink } from "@/components/a11y/skip-link";
import { WorkspaceDesktopAside } from "@/components/dashboard/workspace-desktop-aside";
import { WorkspaceMobileNav } from "@/components/dashboard/workspace-mobile-nav";
import { WORKSPACE_PAGE_META } from "@/components/dashboard/workspace-page-meta";
import {
  WorkspacePublicLink,
  WorkspaceShellChecklist,
  WorkspaceShellMenu,
  publicWorkspaceLabel,
} from "@/components/dashboard/workspace-shell-bits";
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
  showDeveloperNav?: boolean;
  operatorBanner?: ReactNode;
  signedIn?: boolean;
};

export function WorkspaceShell({
  children,
  active,
  contexts,
  verified,
  checklist,
  allowedSections = null,
  showDeveloperNav = false,
  operatorBanner = null,
  signedIn = true,
}: Props) {
  const pathname = usePathname();
  const isGraph = pathname === "/dashboard/map" && active?.type !== "group";
  const meta =
    WORKSPACE_PAGE_META[pathname] ??
    Object.entries(WORKSPACE_PAGE_META).find(
      ([href]) =>
        href !== "/dashboard" &&
        href !== "/dashboard/map" &&
        pathname.startsWith(href),
    )?.[1] ??
    { title: "Workspace" };

  const publicHref =
    active?.type === "company"
      ? `/c/${active.slug}`
      : active?.type === "group"
        ? `/g/${active.slug}`
        : null;
  const publicLabel = publicWorkspaceLabel(active);
  const menu = {
    active,
    allowedSections,
    showDeveloperNav,
    signedIn,
  };

  return (
    <div className="flex min-h-0 flex-1">
      <SkipLink />
      <WorkspaceDesktopAside
        active={active}
        contexts={contexts}
        verified={verified}
        allowedSections={allowedSections}
        showDeveloperNav={showDeveloperNav}
        signedIn={signedIn}
      />

      <div className="relative flex min-w-0 flex-1 flex-col bg-paper">
        {operatorBanner}

        {isGraph ? (
          <>
            <div className="pointer-events-none absolute top-3 right-3 z-40 flex items-center gap-2 sm:top-4 sm:right-4">
              <div className="pointer-events-auto">
                {signedIn ? (
                  <WorkspaceShellMenu {...menu} />
                ) : (
                  <Link
                    href="/login?next=/dashboard"
                    className="inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-[11px] font-semibold text-ink shadow-[0_8px_24px_rgba(8,20,18,0.06)]"
                  >
                    Sign in
                  </Link>
                )}
              </div>
              <div className="pointer-events-auto shrink-0">
                <WorkspaceShellChecklist
                  checklist={checklist}
                  signedIn={signedIn}
                />
              </div>
              {publicHref ? (
                <WorkspacePublicLink
                  href={publicHref}
                  label={publicLabel}
                  floating
                />
              ) : null}
            </div>
            {signedIn ? (
              <WorkspaceMobileNav
                pathname={pathname}
                companySlug={active?.type === "company" ? active.slug : null}
              />
            ) : null}
            <main
              id="main-content"
              tabIndex={-1}
              className="min-h-0 flex-1 overflow-hidden"
            >
              {children}
            </main>
          </>
        ) : (
          <>
            <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line/50 bg-surface/90 px-4 py-3 backdrop-blur-sm sm:h-14 sm:flex-nowrap sm:py-0 sm:px-7">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <WorkspaceShellMenu {...menu} />
                <div className="min-w-0 flex-1">
                  <h1 className="truncate font-display text-[16px] font-medium tracking-[-0.04em] text-ink">
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
                <WorkspaceShellChecklist
                  checklist={checklist}
                  signedIn={signedIn}
                />
              </div>
              {!signedIn ? (
                <Link
                  href="/login?next=/dashboard"
                  className="inline-flex h-8 shrink-0 items-center rounded-full bg-navy px-3.5 text-[11px] font-semibold text-white"
                >
                  Sign in
                </Link>
              ) : publicHref ? (
                <WorkspacePublicLink href={publicHref} label={publicLabel} />
              ) : (
                <Link
                  href="/onboarding"
                  className="inline-flex h-8 shrink-0 items-center rounded-full bg-navy px-3.5 text-[11px] font-semibold text-white"
                >
                  Create company
                </Link>
              )}
            </header>
            {signedIn ? (
              <WorkspaceMobileNav
                pathname={pathname}
                companySlug={active?.type === "company" ? active.slug : null}
              />
            ) : null}
            <main
              id="main-content"
              tabIndex={-1}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {children}
            </main>
          </>
        )}
      </div>
    </div>
  );
}
