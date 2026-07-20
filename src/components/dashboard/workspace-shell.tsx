"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  IconHome,
  IconSearch,
  IconSettings,
} from "@/components/dashboard/workspace-icons";
import { WorkspaceNav } from "@/components/dashboard/workspace-nav";
import { NetworkMark } from "@/components/marketing/network-mark";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  company: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    website?: string | null;
    verified?: boolean;
  } | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const PAGE_META: Record<
  string,
  { title: string; description?: string; actionHref?: string; actionLabel?: string }
> = {
  "/dashboard": {
    title: "Network",
    description: "Map firms, subsidiaries, and partners.",
  },
  "/dashboard/structure": {
    title: "Structure",
    description: "Ownership tree for your company group.",
  },
  "/dashboard/verification": {
    title: "Verification",
    description: "Evidence that backs public trust.",
  },
  "/dashboard/insights": {
    title: "Insights",
    description: "Visits and inquiries on your public profile.",
  },
  "/dashboard/inbox": {
    title: "Inbox",
    description: "Profile inquiries and Radar intros — separate tabs.",
  },
  "/dashboard/radar": {
    title: "Radar",
    description: "Project requests and signals for your market.",
  },
  "/dashboard/partners": {
    title: "Partners",
    description: "Invite firms and grow confirmed relationships.",
  },
  "/dashboard/settings": {
    title: "Company settings",
    description: "Edit the details on your public profile.",
  },
  "/dashboard/group": {
    title: "Company group",
    description: "Members, invites, and hierarchy.",
  },
  "/dashboard/team": {
    title: "Team",
    description: "People who can operate this workspace.",
  },
  "/dashboard/widgets": {
    title: "Widgets",
    description: "Embed Linken on your website.",
  },
  "/dashboard/api": {
    title: "API",
    description: "Agent keys and activity for your company.",
  },
};

export function WorkspaceShell({ children, company }: Props) {
  const pathname = usePathname();
  const isGraph = pathname === "/dashboard";
  const meta =
    PAGE_META[pathname] ??
    Object.entries(PAGE_META).find(
      ([href]) => href !== "/dashboard" && pathname.startsWith(href),
    )?.[1] ??
    { title: "Workspace" };

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
          {company ? (
            <Link
              href={`/c/${company.slug}`}
              className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#e8eaee] bg-[#fafbfc] px-2.5 py-2 transition-colors hover:bg-[#f4f6f9]"
            >
              <LogoMark
                initials={initials(company.name)}
                logoUrl={company.logoUrl}
                website={company.website}
                size="sm"
                className="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-ink">
                  {company.name}
                </p>
                <p className="truncate text-[11px] text-[#94a3b8]">
                  {company.verified ? "Verified workspace" : "Workspace"}
                </p>
              </div>
            </Link>
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
            <WorkspaceNav companySlug={company?.slug} />
          </div>

          <div className="mt-3 space-y-0.5 border-t border-[#f1f5f9] pt-3">
            {company ? (
              <Link
                href="/dashboard/settings"
                className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
              >
                <IconSettings className="text-[#94a3b8] group-hover:text-[#64748b]" />
                Edit profile
              </Link>
            ) : null}
            <Link
              href="/search"
              className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
            >
              <IconSearch className="text-[#94a3b8] group-hover:text-[#64748b]" />
              Directory
            </Link>
            <Link
              href="/"
              className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
            >
              <IconHome className="text-[#94a3b8] group-hover:text-[#64748b]" />
              Home
            </Link>
          </div>

          {company ? (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl px-2 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1f6] text-[11px] font-semibold text-ink">
                {initials(company.name).slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-ink">
                  {company.name}
                </p>
                <p className="truncate text-[10px] text-[#94a3b8]">Owner</p>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-[#f6f7f9]">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#e8eaee] bg-white/90 px-4 backdrop-blur-sm sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">
              {meta.title}
            </h1>
            {meta.description && !isGraph ? (
              <p className="hidden truncate text-[11px] text-[#94a3b8] sm:block">
                {meta.description}
              </p>
            ) : null}
          </div>
          {company ? (
            <div className="flex shrink-0 items-center gap-2">
              {!isGraph && meta.actionHref && meta.actionLabel ? (
                <Link
                  href={meta.actionHref}
                  className="hidden h-8 items-center rounded-lg bg-ink px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#1a2332] sm:inline-flex"
                >
                  {meta.actionLabel}
                </Link>
              ) : null}
              <Link
                href={`/c/${company.slug}`}
                className="inline-flex h-8 items-center rounded-lg border border-[#e2e8f0] bg-white px-3 text-[11px] font-semibold text-ink transition-colors hover:bg-[#f8fafc]"
              >
                Public profile
              </Link>
            </div>
          ) : (
            <Link
              href="/onboarding"
              className="inline-flex h-8 items-center rounded-lg bg-ink px-3 text-[11px] font-semibold text-white"
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
