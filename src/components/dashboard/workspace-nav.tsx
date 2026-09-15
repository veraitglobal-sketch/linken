"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome } from "@/components/dashboard/workspace-icons";
import { WorkspaceNavLink } from "@/components/dashboard/workspace-nav-link";
import {
  moreNav,
  primaryNav,
  type NavItem,
} from "@/components/dashboard/workspace-nav-items";
import type { WorkspaceContextType } from "@/features/workspace/types";
import type { WorkspaceSection } from "@/features/workspace/sections";
import { PRODUCT } from "@/lib/product-model";

function NavList({
  items,
  pathname,
  compact,
}: {
  items: NavItem[];
  pathname: string;
  compact?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={compact ? "flex flex-col items-center gap-1.5" : "space-y-1"}>
      {items.map((item) => (
        <li key={item.href}>
          <WorkspaceNavLink item={item} pathname={pathname} compact={compact} />
        </li>
      ))}
    </ul>
  );
}

type Props = {
  companySlug?: string | null;
  groupSlug?: string | null;
  contextType?: WorkspaceContextType | null;
  allowedSections?: WorkspaceSection[] | null;
  /** Company book with referrals / partner — Earnings under More. */
  showDeveloperNav?: boolean;
  /** Icon rail (desktop shell). */
  compact?: boolean;
};

export function WorkspaceNav({
  companySlug,
  groupSlug,
  contextType,
  allowedSections = null,
  showDeveloperNav = false,
  compact = false,
}: Props) {
  const pathname = usePathname();
  const isGroup = contextType === "group";
  const filter = (items: NavItem[]) =>
    items.filter((i) => {
      if (isGroup && i.companyOnly) return false;
      if (allowedSections && i.section && !allowedSections.includes(i.section)) {
        return false;
      }
      return true;
    });

  const main = filter(primaryNav(companySlug));
  const more = filter(moreNav({ showDeveloper: showDeveloperNav }));

  if (compact) {
    return (
      <nav className="flex flex-col items-center gap-3" aria-label="Workspace">
        <NavList items={main} pathname={pathname} compact />
        {more.length > 0 ? (
          <>
            <span aria-hidden className="h-px w-8 bg-line" />
            <NavList items={more} pathname={pathname} compact />
          </>
        ) : null}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-5" aria-label="Workspace">
      <div>
        <p className="mb-2 px-3 font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Main
        </p>
        <NavList items={main} pathname={pathname} />
      </div>

      {more.length > 0 ? (
        <div>
          <p className="mb-2 px-3 font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            {PRODUCT.operate.label}
          </p>
          <NavList items={more} pathname={pathname} />
        </div>
      ) : null}

      {groupSlug && !companySlug ? (
        <div>
          <p className="mb-2 px-3 font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Open
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                href={`/g/${groupSlug}`}
                className="group flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-navy/[0.035] hover:text-ink"
              >
                <IconHome className="text-plus group-hover:text-ink-soft" />
                Public group
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
