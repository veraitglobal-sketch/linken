"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SkipLink } from "@/components/a11y/skip-link";
import { WorkspaceDesktopAside } from "@/components/dashboard/workspace-desktop-aside";
import { WorkspaceMobileNav } from "@/components/dashboard/workspace-mobile-nav";
import {
  WorkspacePublicLink,
  WorkspaceShellChecklist,
  WorkspaceShellMenu,
  publicWorkspaceLabel,
} from "@/components/dashboard/workspace-shell-bits";
import { MapChromeSlotProvider } from "@/components/network/map-chrome-slot";
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
          <MapChromeSlotProvider
            extras={
              <>
                <div className="pointer-events-auto">
                  {signedIn ? (
                    <WorkspaceShellMenu {...menu} />
                  ) : (
                    <Link
                      href="/login?next=/dashboard"
                      className="inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-[11px] font-semibold text-ink"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
                <WorkspaceShellChecklist
                  checklist={checklist}
                  signedIn={signedIn}
                />
              </>
            }
          >
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
          </MapChromeSlotProvider>
        ) : (
          <>
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-7">
              <WorkspaceShellMenu {...menu} />
              <div className="ml-auto flex items-center gap-2">
                <WorkspaceShellChecklist
                  checklist={checklist}
                  signedIn={signedIn}
                />
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
              </div>
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
