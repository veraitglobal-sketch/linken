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
import { DossierRail } from "@/components/case-studies/dossier/dossier-rail";
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
};

/** Hansala case study — verified dossier, not a marketing page. */
export function CaseStudyDossier({
  company,
  caseStudy,
  editable = false,
  requested = false,
  error,
  index = 0,
}: Props) {
  const clientConfirmed = caseStudy.clientConfirmation?.status === "confirmed";

  return (
    <div className="pb-24">
      <DossierOpener company={company} caseStudy={caseStudy} index={index} />

      <div className="mx-auto max-w-[1400px] px-4 pt-12 sm:px-6">
        {error ? (
          <p className="mb-8 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        {requested ? (
          <p className="mb-8 rounded-2xl border border-blue/30 bg-blue/10 px-4 py-3 text-sm text-ink">
            Confirmation request sent.
          </p>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[300px_minmax(0,1fr)]">
          <DossierRail company={company} caseStudy={caseStudy} />

          <div className="min-w-0 space-y-16 lg:space-y-20">
            <DossierClientSeal caseStudy={caseStudy} />
            <DossierScope scope={caseStudy.scope} services={caseStudy.services} />
            <DossierChapters
              challenge={caseStudy.challenge}
              outcome={caseStudy.outcome}
              process={caseStudy.process}
              clientConfirmed={clientConfirmed}
            />
            <DossierImpact
              highlightStat={caseStudy.highlightStat}
              duration={caseStudy.duration}
              metrics={caseStudy.metrics}
            />
            <DossierExhibit caseStudy={caseStudy} />
            <DossierFilmstrip urls={caseStudy.galleryUrls} title={caseStudy.title} />
            <DossierPartners partners={caseStudy.partners} companyName={company.name} />
            <DossierFooterCta companySlug={company.slug} companyName={company.name} />

            {editable ? (
              <p className="text-center text-[13px] text-muted">
                <a
                  href={`/dashboard/cases/${caseStudy.slug}`}
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Open evidence board →
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
