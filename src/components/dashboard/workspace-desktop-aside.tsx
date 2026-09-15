"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { WorkspaceAccountMenu } from "@/components/dashboard/workspace-account-menu";
import {
  IconExternal,
  IconSettings,
} from "@/components/dashboard/workspace-icons";
import { useNavCollapsed } from "@/components/dashboard/use-nav-collapsed";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { cn } from "@/lib/cn";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";
import { useMediaQuery } from "@/lib/use-media-query";

type Props = {
  active: WorkspaceContext | null;
  contexts: WorkspaceContext[];
  verified?: boolean;
  allowedSections?: WorkspaceSection[] | null;
  showDeveloperNav?: boolean;
  signedIn?: boolean;
  footer?: ReactNode;
};

/**
 * Desktop-only aside. Not in the DOM on phones — so if CSS fails to load
 * (email in-app browser), users do not see a raw unstyled nav dump.
 */
export function WorkspaceDesktopAside({
  active,
  allowedSections = null,
  showDeveloperNav = false,
  signedIn = true,
  footer,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { collapsed } = useNavCollapsed();
  if (!isDesktop) return null;

  /* Open by default: every destination named. The top-bar toggle collapses
     it to an icon rail, where names move to hover labels. */
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-line/55 bg-surface py-4 transition-[width] duration-200",
        collapsed ? "w-[76px] items-center" : "w-[248px] px-3",
      )}
    >
      <div className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-visible [scrollbar-width:none]">
        {signedIn ? (
          <WorkspaceNav
            companySlug={active?.type === "company" ? active.slug : null}
            groupSlug={active?.type === "group" ? active.slug : null}
            contextType={active?.type ?? null}
            allowedSections={allowedSections}
            showDeveloperNav={showDeveloperNav}
            compact={collapsed}
          />
        ) : null}
      </div>

      {footer ?? (
        <div
          className={cn(
            "mt-3 flex flex-col gap-1.5 border-t border-line/55 pt-3",
            collapsed ? "items-center" : "items-stretch",
          )}
        >
          {active?.type === "company" ? (
            <RailLink href={`/c/${active.slug}/edit`} label="Edit company" expanded={!collapsed}>
              <IconSettings />
            </RailLink>
          ) : null}
          <RailLink href="/" label="Back to site" expanded={!collapsed}>
            <IconExternal />
          </RailLink>
          {signedIn && active ? (
            <div className={collapsed ? "mt-1.5" : ""}>
              <WorkspaceAccountMenu active={active} compact={collapsed} />
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
}

function RailLink({
  href,
  label,
  expanded = false,
  children,
}: {
  href: string;
  label: string;
  expanded?: boolean;
  children: ReactNode;
}) {
  if (expanded) {
    return (
      <Link
        href={href}
        className="flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-ink/70 transition-colors hover:bg-mute hover:text-ink"
      >
        <span className="shrink-0 text-ink/55">{children}</span>
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      title={label}
      className="grid size-11 place-items-center rounded-xl text-ink/55 transition-colors hover:bg-mute hover:text-ink"
    >
      {children}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
