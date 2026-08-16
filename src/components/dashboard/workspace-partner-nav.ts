import {
  IconBilling,
  IconKey,
  IconShield,
  IconTeam,
} from "@/components/dashboard/workspace-icons";
import { IconDeveloper } from "@/components/dashboard/workspace-nav-extra-icons";
import type { NavItem } from "@/components/dashboard/workspace-nav-types";

/** Partner workspace — earnings book, not the company operate shell. */
export function partnerPrimaryNav(companySlug?: string | null): NavItem[] {
  return [
    {
      href: "/dashboard/developer",
      label: "Earnings",
      icon: IconDeveloper,
      match: "exact",
      companyOnly: true,
      section: "settings",
    },
    ...(companySlug
      ? [
          {
            href: `/c/${companySlug}`,
            label: "Public profile",
            icon: IconShield,
            match: "prefix" as const,
            companyOnly: true,
            section: "settings" as const,
          },
        ]
      : []),
  ];
}

export function partnerMoreNav(): NavItem[] {
  return [
    {
      href: "/dashboard/api",
      label: "API",
      icon: IconKey,
      companyOnly: true,
      section: "api",
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: IconBilling,
      companyOnly: true,
      section: "settings",
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
      href: "/dashboard/settings",
      label: "Settings",
      icon: IconBilling,
      companyOnly: true,
      section: "settings",
    },
  ];
}
