"use client";

import Link from "next/link";
import { IconLock } from "@/components/dashboard/workspace-icons";
import type { NavItem } from "@/components/dashboard/workspace-nav-items";
import { cn } from "@/lib/cn";

export function WorkspaceNavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active =
    item.match === "exact"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const hint = item.lockedHint ?? "Coming soon";
  const className = cn(
    "group relative flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium transition-colors",
    item.locked
      ? "cursor-default text-muted/65"
      : active
        ? "bg-navy/[0.06] font-semibold text-ink"
        : "text-ink-soft hover:bg-navy/[0.035] hover:text-ink",
  );

  const body = (
    <>
      {active && !item.locked ? (
        <span
          className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-navy"
          aria-hidden
        />
      ) : null}
      <Icon
        className={cn(
          "shrink-0 transition-colors",
          item.locked
            ? "text-plus/65"
            : active
              ? "text-navy"
              : "text-plus group-hover:text-ink-soft",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.locked ? <IconLock className="shrink-0 text-plus/75" /> : null}
    </>
  );

  if (item.locked) {
    return (
      <span className={className} title={hint} aria-disabled="true">
        {body}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {body}
    </Link>
  );
}
