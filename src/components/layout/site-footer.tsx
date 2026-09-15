import Link from "next/link";
import { FOOTER_GROUPS } from "@/components/layout/footer-links";
import { getSocialLinks } from "@/components/layout/social-links";
import { SOCIAL_LABEL, SocialMark } from "@/components/layout/social-mark";
import { NetworkMark } from "@/components/marketing/network-mark";
import { HansalaMark } from "@/components/ui/hansala-mark";
import { getLegalCompany } from "@/lib/legal/company";

/**
 * Site footer — a navy block that closes every page.
 *
 * Left: one question and one way to ask it. Right: the sitemap in four named
 * columns. Beneath both, the wordmark set huge and cropped by the bottom edge,
 * in a navy one step lighter than the ground, so it reads as texture rather
 * than a second headline.
 *
 * Third-party social marks keep their own colours, so each sits on a white
 * chip — on navy, X and TikTok would otherwise disappear.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const company = getLegalCompany();
  /* Our own record and LinkedIn only — the other accounts stay configured
     in social-links.ts but are not shown here. */
  const social = getSocialLinks().filter((l) => l.network === "linkedin");

  return (
    <footer className="relative overflow-hidden bg-navy text-on-navy">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 pt-16 pb-10 sm:px-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16 lg:px-10 lg:pt-20">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-on-navy no-underline"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-lime text-navy">
              <NetworkMark size={18} animate={false} />
            </span>
            <span className="font-display text-[20px] font-semibold tracking-[-0.03em]">
              Hansala
            </span>
          </Link>

          <p className="mt-10 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-on-navy">
            Questions about
            <br />a record?
          </p>
          <p className="mt-5 max-w-[34ch] text-[16px] leading-relaxed text-on-navy-soft">
            Ask about confirmation, verification or your company profile.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-lime px-6 text-[15px] font-semibold text-navy no-underline transition-colors hover:bg-[#bfe56c]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Contact us
          </Link>

          <ul className="mt-10 flex list-none flex-wrap items-center gap-2 p-0">
            <li>
              <Link
                href="/c/hansala"
                className="grid size-11 place-items-center rounded-full bg-white/10 text-on-navy ring-1 ring-white/15 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                <HansalaMark />
                <span className="sr-only">Hansala&rsquo;s own record</span>
              </Link>
            </li>
            {social.map((link) => (
              <li key={link.network}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="grid size-11 place-items-center rounded-full bg-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                >
                  <SocialMark network={link.network} size={18} />
                  <span className="sr-only">{SOCIAL_LABEL[link.network]}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:gap-x-8 lg:pt-2">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="font-display text-[18px] font-semibold tracking-[-0.02em] text-on-navy">
                {group.heading}
              </p>
              <ul className="mt-4 list-none space-y-0.5 p-0">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-10 items-center text-[15px] text-on-navy-soft no-underline transition-colors hover:text-lime"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-1 border-t border-white/10 py-5 text-[13px] text-on-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2">
            <span>
              © {year} {company.brand}. All rights reserved.
            </span>
            {company.entityName ? (
              <>
                <span aria-hidden className="text-white/25">
                  ·
                </span>
                <a
                  href="https://verait.de"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-11 items-center text-on-navy-muted no-underline transition-colors hover:text-on-navy sm:min-h-9"
                >
                  A {company.entityName} product
                </a>
              </>
            ) : null}
          </p>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center text-on-navy-muted no-underline transition-colors hover:text-on-navy sm:min-h-9"
          >
            {company.contactEmail}
          </Link>
        </div>
      </div>

      {/* The wordmark as ground: huge, cropped by the bottom edge, one step
          off the navy. Decorative only. */}
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.24em] px-4 text-center font-display text-[25vw] leading-[0.8] font-semibold tracking-[-0.06em] text-white/[0.05] select-none lg:text-[22vw]"
      >
        Hansala
      </p>
    </footer>
  );
}
