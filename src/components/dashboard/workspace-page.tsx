import type { ReactNode } from "react";
import { WorkspacePageIcon } from "@/components/dashboard/workspace-page-icon";
import { cn } from "@/lib/cn";

export type WorkspaceStat = {
  label: string;
  value: string | number;
  /** Lime dot — something here is waiting on you. */
  attention?: boolean;
};

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  wide?: boolean;
  /** Real counts for this page, shown under the title. Omit when there are none. */
  stats?: WorkspaceStat[];
};

/**
 * Workspace page frame — the same two surfaces as the Map screen: a navy
 * header card (the page's menu icon, title, what it is for, its action) and a
 * white work surface beneath it that uses the width of the window.
 *
 * Actions passed in are links styled for paper; inside the navy header they
 * are restyled as the lime primary button, like "Add partners" on the map.
 */
export function WorkspacePage({
  title,
  description,
  action,
  children,
  className,
  wide,
  stats,
}: Props) {
  return (
    <div className={cn("flex min-h-full w-full flex-col gap-3 bg-[#f4f6f1] p-3 sm:p-4", className)}>
      <header className="flex shrink-0 flex-wrap items-center gap-4 rounded-[20px] bg-navy px-4 py-4 text-on-navy sm:px-6 sm:py-5">
        <WorkspacePageIcon />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[22px] leading-tight font-semibold tracking-[-0.02em] sm:text-[24px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-on-navy-soft">{description}</p>
          ) : null}
        </div>
        {stats && stats.length > 0 ? (
          <dl className="order-last grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:order-none lg:w-auto">
            {stats.map((s) => (
              <div
                key={s.label}
                className="min-w-[112px] rounded-xl bg-white/[0.06] px-3.5 py-2 ring-1 ring-white/15"
              >
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-on-navy-muted uppercase">
                  {s.attention ? <span className="size-1.5 rounded-full bg-lime" /> : null}
                  {s.label}
                </dt>
                <dd className="mt-0.5 font-display text-[20px] leading-tight font-semibold tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 [&_a]:!inline-flex [&_a]:!h-10 [&_a]:!items-center [&_a]:!rounded-xl [&_a]:!border-0 [&_a]:!bg-white/10 [&_a]:!px-4 [&_a]:!text-[13px] [&_a]:!font-semibold [&_a]:!text-on-navy [&_a]:!ring-1 [&_a]:!ring-white/20 [&_a:hover]:!bg-white/15 [&_a:last-of-type]:!bg-lime [&_a:last-of-type]:!text-navy [&_a:last-of-type]:!ring-0 [&_a:last-of-type:hover]:!bg-[#bfe56c] [&>span]:!h-10 [&>span]:!rounded-xl [&>span]:!border-white/20 [&>span]:!bg-white/10 [&>span]:!px-4 [&>span]:!text-[13px] [&>span]:!text-on-navy">
            {action}
          </div>
        ) : null}
      </header>

      <div className="flex-1 rounded-[20px] bg-surface px-4 py-6 ring-1 ring-line/70 sm:px-8 sm:py-8">
        <div className={cn("mx-auto w-full", wide ? "max-w-[1200px]" : "max-w-[960px]")}>{children}</div>
      </div>
    </div>
  );
}

/** A section inside the work surface — a hairline card, like Thrivea's lists. */
export function WorkspaceCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-surface ring-1 ring-line/80 shadow-[0_1px_2px_rgba(14,31,28,0.04)]",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
