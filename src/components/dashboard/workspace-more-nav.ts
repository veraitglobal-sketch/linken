import {
  IconBilling,
  IconChart,
  IconGroup,
  IconKey,
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

/** Advanced / rare — never in the main story. */
export function moreNav(opts?: { showDeveloper?: boolean }): NavItem[] {
  const items: NavItem[] = [
    {
      href: "/dashboard/cases",
      label: "Case studies",
      icon: IconCases,
      companyOnly: true,
    },
    {
      href: "/dashboard/testimonials",
      label: "Testimonials",
      icon: IconTestimonials,
      companyOnly: true,
      section: "widgets",
    },
    {
      href: "/dashboard/verification",
      label: "Verification",
      icon: IconShield,
      companyOnly: true,
      section: "verification",
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
      href: "/dashboard/insights",
      label: "Insights",
      icon: IconChart,
      companyOnly: true,
      section: "insights",
    },
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
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: IconBilling,
      companyOnly: true,
      section: "settings",
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
      icon: IconWidgets,
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
