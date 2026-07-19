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
  IconPartners,
  IconShield,
  IconStructure,
  IconTeam,
  IconWidgets,
} from "@/components/dashboard/workspace-icons";
import { cn } from "@/lib/cn";

type Item = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match?: "exact" | "prefix";
};

const build: Item[] = [
  { href: "/dashboard", label: "Network", icon: IconGraph, match: "exact" },
  { href: "/dashboard/structure", label: "Structure", icon: IconStructure },
  { href: "/dashboard/partners", label: "Partners", icon: IconPartners },
];

const operate: Item[] = [
  { href: "/dashboard/verification", label: "Verification", icon: IconShield },
  { href: "/dashboard/widgets", label: "Widgets", icon: IconWidgets },
  { href: "/dashboard/insights", label: "Insights", icon: IconChart },
  { href: "/dashboard/inbox", label: "Inquiries", icon: IconInbox },
  { href: "/dashboard/group", label: "Company group", icon: IconGroup },
  { href: "/dashboard/team", label: "Team", icon: IconTeam },
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
        "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-[#eef1f6] font-semibold text-ink"
          : "text-[#64748b] hover:bg-[#f4f6f9] hover:text-ink",
      )}
    >
      <Icon
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-ink" : "text-[#94a3b8] group-hover:text-[#64748b]",
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
  return (
    <div>
      <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
        {title}
      </p>
      <ul className="space-y-0.5">
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
};

export function WorkspaceNav({ companySlug }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6" aria-label="Workspace">
      <NavGroup title="Build" items={build} pathname={pathname} />
      <NavGroup title="Operate" items={operate} pathname={pathname} />
      {companySlug ? (
        <div>
          <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
            Open
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                href={`/c/${companySlug}`}
                className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
              >
                <IconExternal className="text-[#94a3b8] group-hover:text-[#64748b]" />
                Public profile
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
