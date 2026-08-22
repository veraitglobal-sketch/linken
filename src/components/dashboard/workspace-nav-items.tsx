import {
  IconExternal,
  IconGraph,
  IconHome,
  IconInbox,
} from "@/components/dashboard/workspace-icons";
import { moreNav } from "@/components/dashboard/workspace-more-nav";
import type { NavItem } from "@/components/dashboard/workspace-nav-types";
import { PRODUCT } from "@/lib/product-model";

export type { NavItem };
export { moreNav };

/**
 * Ordered by the work, not by the sitemap.
 *
 * Home first because it is where you land. Inbox second because it is the only
 * item here that can be *waiting on you* — a confirmation nobody answers is a
 * record that never exists, and burying it under the map cost exactly that.
 * Map third: your network, but nothing in it is urgent. Company last because it
 * is somewhere to look, not something to do — and it leaves the workspace.
 *
 * `IconExternal` on Company, not `IconHome`: it used to carry the same house as
 * Home, so two adjacent rows had the same mark and one of them left the app.
 */
export function primaryNav(companySlug?: string | null): NavItem[] {
  return [
    {
      href: "/dashboard",
      label: PRODUCT.home.label,
      icon: IconHome,
      match: "exact",
      section: "network",
    },
    {
      href: "/dashboard/inbox",
      label: PRODUCT.inbox.label,
      icon: IconInbox,
      companyOnly: true,
      section: "inbox",
    },
    {
      href: "/dashboard/map",
      label: PRODUCT.map.label,
      icon: IconGraph,
      match: "exact",
      section: "network",
    },
    ...(companySlug
      ? [
          {
            href: `/c/${companySlug}`,
            label: PRODUCT.company.label,
            icon: IconExternal,
            match: "prefix" as const,
            companyOnly: true,
            section: "settings" as const,
          },
        ]
      : []),
  ];
}

/** @deprecated Prefer moreNav({ showDeveloper }) */
export const MORE_NAV: NavItem[] = moreNav();
