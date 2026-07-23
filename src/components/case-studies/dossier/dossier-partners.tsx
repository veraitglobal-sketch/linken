import Link from "next/link";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import type { CaseStudyPartner } from "@/types/case-study";

type Props = { partners: CaseStudyPartner[]; companyName: string };

export function DossierPartners({ partners, companyName }: Props) {
  if (!partners.length) return null;

  return (
    <section>
      <p className="font-mono text-[11px] tracking-[0.18em] text-blue uppercase">
        Co-signatures
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.035em] text-ink">
        Partners who confirmed their role
      </h2>
      <p className="mt-2 max-w-lg text-[14px] text-ink-soft">
        {companyName} tagged firms on this dossier. Confirmed roles appear below.
      </p>
      <div className="mt-6">
        <CaseStudyPartners partners={partners} />
      </div>
    </section>
  );
}

export function DossierFooterCta({
  companySlug,
  companyName,
}: {
  companySlug: string;
  companyName: string;
}) {
  return (
    <footer className="relative overflow-hidden rounded-[32px] bg-navy-deep px-8 py-12 text-white sm:px-12">
      <div className="stage-grain absolute inset-0 opacity-40" />
      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-blue-soft uppercase">
            Close file
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.04em]">
            Want a dossier like this?
          </h2>
          <p className="mt-3 max-w-md text-[15px] text-white/60">
            {companyName} publishes verified proof on Hansala — not slide decks.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0">
          <Link
            href={`/c/${companySlug}#contact`}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-[13px] font-semibold text-ink"
          >
            Contact {companyName.split(" ")[0]}
          </Link>
          <Link
            href={`/c/${companySlug}`}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-6 text-[13px] font-semibold text-white"
          >
            Company profile
          </Link>
        </div>
      </div>
    </footer>
  );
}
