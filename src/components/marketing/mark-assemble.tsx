import Image from "next/image";
import Link from "next/link";

/**
 * Homepage §2 — the first dark chapter: the rule, beside the mark.
 *
 * Thrivea's split — picture left, a two-tone claim right — with the
 * photograph that carries Hansala's mark cut into a concrete wall. The
 * photograph sits in its own inset frame at 16:10, so the carved mark is never
 * under a scrim or behind copy at any width (a phone used to lose a third of
 * it under the old overlay).
 *
 * Mint appears once: the second line of the claim.
 */
export function MarkAssemble() {
  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mark-stage relative mx-auto grid w-full max-w-6xl items-center gap-8 overflow-hidden rounded-hero p-3 sm:p-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:p-5">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card ring-1 ring-white/10">
          <Image
            src="/images/mark-facade.webp"
            alt=""
            fill
            quality={75}
            draggable={false}
            className="pointer-events-none object-cover object-center select-none"
            sizes="(max-width: 1024px) 100vw, 620px"
            aria-hidden
          />
        </div>

        <div className="px-5 pb-8 sm:px-8 lg:px-0 lg:pr-10 lg:pb-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-on-navy-muted uppercase">
            Two sides
          </p>
          <h2 className="reveal mt-5 font-display text-[clamp(2.1rem,3.9vw,3.2rem)] leading-[1.02] font-medium tracking-[-0.045em] text-on-navy text-balance">
            Two companies.
            <br />
            <span className="text-blue-soft">One confirmation.</span>
          </h2>
          <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-on-navy-soft">
            A company cannot state who it worked for — only the other side can
            confirm it.
          </p>
          <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-on-navy-muted">
            Until they do, the record stays private. Once they do, it shows on
            both profiles.
          </p>
          <Link
            href="/demo"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[13.5px] font-semibold text-ink transition-colors duration-200 hover:bg-[#f2f4f2]"
          >
            See a live example
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
