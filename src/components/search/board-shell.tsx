import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The board: one surface that holds every state of this page.
 *
 * Thrivea anchors its pages on a single large product window; ours is the same
 * move except the window is live. Sector board, ranked list, name-search
 * results — the chrome never changes, only what is inside it, so the page never
 * reshuffles under the reader and never has an empty region to fill with
 * decoration.
 */
export function BoardShell({
  title,
  subtitle,
  actions,
  rail,
  status,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Right side of the navy bar — place filter, counts. */
  actions?: ReactNode;
  /** Left column. Omitted when the body is the whole board. */
  rail?: ReactNode;
  /** The grey line under the board: what the order means. */
  status?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-surface ring-1 ring-line/70 shadow-[0_50px_90px_-60px_rgba(14,31,28,0.55)]">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-navy px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BoardMark />
          <div className="min-w-0">
            <p className="truncate font-display text-[16px] font-semibold tracking-[-0.025em] text-on-navy sm:text-[17px]">
              {title}
            </p>
            {subtitle ? (
              <p className="truncate text-[12.5px] text-on-navy/60">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-1.5">{actions}</div> : null}
      </header>

      <div className={rail ? "grid lg:grid-cols-[236px_1fr]" : undefined}>
        {rail ? (
          <aside className="border-b border-line/70 p-3 lg:border-r lg:border-b-0">{rail}</aside>
        ) : null}
        <div className="min-w-0 p-3 sm:p-4">{children}</div>
      </div>

      {status ? (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line/70 bg-wash px-4 py-2.5 text-[12px] text-muted sm:px-6">
          {status}
        </footer>
      ) : null}
    </div>
  );
}

/** Two companies and the link between them — the product's mark, in lime. */
function BoardMark() {
  return (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-xl bg-on-navy/10 text-lime"
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="3.6" cy="8" r="2" />
        <circle cx="12.4" cy="8" r="2" />
        <path d="M5.6 8h4.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** A pill on the navy bar: the place filter, and anything else that switches. */
export function BoardPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex h-8 items-center gap-1.5 rounded-full bg-lime px-3 text-[13px] font-semibold text-navy"
          : "inline-flex h-8 items-center gap-1.5 rounded-full bg-on-navy/10 px-3 text-[13px] font-semibold text-on-navy/80 transition-colors hover:bg-on-navy/20 hover:text-on-navy"
      }
    >
      {children}
    </Link>
  );
}
