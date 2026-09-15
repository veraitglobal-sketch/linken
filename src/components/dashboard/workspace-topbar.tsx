"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { WORKSPACE_PAGE_META } from "@/components/dashboard/workspace-page-meta";
import { useNavCollapsed } from "@/components/dashboard/use-nav-collapsed";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { NetworkMark } from "@/components/marketing/network-mark";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext | null;
  contexts: WorkspaceContext[];
  verified?: boolean;
  signedIn: boolean;
  /** Mobile menu trigger (hidden from lg). */
  menu: ReactNode;
  /** Getting started pill, when the checklist is open. */
  checklist: ReactNode;
  publicHref: string | null;
  publicLabel: string;
};

/**
 * One bar across the top of every workspace page: brand, where you are, the
 * workspace switcher, search, inbox and the public page.
 *
 * Every control here goes somewhere real — search opens the company
 * directory, the bell opens Inbox, the public link opens the profile.
 */
export function WorkspaceTopbar({
  active,
  contexts,
  verified,
  signedIn,
  menu,
  checklist,
  publicHref,
  publicLabel,
}: Props) {
  const pathname = usePathname();
  const { collapsed, toggle } = useNavCollapsed();
  const meta =
    WORKSPACE_PAGE_META[pathname] ??
    Object.entries(WORKSPACE_PAGE_META)
      .filter(([href]) => href !== "/dashboard" && pathname.startsWith(`${href}/`))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1];

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line/60 bg-surface px-3 sm:px-5">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 text-ink transition-opacity hover:opacity-80"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-navy text-lime">
          <NetworkMark size={16} animate={false} />
        </span>
        <span className="hidden font-display text-[18px] font-semibold tracking-[-0.035em] sm:inline">
          Hansala
        </span>
      </Link>

      {signedIn ? (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={!collapsed}
          title={collapsed ? "Show menu labels" : "Collapse menu"}
          className="ml-1 hidden size-10 shrink-0 place-items-center rounded-xl text-ink/55 transition-colors hover:bg-mute hover:text-ink lg:grid"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M9.5 4.5v15" stroke="currentColor" strokeWidth="1.7" />
            {collapsed ? null : <path d="M6 9h1.5M6 12h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
          </svg>
          <span className="sr-only">{collapsed ? "Expand menu" : "Collapse menu"}</span>
        </button>
      ) : null}

      <span aria-hidden className="mx-1 hidden h-6 w-px bg-line lg:block" />

      {signedIn && active ? (
        <div className="hidden w-[230px] shrink-0 lg:block">
          <WorkspaceSwitcher active={active} contexts={contexts} verified={verified} />
        </div>
      ) : null}

      {meta ? (
        <p className="hidden min-w-0 items-center gap-2 text-[14px] xl:flex">
          <span className="text-muted">/</span>
          <span className="truncate font-semibold text-ink">{meta.title}</span>
        </p>
      ) : null}

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <Link
          href="/search"
          className="hidden h-11 w-[300px] items-center gap-2.5 rounded-full border border-line bg-[#f7f8f5] px-4 text-[14px] text-muted transition-colors hover:border-ink/20 hover:bg-surface md:flex"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="flex-1">Search companies</span>
        </Link>

        {checklist}

        {signedIn ? (
          <Link
            href="/dashboard/inbox"
            title="Inbox"
            className="grid size-11 shrink-0 place-items-center rounded-full text-ink ring-1 ring-line transition-colors hover:bg-mute"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sr-only">Inbox</span>
          </Link>
        ) : null}

        {!signedIn ? (
          <Link
            href="/login?next=/dashboard"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-navy px-5 text-[13px] font-semibold text-on-navy"
          >
            Sign in
          </Link>
        ) : publicHref ? (
          <Link
            href={publicHref}
            className="hidden h-11 shrink-0 items-center gap-2 rounded-full bg-lime px-5 text-[13px] font-semibold text-navy transition-colors hover:bg-[#bfe56c] sm:inline-flex"
          >
            {publicLabel === "Company" ? "Public page" : publicLabel}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 3h7v7M13 3 5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <Link
            href="/onboarding"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-navy px-5 text-[13px] font-semibold text-on-navy"
          >
            Create company
          </Link>
        )}

        {menu}
      </div>
    </header>
  );
}
