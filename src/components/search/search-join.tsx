import Link from "next/link";

/**
 * The end of the search page for a company that did not find itself.
 *
 * A dark chapter with the way in, and a drawing of what joining means: a new
 * company in outline at the edge of a network, the first line already drawn
 * towards it. No photograph — the product's own shapes say it.
 */
export function SearchJoin() {
  return (
    <section className="mx-auto mt-20 w-full max-w-[1180px] px-4 sm:mt-24 sm:px-[18px]">
      <div className="grid overflow-hidden rounded-[32px] bg-navy lg:grid-cols-[1fr_1fr]">
        <div className="px-6 py-12 sm:px-12 sm:py-16">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">
            Not in the directory yet?
          </p>
          <h2 className="mt-4 max-w-[15ch] font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-on-navy text-balance">
            Put your company on the map of who worked with whom.
          </h2>
          <p className="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-on-navy-soft">
            Create your profile for free, then invite the clients and partners who can confirm your
            work. Each yes draws a line to your company.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center rounded-full bg-lime px-6 text-[15px] font-semibold text-navy transition-colors hover:bg-lime/85"
            >
              Create your company profile
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-on-navy ring-1 ring-on-navy/25 transition-colors hover:bg-on-navy/10"
            >
              How confirming works
            </Link>
          </div>
        </div>

        <div className="relative min-h-[280px] border-t border-on-navy/10 bg-[radial-gradient(circle,rgba(242,245,243,0.08)_1.2px,transparent_1.8px)] [background-size:22px_22px] lg:border-t-0 lg:border-l">
          <JoinArt />
        </div>
      </div>
    </section>
  );
}

function JoinArt() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full p-3 sm:p-5"
      viewBox="0 0 520 360"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
    >
      <g stroke="#cdef84" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.55">
        <path d="M112 86 L226 62" />
        <path d="M226 62 L206 206" />
        <path d="M112 86 L206 206" />
        <path d="M206 206 L92 280" />
      </g>
      <path d="M264 70 L372 150" stroke="#cdef84" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 9" />
      <path d="M244 214 L372 196" stroke="#cdef84" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 9" />

      <rect x="74" y="50" width="76" height="72" rx="20" fill="#f2f5f3" />
      <circle cx="112" cy="80" r="12" stroke="#0e1f1c" strokeWidth="3.5" />
      <rect x="96" y="100" width="32" height="6" rx="3" fill="#c5cdc8" />

      <rect x="188" y="26" width="76" height="72" rx="20" fill="#f2f5f3" />
      <path d="m226 46 14 24h-28z" stroke="#0e1f1c" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="210" y="78" width="32" height="6" rx="3" fill="#c5cdc8" />

      <rect x="168" y="170" width="76" height="72" rx="20" fill="#f2f5f3" />
      <rect x="194" y="186" width="24" height="24" rx="6" stroke="#0e1f1c" strokeWidth="3.5" />
      <rect x="190" y="220" width="32" height="6" rx="3" fill="#c5cdc8" />

      <rect x="54" y="244" width="76" height="72" rx="20" fill="#f2f5f3" />
      <path d="M80 270h24M92 258v24" stroke="#0e1f1c" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="76" y="294" width="32" height="6" rx="3" fill="#c5cdc8" />

      <circle cx="216" cy="134" r="13" fill="#cdef84" />
      <path d="m210 134.5 4 4 8-8.5" stroke="#0e1f1c" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="372" y="126" width="100" height="100" rx="26" stroke="#cdef84" strokeWidth="2.5" strokeDasharray="6 7" />
      <circle cx="422" cy="166" r="16" stroke="#cdef84" strokeWidth="2.5" strokeDasharray="4 5" />
      <rect x="398" y="194" width="48" height="6" rx="3" fill="#cdef84" fillOpacity="0.35" />
      <circle cx="470" cy="128" r="17" fill="#cdef84" />
      <path d="M462.5 128h15M470 120.5v15" stroke="#0e1f1c" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
