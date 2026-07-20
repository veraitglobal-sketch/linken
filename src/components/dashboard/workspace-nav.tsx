"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  IconChart,
  IconExternal,
  IconGraph,
  IconGroup,
  IconInbox,
  IconKey,
  IconRadar,
  IconPartners,
  IconSettings,
  IconShield,
  IconStructure,
  IconTeam,
  IconWidgets,
} from "@/components/dashboard/workspace-icons";
import type { WorkspaceContextType } from "@/features/workspace/types";
import { cn } from "@/lib/cn";

type Item = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match?: "exact" | "prefix";
  companyOnly?: boolean;
  section?: import("@/features/workspace/sections").WorkspaceSection;
};

const build: Item[] = [
  {
    href: "/dashboard",
    label: "Network",
    icon: IconGraph,
    match: "exact",
    section: "network",
  },
  {
    href: "/dashboard/structure",
    label: "Structure",
    icon: IconStructure,
    section: "structure",
  },
  {
    href: "/dashboard/partners",
    label: "Partners",
    icon: IconPartners,
    companyOnly: true,
    section: "partners",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: IconSettings,
    companyOnly: true,
    section: "settings",
  },
];

const operate: Item[] = [
  {
    href: "/dashboard/verification",
    label: "Verification",
    icon: IconShield,
    companyOnly: true,
    section: "verification",
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
  {
    href: "/dashboard/insights",
    label: "Insights",
    icon: IconChart,
    companyOnly: true,
    section: "insights",
  },
  {
    href: "/dashboard/inbox",
    label: "Inbox",
    icon: IconInbox,
    companyOnly: true,
    section: "inbox",
  },
  {
    href: "/dashboard/radar",
    label: "Radar",
    icon: IconRadar,
    companyOnly: true,
    section: "radar",
  },
  { href: "/dashboard/group", label: "Company group", icon: IconGroup },
  {
    href: "/dashboard/team",
    label: "Team",
    icon: IconTeam,
    companyOnly: true,
    section: "team",
  },
];

function NavLink({ item, pathname }: { item: Item; pathname: string }) {
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
          : "text-ink-soft hover:bg-black/[0.03] hover:text-ink",
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-navy" : "text-plus group-hover:text-ink-soft",
        )}
      />
      {item.label}
    </Link>
  );
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: Item[];
  pathname: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 px-2 text-[9px] font-semibold tracking-[0.16em] text-plus/90 uppercase">
        {title}
      </p>
      <ul className="space-y-px">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink item={item} pathname={pathname} />
          </li>
        ))}
      </ul>
    </div>
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
  const filter = (items: Item[]) =>
    items.filter((i) => {
      if (isGroup && i.companyOnly) return false;
      if (allowedSections && i.section && !allowedSections.includes(i.section)) {
        return false;
      }
      return true;
    });

  const publicHref = companySlug
    ? `/c/${companySlug}`
    : groupSlug
      ? `/g/${groupSlug}`
      : null;

  return (
    <nav className="flex flex-col gap-5" aria-label="Workspace">
      <NavGroup title="Build" items={filter(build)} pathname={pathname} />
      <NavGroup title="Operate" items={filter(operate)} pathname={pathname} />
      {publicHref ? (
        <div>
          <p className="mb-1 px-2 text-[9px] font-semibold tracking-[0.16em] text-plus/90 uppercase">
            Open
          </p>
          <ul className="space-y-px">
            <li>
              <Link
                href={publicHref}
                className="group flex h-8 items-center gap-2 rounded-lg px-2 text-[12.5px] font-medium text-ink-soft transition-colors hover:bg-black/[0.03] hover:text-ink"
              >
                <IconExternal className="text-plus group-hover:text-ink-soft" />
                {groupSlug && !companySlug ? "Public group" : "Public profile"}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
