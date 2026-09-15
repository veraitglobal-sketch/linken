"use client";

import { usePathname } from "next/navigation";
import { primaryNav, moreNav } from "@/components/dashboard/workspace-nav-items";
import { NetworkMark } from "@/components/marketing/network-mark";

/** The page's own menu icon, so the header and the sidebar name it the same way. */
export function WorkspacePageIcon() {
  const pathname = usePathname() ?? "";
  const item = [...primaryNav(null), ...moreNav({ showDeveloper: true })]
    .filter((i) => i.href.startsWith("/dashboard"))
    .filter((i) =>
      i.href === "/dashboard" ? pathname === "/dashboard" : pathname === i.href || pathname.startsWith(`${i.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  const Icon = item?.icon;

  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lime text-navy [&_svg]:size-[22px]">
      {Icon ? <Icon /> : <NetworkMark size={22} animate={false} />}
    </span>
  );
}
