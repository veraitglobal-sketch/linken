"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

const build: Item[] = [
  { href: "/dashboard", label: "Network graph", match: "exact" },
  { href: "/dashboard/structure", label: "Structure" },
  { href: "/dashboard/partners", label: "Partners" },
];

const operate: Item[] = [
  { href: "/dashboard/verification", label: "Verification" },
  { href: "/dashboard/insights", label: "Insights" },
  { href: "/dashboard/inbox", label: "Inquiries" },
  { href: "/dashboard/group", label: "Company group" },
  { href: "/dashboard/team", label: "Team" },
];

function NavLink({ item, pathname }: { item: Item; pathname: string }) {
  const active =
    item.match === "exact"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex h-9 items-center rounded-lg px-3 text-[13px] font-medium transition-colors",
        active
          ? "bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
          : "text-[#5b6472] hover:bg-white/70 hover:text-ink",
      )}
    >
      {active ? (
        <span
          className="absolute top-1.5 bottom-1.5 left-0 w-[2.5px] rounded-full bg-ink"
          aria-hidden
        />
      ) : null}
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
      <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.12em] text-[#9aa3af] uppercase">
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
    <nav className="flex flex-col gap-5" aria-label="Workspace">
      <NavGroup title="Build" items={build} pathname={pathname} />
      <NavGroup title="Operate" items={operate} pathname={pathname} />
      {companySlug ? (
        <div>
          <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.12em] text-[#9aa3af] uppercase">
            Open
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                href={`/c/${companySlug}`}
                className="flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-[#5b6472] transition-colors hover:bg-white/70 hover:text-ink"
              >
                Public profile
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
