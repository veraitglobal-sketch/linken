"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome } from "@/components/dashboard/workspace-icons";
import {
  MORE_NAV,
  primaryNav,
  type NavItem,
} from "@/components/dashboard/workspace-nav-items";
import type { WorkspaceContextType } from "@/features/workspace/types";
import { PRODUCT } from "@/lib/product-model";
import { cn } from "@/lib/cn";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active =
    item.match === "exact"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex h-8 items-center gap-2 rounded-lg px-2 text-[12.5px] font-medium transition-colors",
        active
          ? "bg-navy/[0.07] font-semibold text-ink"
          : "text-muted hover:bg-black/[0.03] hover:text-ink",
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-navy" : "text-plus group-hover:text-muted",
        )}
      />
      {item.label}
    </Link>
  );
}

function NavList({ items, pathname }: { items: NavItem[]; pathname: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-px">
      {items.map((item) => (
        <li key={item.href}>
          <NavLink item={item} pathname={pathname} />
        </li>
      ))}
    </ul>
  );
}

type Props = {
  companySlug?: string | null;
  groupSlug?: string | null;
  contextType?: WorkspaceContextType | null;
  allowedSections?: import("@/features/workspace/sections").WorkspaceSection[] | null;
};

export function WorkspaceNav({
  companySlug,
  groupSlug,
  contextType,
  allowedSections = null,
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
  const more = filter(MORE_NAV);

  return (
    <nav className="flex flex-col gap-5" aria-label="Workspace">
      <div>
        <p className="mb-1 px-2 text-[9px] font-semibold tracking-[0.16em] text-plus/90 uppercase">
          Main
        </p>
        <NavList items={main} pathname={pathname} />
      </div>

      {more.length > 0 ? (
        <div>
          <p className="mb-1 px-2 text-[9px] font-semibold tracking-[0.16em] text-plus/90 uppercase">
            {PRODUCT.operate.label}
          </p>
          <NavList items={more} pathname={pathname} />
        </div>
      ) : null}

      {groupSlug && !companySlug ? (
        <div>
          <p className="mb-1 px-2 text-[9px] font-semibold tracking-[0.16em] text-plus/90 uppercase">
            Open
          </p>
          <ul className="space-y-px">
            <li>
              <Link
                href={`/g/${groupSlug}`}
                className="group flex h-8 items-center gap-2 rounded-lg px-2 text-[12.5px] font-medium text-muted transition-colors hover:bg-black/[0.03] hover:text-ink"
              >
                <IconHome className="text-plus group-hover:text-muted" />
                Public group
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
