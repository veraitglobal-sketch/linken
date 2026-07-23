import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import { RequestClientConfirmation } from "@/components/case-studies/request-client-confirmation";
import { Button } from "@/components/ui/button";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  editable?: boolean;
};

export function CaseStudyAside({ company, caseStudy, editable = false }: Props) {
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[28px] border border-line bg-surface p-6 shadow-[0_8px_28px_rgba(8,20,18,0.04)]">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Project details
        </p>
        <dl className="mt-4 space-y-3 text-[13px]">
          {caseStudy.year ? (
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="text-muted">Year</dt>
              <dd className="font-semibold text-ink">{caseStudy.year}</dd>
            </div>
          ) : null}
          {caseStudy.location ? (
            <div className="flex justify-between gap-4 border-b border-line pb-3">
              <dt className="text-muted">Location</dt>
              <dd className="font-semibold text-ink">{caseStudy.location}</dd>
            </div>
          ) : null}
          {caseStudy.services.length > 0 ? (
            <div>
              <dt className="text-muted">Services</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {caseStudy.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                  >
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      {caseStudy.partners.length > 0 ? (
        <div className="rounded-[28px] border border-line bg-surface p-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            Confirmed partners
          </p>
          <p className="mt-2 text-[13px] text-ink-soft">
            Each partner confirmed their role on this project.
          </p>
          <div className="mt-4">
            <CaseStudyPartners partners={caseStudy.partners} />
          </div>
        </div>
      ) : null}

      <div className="rounded-[28px] bg-navy p-6 text-white shadow-[0_22px_56px_rgba(8,20,18,0.18)]">
        <p className="font-display text-xl font-medium tracking-[-0.03em]">
          Interested in similar work?
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-white/65">
          View {company.name}&apos;s verified profile or send a project inquiry.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button href={`/c/${company.slug}#contact`} variant="light" className="h-11">
            Work with {company.name.split(" ")[0]}
          </Button>
          <Button href={`/c/${company.slug}`} variant="onDark" className="h-11">
            Company profile
          </Button>
        </div>
      </div>

      {editable && !confirmed ? (
        <div className="rounded-[28px] border border-dashed border-line bg-surface/80 p-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            Client confirmation
          </p>
          <p className="mt-2 text-[13px] text-ink-soft">
            Strongest proof — the client confirms delivery.
          </p>
          <div className="mt-4">
            <RequestClientConfirmation
              companySlug={company.slug}
              caseSlug={caseStudy.slug}
            />
          </div>
        </div>
      ) : null}

      {editable ? (
        <Button
          href={`/dashboard/cases/${caseStudy.slug}`}
          variant="secondary"
          className="h-11 w-full"
        >
          Edit case study
        </Button>
      ) : null}
    </aside>
  );
}
