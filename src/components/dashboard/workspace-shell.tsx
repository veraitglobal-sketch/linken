"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
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

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Network graph",
  "/dashboard/structure": "Structure",
  "/dashboard/verification": "Verification",
  "/dashboard/insights": "Insights",
  "/dashboard/inbox": "Inquiries",
  "/dashboard/partners": "Partners",
  "/dashboard/group": "Company group",
  "/dashboard/team": "Team",
};

export function WorkspaceShell({ children, company }: Props) {
  const pathname = usePathname();
  const isGraph = pathname === "/dashboard";
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(
      ([href]) => href !== "/dashboard" && pathname.startsWith(href),
    )?.[1] ??
    "Workspace";

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[#e7e9ee] bg-[#f3f4f7] lg:flex">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <Link href="/" className="inline-flex items-center gap-2.5 text-ink">
            <NetworkMark size={22} className="text-ink" />
            <span className="font-display text-[1.15rem] font-semibold tracking-[-0.03em]">
              Linken
            </span>
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
          {company ? (
            <div className="mb-4 rounded-lg border border-[#e0e4ea] bg-white px-2.5 py-2.5">
              <p className="px-0.5 text-[9px] font-semibold tracking-[0.14em] text-[#8b93a1] uppercase">
                Workspace
              </p>
              <Link
                href={`/c/${company.slug}`}
                className="mt-1.5 flex items-center gap-2.5 rounded-lg px-0.5 py-1 transition-colors hover:bg-[#f5f6f8]"
              >
                <LogoMark
                  initials={initials(company.name)}
                  logoUrl={company.logoUrl}
                  website={company.website}
                  size="sm"
                  className="rounded-lg"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {company.name}
                  </p>
                  <p className="truncate text-[11px] text-[#9aa3af]">
                    {company.verified ? "Verified" : "Workspace"}
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-[#e8eaee] bg-white px-3 py-3">
              <p className="text-[13px] font-semibold text-ink">No company</p>
              <Link
                href="/onboarding"
                className="mt-1 inline-block text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
              >
                Create company →
              </Link>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <WorkspaceNav companySlug={company?.slug} />
          </div>

          <div className="mt-4 space-y-0.5 border-t border-[#e8eaee] pt-3">
            <Link
              href="/search"
              className="flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-[#5b6472] transition-colors hover:bg-white/70"
            >
              Directory
            </Link>
            <Link
              href="/"
              className="flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-[#5b6472] transition-colors hover:bg-white/70"
            >
              Home
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-[#f5f6f8]">
        <header className="relative flex h-12 shrink-0 items-center gap-3 border-b border-[#e7e9ee] bg-white px-4 sm:px-5">
          <div className="min-w-0 flex-1">
            {isGraph ? (
              <p className="truncate text-[12px] text-[#94a3b8]">
                <span className="font-medium text-[#64748b]">Build</span>
                <span className="mx-1.5 text-[#e2e8f0]">/</span>
                <span className="font-semibold text-ink">Network graph</span>
              </p>
            ) : (
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">
                {title}
              </h1>
            )}
          </div>
          {isGraph ? (
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] p-0.5 lg:flex">
              <span className="rounded-full bg-white px-3.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
                Editor
              </span>
              <Link
                href="/dashboard/partners"
                className="rounded-full px-3.5 py-1 text-[11px] font-medium text-[#64748b] transition-colors hover:text-ink"
              >
                Partners
              </Link>
              <Link
                href="/dashboard/structure"
                className="rounded-full px-3.5 py-1 text-[11px] font-medium text-[#64748b] transition-colors hover:text-ink"
              >
                Structure
              </Link>
            </div>
          ) : null}
          {company ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/dashboard/structure"
                className="hidden h-8 items-center rounded-lg border border-[#e2e8f0] bg-white px-3 text-[11px] font-semibold text-ink transition-colors hover:bg-[#f8fafc] sm:inline-flex"
              >
                Add subsidiary
              </Link>
              <Link
                href={`/c/${company.slug}`}
                className="inline-flex h-8 items-center rounded-lg bg-ink px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#1a2332]"
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
            ["/dashboard", "Graph"],
            ["/dashboard/structure", "Structure"],
            ["/dashboard/verification", "Verify"],
            ["/dashboard/insights", "Insights"],
            ["/dashboard/inbox", "Inbox"],
            ["/dashboard/partners", "Partners"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium",
                pathname === href
                  ? "bg-[#eef0f3] font-semibold text-ink"
                  : "text-[#5b6472]",
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div
          className={cn(
            "min-h-0 flex-1",
            isGraph ? "overflow-hidden p-0" : "overflow-y-auto",
          )}
        >
          {isGraph ? (
            <div className="h-full min-h-0 overflow-hidden border-0 bg-white">
              {children}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
