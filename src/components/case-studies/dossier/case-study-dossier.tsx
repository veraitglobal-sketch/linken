import { CaseFileCredentials } from "@/components/case-studies/dossier/case-file-credentials";
import { DossierChapters } from "@/components/case-studies/dossier/dossier-chapters";
import { DossierClientSeal } from "@/components/case-studies/dossier/dossier-client-seal";
import { DossierExhibit } from "@/components/case-studies/dossier/dossier-exhibit";
import { DossierFilmstrip } from "@/components/case-studies/dossier/dossier-filmstrip";
import {
  DossierFooterCta,
  DossierPartners,
} from "@/components/case-studies/dossier/dossier-partners";
import { DossierImpact } from "@/components/case-studies/dossier/dossier-impact";
import { DossierOpener } from "@/components/case-studies/dossier/dossier-opener";
import { DossierScope } from "@/components/case-studies/dossier/dossier-scope";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  editable?: boolean;
  requested?: boolean;
  error?: string;
  index?: number;
  companyHref?: string;
};

export function CaseStudyDossier({
  company,
  caseStudy,
  editable = false,
  requested = false,
  error,
  index = 0,
  companyHref,
}: Props) {
  const clientConfirmed = caseStudy.clientConfirmation?.status === "confirmed";

  return (
    <article className="case-file pb-28">
      <DossierOpener
        company={company}
        caseStudy={caseStudy}
        index={index}
        companyHref={companyHref}
      />
      <CaseFileCredentials company={company} caseStudy={caseStudy} />

      <div className="mx-auto max-w-3xl px-6 pt-16">
        {error ? (
          <p className="mb-10 border-l-2 border-ember pl-4 text-[14px] text-ink">{error}</p>
        ) : null}
        {requested ? (
          <p className="mb-10 border-l-2 border-[var(--cf-accent)] pl-4 text-[14px] text-ink">
            Confirmation request sent.
          </p>
        ) : null}

        <DossierClientSeal caseStudy={caseStudy} />
        <DossierScope scope={caseStudy.scope} services={caseStudy.services} />
        <DossierChapters
          challenge={caseStudy.challenge}
          outcome={caseStudy.outcome}
          process={caseStudy.process}
          clientConfirmed={clientConfirmed}
        />
      </div>

      <div className="mt-20 space-y-20">
        <DossierImpact
          highlightStat={caseStudy.highlightStat}
          duration={caseStudy.duration}
          metrics={caseStudy.metrics}
        />
        <div className="mx-auto max-w-3xl px-6">
          <DossierExhibit caseStudy={caseStudy} />
        </div>
        <DossierFilmstrip urls={caseStudy.galleryUrls} title={caseStudy.title} />
        <div className="mx-auto max-w-3xl space-y-20 px-6">
          <DossierPartners partners={caseStudy.partners} companyName={company.name} />
          <DossierFooterCta
            companySlug={company.slug}
            companyName={company.name}
            companyHref={companyHref}
          />
          {editable ? (
            <p className="text-center text-[13px] text-[var(--cf-muted)]">
              <a href={`/dashboard/cases/${caseStudy.slug}`} className="text-ink underline-offset-4 hover:underline">
                Edit case file
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
