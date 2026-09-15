"use client";

import Link from "next/link";
import { IconLock } from "@/components/dashboard/workspace-icons";
import type { NavItem } from "@/components/dashboard/workspace-nav-items";
import { cn } from "@/lib/cn";

export function WorkspaceNavLink({
  item,
  pathname,
  compact = false,
}: {
  item: NavItem;
  pathname: string;
  /** Icon-only rail button; the label moves to a tooltip and sr-only text. */
  compact?: boolean;
}) {
  const active =
    item.match === "exact"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const hint = item.lockedHint ?? "Coming soon";

  if (compact) {
    const railClass = cn(
      "group relative grid size-11 place-items-center rounded-xl transition-colors",
      item.locked
        ? "cursor-default text-plus/50"
        : active
          ? "bg-lime text-navy shadow-[0_6px_14px_-8px_rgba(14,31,28,0.5)]"
          : "text-ink/55 hover:bg-mute hover:text-ink",
    );
    const railBody = (
      <>
        <Icon className="shrink-0" />
        <span className="sr-only">{item.label}</span>
        {/* Hover label — the rail keeps every destination named. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden rounded-lg bg-navy px-2.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-on-navy shadow-card group-hover:block group-focus-visible:block"
        >
          {item.label}
          {item.locked ? " · locked" : ""}
        </span>
      </>
    );
    if (item.locked) {
      return (
        <span className={railClass} title={hint} aria-disabled="true">
          {railBody}
        </span>
      );
    }
    return (
      <Link
        href={item.href}
        className={railClass}
        aria-current={active ? "page" : undefined}
      >
        {railBody}
      </Link>
    );
  }
  const className = cn(
    "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors",
    item.locked
      ? "cursor-default text-muted/65"
      : active
        ? "bg-lime font-semibold text-navy shadow-[0_6px_14px_-8px_rgba(14,31,28,0.5)]"
        : "text-ink/70 hover:bg-mute hover:text-ink",
  );

  const body = (
    <>
      <Icon
        className={cn(
          "shrink-0 transition-colors",
          item.locked ? "text-plus/65" : active ? "text-navy" : "text-ink/55 group-hover:text-ink",
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
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
      {body}
    </Link>
  );
}
