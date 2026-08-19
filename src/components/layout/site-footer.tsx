import Link from "next/link";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import {
  FOOTER_LEGAL,
  FOOTER_PRIMARY,
} from "@/components/layout/footer-links";
import {
  getLegalCompany,
  legalCopyrightName,
} from "@/lib/legal/company";

/** Quiet paper footer. Close is the last navy chapter; this is the sitemap. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const company = getLegalCompany();
  const copyright = legalCopyrightName(company);

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
