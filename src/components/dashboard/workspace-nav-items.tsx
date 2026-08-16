import {
  IconGraph,
  IconHome,
  IconInbox,
} from "@/components/dashboard/workspace-icons";
import { moreNav } from "@/components/dashboard/workspace-more-nav";
import type { NavItem } from "@/components/dashboard/workspace-nav-types";
import { PRODUCT } from "@/lib/product-model";

export type { NavItem };
export { moreNav };

/** The only three things most users need. */
export function primaryNav(companySlug?: string | null): NavItem[] {
  return [
    ...(companySlug
      ? [
          {
            href: `/c/${companySlug}`,
            label: PRODUCT.company.label,
            icon: IconHome,
            match: "prefix" as const,
            companyOnly: true,
            section: "settings" as const,
          },
        ]
      : []),
    {
      href: "/dashboard",
      label: PRODUCT.home.label,
      icon: IconHome,
      match: "exact",
      section: "network",
    },
    {
      href: "/dashboard/map",
      label: PRODUCT.map.label,
      icon: IconGraph,
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
  ];
}

/** @deprecated Prefer moreNav({ showDeveloper }) */
export const MORE_NAV: NavItem[] = moreNav();
