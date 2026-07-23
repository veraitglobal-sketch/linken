import Link from "next/link";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import type { CaseStudyPartner } from "@/types/case-study";

type Props = {
  partners: CaseStudyPartner[];
  companyName: string;
};

export function CaseStudyBuiltWith({ partners, companyName }: Props) {
  if (!partners.length) return null;

  const confirmed = partners.filter((p) => p.confirmed);

  return (
    <section className="rounded-[32px] border border-line bg-surface px-7 py-8 sm:px-10">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Built with
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.035em] text-ink">
        Confirmed partners on this project
      </h2>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        {companyName} tagged firms who worked on this case. Each role is confirmed
        by the partner company — not just a logo on a slide.
      </p>
      <div className="mt-6">
        <CaseStudyPartners partners={partners} />
      </div>
      {confirmed.length > 0 ? (
        <p className="mt-4 text-[12px] text-muted">
          {confirmed.length} of {partners.length} confirmed on Hansala.
        </p>
      ) : null}
    </section>
  );
}

export function CaseStudyWorkCta({
  companySlug,
  companyName,
}: {
  companySlug: string;
  companyName: string;
}) {
  return (
    <section className="rounded-[32px] bg-navy px-8 py-10 text-white shadow-[0_22px_56px_rgba(8,20,18,0.18)] sm:px-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
            Work together
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.04em]">
            Like what you see?
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/65">
            {companyName} publishes verified proof on Hansala — not just marketing
            copy. Start with a profile inquiry.
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
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 px-6 text-[13px] font-semibold text-white"
          >
            Company profile
          </Link>
        </div>
      </div>
    </section>
  );
}
