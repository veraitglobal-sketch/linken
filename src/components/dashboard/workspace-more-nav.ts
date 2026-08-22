import {
  IconBilling,
  IconChart,
  IconGroup,
  IconKey,
  IconPartners,
  IconRadar,
  IconShield,
  IconStructure,
  IconTeam,
  IconWidgets,
} from "@/components/dashboard/workspace-icons";
import {
  IconCases,
  IconDeveloper,
  IconTestimonials,
} from "@/components/dashboard/workspace-nav-extra-icons";
import type { NavItem } from "@/components/dashboard/workspace-nav-types";
import { PRODUCT } from "@/lib/product-model";

export type { NavItem };

/**
 * Ordered by what gates what.
 *
 * Verification first: until the domain is verified the embed has no
 * `frame-ancestors` to sit inside and the mark is not earned, so every other
 * item here is blocked behind it. It sat fifth.
 *
 * Then the two things you actually create — Testimonials and Case studies —
 * because those are the records, and the embed code now lives on the
 * Testimonials page.
 *
 * Widgets and Integrations follow them, not the bottom of the list. AGENTS.md
 * calls the embeds the distribution channel, and that channel was sitting
 * below Radar — an entry that is locked and cannot be opened at all. Then
 * Insights, which says whether any of it worked. Org administration after
 * that: set once, rarely touched.
 */
export function moreNav(opts?: { showDeveloper?: boolean }): NavItem[] {
  const items: NavItem[] = [
    {
      href: "/dashboard/verification",
      label: "Verification",
      icon: IconShield,
      companyOnly: true,
      section: "verification",
    },
    {
      href: "/dashboard/testimonials",
      label: "Testimonials",
      icon: IconTestimonials,
      companyOnly: true,
      section: "widgets",
    },
    {
      href: "/dashboard/cases",
      label: "Case studies",
      icon: IconCases,
      companyOnly: true,
    },
    {
      href: "/dashboard/widgets",
      label: "Widgets",
      icon: IconWidgets,
      companyOnly: true,
      section: "widgets",
    },
    {
      href: "/dashboard/integrations",
      label: "Integrations",
      icon: IconPartners,
      companyOnly: true,
      section: "settings",
    },
    {
      href: "/dashboard/insights",
      label: "Insights",
      icon: IconChart,
      companyOnly: true,
      section: "insights",
    },
    {
      href: "/dashboard/team",
      label: "Team access",
      icon: IconTeam,
      companyOnly: true,
      section: "team",
    },
    {
      href: "/dashboard/structure",
      label: PRODUCT.structure.label,
      icon: IconStructure,
      section: "structure",
    },
    { href: "/dashboard/group", label: "Group", icon: IconGroup },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: IconBilling,
      companyOnly: true,
      section: "settings",
    },
    {
      href: "/dashboard/api",
      label: "API",
      icon: IconKey,
      companyOnly: true,
      section: "api",
    },
    /* Last, because it is the only entry here that cannot be used yet. A locked
       row above working ones spends attention on something that answers back
       with a lock. */
    {
      href: "/dashboard/radar",
      label: "Radar",
      icon: IconRadar,
      companyOnly: true,
      section: "radar",
      locked: true,
      lockedHint:
        "Radar unlocks when enough companies are on Hansala to make matching useful.",
    },
  ];

  if (opts?.showDeveloper) {
    items.push({
      href: "/dashboard/developer",
      label: "Earnings",
      icon: IconDeveloper,
      companyOnly: true,
      section: "settings",
    });
  }

  return items;
}
