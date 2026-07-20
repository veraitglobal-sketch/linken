"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { GettingStartedPill } from "@/components/activation/getting-started-pill";
import { WorkspaceAsideFooter } from "@/components/dashboard/workspace-aside-footer";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { WORKSPACE_PAGE_META } from "@/components/dashboard/workspace-page-meta";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { NetworkMark } from "@/components/marketing/network-mark";
import type { ActivationChecklist } from "@/features/activation/checklist";
import type { WorkspaceSection } from "@/features/workspace/sections";
import type { WorkspaceContext } from "@/features/workspace/types";
import { cn } from "@/lib/cn";

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
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#e8eaee] bg-white lg:flex">
        <div className="flex h-12 items-center gap-2.5 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ink transition-opacity hover:opacity-80"
          >
            <NetworkMark size={20} className="text-ink" />
            <span className="text-[15px] font-semibold tracking-[-0.03em]">
              Linken
            </span>
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          {active ? (
            <WorkspaceSwitcher
              active={active}
              contexts={contexts}
              verified={verified}
            />
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-[#e2e8f0] px-3 py-3">
              <p className="text-[13px] font-semibold text-ink">No company</p>
              <Link
                href="/onboarding"
                className="mt-1 inline-block text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
              >
                Create company →
              </Link>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
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

      <div className="flex min-w-0 flex-1 flex-col bg-[#f6f7f9]">
        {operatorBanner}
        <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[#e8eaee] bg-white/90 px-4 py-2 backdrop-blur-sm sm:h-12 sm:flex-nowrap sm:py-0 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">
                {active?.type === "group" && pathname === "/dashboard"
                  ? "Company group"
                  : meta.title}
              </h1>
              {meta.description && !isGraph ? (
                <p className="hidden truncate text-[11px] text-[#94a3b8] sm:block">
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
              className="inline-flex h-8 shrink-0 items-center rounded-lg border border-[#e2e8f0] bg-white px-3 text-[11px] font-semibold text-ink transition-colors hover:bg-[#f8fafc]"
            >
              {active?.type === "group" ? "Public group" : "Public profile"}
            </Link>
          ) : (
            <Link
              href="/onboarding"
              className="inline-flex h-8 shrink-0 items-center rounded-lg bg-ink px-3 text-[11px] font-semibold text-white"
            >
              Create company
            </Link>
          )}
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-[#e8eaee] bg-white px-3 py-2 lg:hidden">
          {[
            ["/dashboard", "Network"],
            ["/dashboard/structure", "Structure"],
            ["/dashboard/insights", "Insights"],
            ["/dashboard/inbox", "Inbox"],
            ["/dashboard/partners", "Partners"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                pathname === href
                  ? "bg-[#eef1f6] font-semibold text-ink"
                  : "text-[#64748b]",
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div
          className={cn(
            "min-h-0 flex-1",
            isGraph ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {isGraph ? (
            <div className="h-full min-h-0 overflow-hidden bg-[#f7f8fa]">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
