import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type WorkspaceTab = {
  id: string;
  label: string;
  href: string;
  /** Small count or status next to the label. */
  meta?: string;
  /** Lime meta — something here needs attention. */
  attention?: boolean;
};

/** Underline tabs for a workspace page, with the page action on the right. */
export function WorkspaceTabs({
  tabs,
  active,
  action,
  label,
}: {
  tabs: WorkspaceTab[];
  active: string;
  action?: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line">
      <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label={label}>
        {tabs.map((tab) => {
          const on = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 border-b-2 text-[14px] font-semibold transition-colors",
                on ? "border-navy text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {tab.label}
              {tab.meta ? (
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold",
                    tab.attention ? "bg-lime text-navy" : on ? "bg-navy text-lime" : "bg-mute text-ink-soft",
                  )}
                >
                  {tab.meta}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      {action ? <div className="pb-2">{action}</div> : null}
    </div>
  );
}
