import Link from "next/link";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import type { CaseStudyPartner } from "@/types/case-study";

type Props = { partners: CaseStudyPartner[]; companyName: string };

export function DossierPartners({ partners }: Props) {
  if (!partners.length) return null;
  return (
    <section className="border-t border-[var(--cf-line)] pt-10">
      <h2 className="text-[11px] font-semibold tracking-[0.16em] text-[var(--cf-muted)] uppercase">
        Partners
      </h2>
      <div className="mt-5">
        <CaseStudyPartners partners={partners} />
      </div>
    </section>
  );
}

export function DossierFooterCta({
  companySlug,
  companyName,
  companyHref,
}: {
  companySlug: string;
  companyName: string;
  companyHref?: string;
}) {
  const profile = companyHref ?? `/c/${companySlug}`;
  return (
    <footer className="border-t border-[var(--cf-line)] pt-12 text-center">
      <p className="font-display text-2xl font-medium tracking-[-0.03em] text-[var(--cf-ink)]">
        Work with {companyName}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link
          href={`${profile}#contact`}
          className="inline-flex h-11 items-center border border-[var(--cf-ink)] px-6 text-[13px] font-semibold text-[var(--cf-ink)]"
        >
          Get in touch
        </Link>
        <Link
          href={profile}
          className="inline-flex h-11 items-center px-6 text-[13px] font-semibold text-[var(--cf-muted)] underline-offset-4 hover:underline"
        >
          Profile
        </Link>
      </div>
    </footer>
  );
}
