"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SkipLink } from "@/components/a11y/skip-link";
import { WorkspaceDesktopAside } from "@/components/dashboard/workspace-desktop-aside";
import { WorkspaceMobileNav } from "@/components/dashboard/workspace-mobile-nav";
import { WorkspaceTopbar } from "@/components/dashboard/workspace-topbar";
import {
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

  const topbar = (
    <WorkspaceTopbar
      active={active}
      contexts={contexts}
      verified={verified}
      signedIn={signedIn}
      menu={<WorkspaceShellMenu {...menu} />}
      checklist={
        <WorkspaceShellChecklist checklist={checklist} signedIn={signedIn} />
      }
      publicHref={publicHref}
      publicLabel={publicLabel}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SkipLink />
      {topbar}
      <div className="flex min-h-0 flex-1">
        <WorkspaceDesktopAside
          active={active}
          contexts={contexts}
          verified={verified}
          allowedSections={allowedSections}
          showDeveloperNav={showDeveloperNav}
          signedIn={signedIn}
        />

        <div className="relative flex min-w-0 flex-1 flex-col bg-[#f4f6f1]">
          {operatorBanner}
          {signedIn ? (
            <WorkspaceMobileNav
              pathname={pathname}
              companySlug={active?.type === "company" ? active.slug : null}
            />
          ) : null}
          {isGraph ? (
            <MapChromeSlotProvider extras={null}>
              <main
                id="main-content"
                tabIndex={-1}
                className="min-h-0 flex-1 overflow-hidden"
              >
                {children}
              </main>
            </MapChromeSlotProvider>
          ) : (
            <main
              id="main-content"
              tabIndex={-1}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {children}
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
