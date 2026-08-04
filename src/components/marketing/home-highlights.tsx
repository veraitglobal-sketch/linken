import { EmbedReferences } from "@/components/embed/embed-references";
import { ConfirmationStage } from "@/components/marketing/confirmation-stage";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import { DEMO_COMPANY, DEMO_REFERENCES } from "@/data/mock/demo-profile";
import { getSiteUrl } from "@/lib/site";

export function HomeHighlights() {
  const profileUrl = `${getSiteUrl()}/demo`;

  const references = DEMO_REFERENCES.map((reference) => ({
    clientName: reference.clientName,
    service: reference.service,
    period: reference.ongoing
      ? `since ${reference.startedYear}`
      : `${reference.startedYear}–${reference.endedYear}`,
    ongoing: reference.ongoing,
  }));

  /** The record the stage plays out — the first confirmed client on file. */
  const lead = references[0];

  return (
    <HomeSection tone="tight">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>On your site</HomeEyebrow>
        <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
          A company cannot write its own record.
        </h2>
        <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-soft">
          The other side writes it. What they confirm is what your page shows —
          one paste, and it keeps itself current.
        </p>

        <div className="mt-12">
          <ConfirmationStage
            claimant={DEMO_COMPANY.name}
            confirmer={lead.clientName}
            subject={lead.service}
            period={lead.period}
            record={
              <EmbedReferences
                name={DEMO_COMPANY.name}
                references={references}
                totalCount={references.length}
                profileUrl={profileUrl}
                theme="light"
              />
            }
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
          <p className="max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Everything after the paste is a setting. A newly confirmed partner
            appears on your page without anyone touching the code again.
          </p>
          <p className="shrink-0 text-[12px] text-muted">
            {DEMO_COMPANY.name} — demo profile, not a real company.
          </p>
        </div>
      </div>
    </HomeSection>
  );
}
