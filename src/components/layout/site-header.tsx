import Link from "next/link";
import { focusableLinkClass } from "@/components/a11y/focus";
import { NetworkMark } from "@/components/marketing/network-mark";
import { SiteHeaderAuth } from "@/components/layout/site-header-auth";

/** Static shell — auth loads via /api/auth/session (same cookies as the server). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="glass-nav relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-2xl pr-1.5 pl-4 sm:gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-ink transition-opacity hover:opacity-80"
        >
          {/* The same mark the footer shows, not a second one.
              The header drew a bare navy glyph while `EmbedVerifiedLockup` in
              the footer draws it as a mint mark on a navy tile — two different
              logos on one site. This is the footer's treatment at the height a
              48px bar allows, minus the "Verified" subtitle, which needs two
              lines it does not have.
              Mint here rather than on paper is the palette's own rule: deep on
              paper, mint on navy. It is also the one accent AGENTS.md reserves
              for the mark, and until now the mark was the only monochrome thing
              in a header that sits above a footer full of colour. */}
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy text-[#7eb8a4] ring-1 ring-black/10"
          >
            <NetworkMark size={13} animate={false} />
          </span>
          <span className="font-display text-[1.18rem] leading-none font-semibold tracking-[-0.035em]">
            Hansala
          </span>
        </Link>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {/* From md the navs below carry Search in their own row. */}
          <Link href="/search" className={focusableLinkClass("shrink-0 md:hidden")}>
            <span className="sm:hidden">Search</span>
            <span className="hidden sm:inline">Search companies</span>
          </Link>
          <SiteHeaderAuth />
        </div>
      </div>
    </header>
  );
}
