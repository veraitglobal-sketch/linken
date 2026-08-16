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
import {
  partnerMoreNav,
  partnerPrimaryNav,
} from "@/components/dashboard/workspace-partner-nav";
import type { WorkspaceContextType } from "@/features/workspace/types";
import type { WorkspaceSection } from "@/features/workspace/sections";
import { PRODUCT } from "@/lib/product-model";

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.href}>
          <WorkspaceNavLink item={item} pathname={pathname} />
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
  /** Company book with referrals — adds Developer to the company shell. */
  showDeveloperNav?: boolean;
  /** Full partner shell — replaces company Main/More. */
  partnerMode?: boolean;
};

export function WorkspaceNav({
  companySlug,
  groupSlug,
  contextType,
  allowedSections = null,
  showDeveloperNav = false,
  partnerMode = false,
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

  const main = filter(
    partnerMode ? partnerPrimaryNav(companySlug) : primaryNav(companySlug),
  );
  const more = filter(
    partnerMode ? partnerMoreNav() : moreNav({ showDeveloper: showDeveloperNav }),
  );

  return (
    <nav className="flex flex-col gap-6" aria-label="Workspace">
      <div>
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
          {partnerMode ? "Partner" : "Main"}
        </p>
        <NavList items={main} pathname={pathname} />
      </div>

      {more.length > 0 ? (
        <div>
          <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
            {partnerMode ? "Account" : PRODUCT.operate.label}
          </p>
          <NavList items={more} pathname={pathname} />
        </div>
      ) : null}

      {groupSlug && !companySlug ? (
        <div>
          <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
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
