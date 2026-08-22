import Link from "next/link";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import {
  FOOTER_LEGAL,
  FOOTER_PRIMARY,
} from "@/components/layout/footer-links";
import { getSocialLinks } from "@/components/layout/social-links";
import { SOCIAL_LABEL, SocialMark } from "@/components/layout/social-mark";
import { HansalaMark } from "@/components/ui/hansala-mark";
import {
  getLegalCompany,
  legalCopyrightName,
} from "@/lib/legal/company";

/** Quiet paper footer. Close is the last navy chapter; this is the sitemap. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const company = getLegalCompany();
  const copyright = legalCopyrightName(company);
  const social = getSocialLinks();

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
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
        <nav
          aria-label="Footer"
          className="-mx-2.5 flex flex-wrap lg:max-w-xl lg:justify-end"
        >
          {FOOTER_PRIMARY.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center px-2.5 text-[14px] text-ink transition-colors hover:text-blue"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3 text-[12px] text-plus sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {year} {copyright}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="-mx-2 flex flex-wrap">
            {FOOTER_LEGAL.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center px-2 text-[12px] text-plus transition-colors hover:text-ink sm:min-h-8"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p>
            <Link
              href="/contact"
              className="text-plus transition-colors hover:text-ink"
            >
              {company.contactEmail}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
