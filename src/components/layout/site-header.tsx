import Link from "next/link";
import { focusableLinkClass } from "@/components/a11y/focus";
import { NetworkMark } from "@/components/marketing/network-mark";
import { SiteHeaderAuth } from "@/components/layout/site-header-auth";

/** Static shell — auth loads via /api/auth/session (same cookies as the server). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="glass-nav mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 sm:gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-ink transition-opacity hover:opacity-80"
        >
          <NetworkMark size={24} className="text-navy" animate={false} />
          <span className="font-display text-[1.18rem] leading-none font-semibold tracking-[-0.035em]">
            Hansala
          </span>
        </Link>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link href="/search" className={focusableLinkClass("shrink-0")}>
            <span className="sm:hidden">Search</span>
            <span className="hidden sm:inline">Search companies</span>
          </Link>
          <SiteHeaderAuth />
        </div>
      </div>
    </header>
  );
}
