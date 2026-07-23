import type { ComponentType } from "react";
import {
  IconBilling,
  IconChart,
  IconGraph,
  IconGroup,
  IconHome,
  IconInbox,
  IconKey,
  IconRadar,
  IconShield,
  IconStructure,
  IconTeam,
  IconWidgets,
} from "@/components/dashboard/workspace-icons";
import { PRODUCT } from "@/lib/product-model";

function IconCases({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v14L12 16.5 5.5 20V6A1.5 1.5 0 0 1 7 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match?: "exact" | "prefix";
  companyOnly?: boolean;
  section?: import("@/features/workspace/sections").WorkspaceSection;
};

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

/** Advanced / rare — never in the main story. */
export const MORE_NAV: NavItem[] = [
  {
    href: "/dashboard/cases",
    label: "Case studies",
    icon: IconCases,
    companyOnly: true,
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
    href: "/dashboard/api",
    label: "API",
    icon: IconKey,
    companyOnly: true,
    section: "api",
  },
];
