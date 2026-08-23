import Link from "next/link";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { FOOTER_GROUPS } from "@/components/layout/footer-links";
import { getSocialLinks } from "@/components/layout/social-links";
import { SOCIAL_LABEL, SocialMark } from "@/components/layout/social-mark";
import { HansalaMark } from "@/components/ui/hansala-mark";
import { getLegalCompany } from "@/lib/legal/company";

/**
 * Quiet paper footer. Close is the last navy chapter; this is the sitemap.
 *
 * Laid out as a masthead beside four named columns. Before, nine links sat in
 * one right-aligned wrapping row that broke 7 + 2 at 1440, and the six legal
 * links were packed into the bottom bar next to the copyright and the contact
 * address — three jobs on one 12px line. Grouping is what turns twenty-two
 * links into something a reader can scan instead of parse.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const company = getLegalCompany();
  const social = getSocialLinks();

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-14 lg:px-10">
        <div>
          <Link href="/" className="inline-flex no-underline">
            <EmbedVerifiedLockup theme="light" size="md" />
          </Link>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
            Company profiles, case studies, and partners — public only after both
            sides confirm.
          </p>

          {/* The one row of colour on a monochrome page.
              Hansala's own mark leads, the other platforms follow. The three
              third-party marks are other people's brands at their own values,
              not an accent of ours — see the note in `social-mark.tsx`. Only
              accounts that actually exist are rendered; an empty list produces
              no row and no gap. */}
          <ul className="mt-5 flex flex-wrap items-center gap-1">
            {/* Hansala's own record, on Hansala. A registry that is itself
                listed on the registry demonstrates the product instead of
                describing it, so it earns the first place in the row.

                Relative, not the absolute `www.hansala.com/c/hansala` that was
                supplied: an absolute production URL here sends anyone on a
                local or preview build off to the live site mid-session, and
                gives up client-side navigation for nothing. It also opens in
                place rather than a new tab — the others leave the site, this
                one does not. */}
            <li>
              <Link
                href="/c/hansala"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <HansalaMark className="text-ink" />
                <span className="sr-only">Hansala&rsquo;s own record</span>
              </Link>
            </li>
            {social.map((link) => (
              <li key={link.network}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <SocialMark network={link.network} />
                  <span className="sr-only">{SOCIAL_LABEL[link.network]}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Two on a phone, four from `sm`. Four columns at 375 leaves about
            80px each and "Search companies" wraps in every row; two gives it
            the width to sit on one line. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 lg:gap-x-8">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              {/* Same micro-label as the marketing sections, minus the mark —
                  a column heading is a label, not a section opening. */}
              <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-plus uppercase">
                {group.heading}
              </p>
              <ul className="mt-3 space-y-0.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-[14px] text-ink transition-colors hover:text-blue"
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

      {/* Two jobs now, not three: who owns this, and how to reach them. */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 text-[12px] text-plus sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          {/* The brand holds the line, the operator is named beside it.
              This read "© Vera IT. All rights reserved." — the legal entity
              where a reader expects the product. Naming the brand is the normal
              form (© Slack, not © Slack Technologies LLC) and it costs no
              disclosure: Vera IT is named and linked on the same line, and the
              full Impressum stays one click away under Company information. */}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0">
            <span>
              © {year} {company.brand}. All rights reserved.
            </span>
            {company.entityName ? (
              <span className="inline-flex items-center gap-2">
                <span aria-hidden className="text-line">
                  ·
                </span>
                {/* A real backlink: followed, not `nofollow`, because it is a
                    genuine relationship rather than an ad. `noopener` only —
                    dropping `noreferrer` keeps the referrer, which is how the
                    other end can see the link working at all. */}
                <a
                  href="https://verait.de"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex min-h-11 items-center text-plus transition-colors hover:text-ink sm:min-h-9"
                >
                  A {company.entityName} product
                </a>
              </span>
            ) : null}
          </p>
          <p>
            {/* A real tap target. This measured 16px tall — the only link in
                the footer under the 24px minimum, and a third of the 44px the
                house rule asks for. It was that way before the columns too. */}
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center text-plus transition-colors hover:text-ink sm:min-h-9"
            >
              {company.contactEmail}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
