import Link from "next/link";
import { RANKING_RULES } from "@/components/ranking/ranking-rules";

/**
 * The closing chapter: the rules of the board, stated as the reason to join it.
 *
 * Not a sign-up band with a photograph — the one thing a visitor needs before
 * trusting an order is how the order is made, and the one thing a company needs
 * before entering it is that the only way in is confirmed work.
 */
export function SearchClose() {
  return (
    <section className="mx-auto mt-20 w-full max-w-[1180px] px-4 sm:mt-24 sm:px-[18px]">
      <div className="rounded-[32px] bg-navy px-6 py-12 sm:px-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">
              How the order is decided
            </p>
            <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-on-navy text-balance">
              Nothing on this board can be bought.
            </h2>
            <p className="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-on-navy-soft">
              Every position comes from records another company confirmed. A company gets on the
              board the same way — by asking the clients and partners it worked with.
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

          <ul className="grid list-none gap-px overflow-hidden rounded-[22px] bg-on-navy/10 p-0">
            {RANKING_RULES.map(([title, body]) => (
              <li key={title} className="flex gap-4 bg-navy px-5 py-4 sm:px-6 sm:py-5">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" />
                <span>
                  <span className="block text-[15px] font-semibold text-on-navy">{title}</span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-on-navy-muted">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
