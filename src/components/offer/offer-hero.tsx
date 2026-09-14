import Link from "next/link";

export function OfferHero() {
  return (
    <div>
      <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1.5 font-label text-[11px] font-semibold tracking-[0.16em] text-on-navy uppercase backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-soft" aria-hidden />
        Special introductory offer
      </p>
      <h1 className="mt-5 max-w-[15ch] font-display text-chapter text-on-navy text-balance">
        Your work already speaks for you.
      </h1>
      <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-on-navy-soft">
        Pro puts your confirmed partners and their words on your own site. Same
        Pro as monthly, billed in USD.{" "}
        <Link
          href="/pricing"
          className="font-semibold text-on-navy underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
        >
          See standard pricing
        </Link>
      </p>
      <p className="mt-6 flex items-baseline gap-2.5 text-on-navy">
        <span className="text-[15px] text-on-navy-soft">From</span>
        <span className="font-display text-[40px] leading-none font-medium tracking-[-0.04em] tabular-nums">
          $12.42
        </span>
        <span className="text-[15px] text-on-navy-soft">/ month</span>
      </p>
    </div>
  );
}
