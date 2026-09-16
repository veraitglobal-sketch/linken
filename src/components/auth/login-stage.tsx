import Link from "next/link";
import { AuthNetworkField } from "@/components/auth/auth-network-field";
import { NetworkMark } from "@/components/marketing/network-mark";

/**
 * Left half of the sign-in screen: the mark, large and centred, over a quiet
 * drawing of a confirmed network on deep navy.
 */
export function LoginStage() {
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-[340px] flex-col overflow-hidden bg-navy px-6 py-6 text-on-navy sm:px-10 lg:min-h-dvh">
      <AuthNetworkField />

      <Link
        href="/"
        className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold text-on-navy-soft transition-colors hover:bg-white/10 hover:text-on-navy"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M13 8H3m4-4L3 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to site
      </Link>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-10 text-center">
        <span className="animate-rise grid size-28 place-items-center rounded-[32px] bg-lime text-navy ring-8 ring-white/[0.04] sm:size-36 sm:rounded-[40px]">
          <NetworkMark size={112} animate={false} />
        </span>
        <p className="animate-rise-delay mt-8 font-display text-[44px] leading-none font-semibold tracking-[-0.04em] sm:text-[52px]">
          Hansala
        </p>
        <p className="animate-rise-delay mt-5 max-w-sm text-[17px] leading-relaxed text-on-navy">
          A record of who works with whom, confirmed by both sides.
        </p>
        <p className="animate-rise-late mt-3 max-w-xs text-[14px] leading-relaxed text-on-navy-soft">
          Profile, partners and proof of work in one place.
        </p>
      </div>

      <p className="relative z-10 text-center text-[12px] text-on-navy-muted">
        © {year} Hansala
      </p>
    </div>
  );
}
