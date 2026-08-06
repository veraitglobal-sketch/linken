import Link from "next/link";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import {
  FOOTER_ACCOUNT,
  FOOTER_DEVELOPERS,
  FOOTER_PRODUCT,
  FOOTER_TRUST,
} from "@/components/layout/footer-links";
import { Button } from "@/components/ui/button";
import {
  getLegalCompany,
  legalCopyrightName,
} from "@/lib/legal/company";

/** Static footer — no auth/DB so marketing pages can stay cached. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const company = getLegalCompany();
  const copyright = legalCopyrightName(company);

  return (
    <footer className="mt-8 border-t border-line bg-navy text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.7fr] lg:gap-8">
          <div>
            <Link href="/" className="inline-flex no-underline">
              <EmbedVerifiedLockup theme="dark" size="lg" />
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
              Company profiles, case studies, and partners — public only after
              both sides confirm.
            </p>
            <Button href="/onboarding" variant="light" className="mt-7 h-11 px-5">
              Create company
            </Button>
          </div>

          <FooterNav title="Product" links={[...FOOTER_PRODUCT]} />
          <FooterNav title="Trust" links={[...FOOTER_TRUST]} />
          <FooterNav title="Developers" links={[...FOOTER_DEVELOPERS]} />
          <FooterNav title="Account" links={[...FOOTER_ACCOUNT]} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {year} {copyright}. All rights reserved.
          </p>
          <p>
            <Link
              href="/contact"
              className="text-white/45 transition-colors hover:text-white"
            >
              {company.contactEmail}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-[14px] text-white/58 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
