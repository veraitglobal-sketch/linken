"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaseStudyDossier } from "@/components/case-studies/dossier/case-study-dossier";
import { CaseStudyStudioClient } from "@/components/case-studies/studio/case-study-studio-client";
import { CaseStudyStudioProof } from "@/components/case-studies/studio/case-study-studio-proof";
import { CaseStudyStudioStory } from "@/components/case-studies/studio/case-study-studio-story";
import { CaseStudyStudioVisual } from "@/components/case-studies/studio/case-study-studio-visual";
import { StudioLayer } from "@/components/case-studies/studio/studio-layer";
import { blueprintScore, caseStudyBlueprint } from "@/lib/case-study-blueprint";
import {
  draftFromCaseStudy,
  draftMetrics,
  type CaseStudyDraft,
  type CaseStudyStudioTab,
} from "@/components/case-studies/studio/case-study-draft";
import type { CaseStudy } from "@/types/case-study";

export type DossierCompany = { slug: string; name: string; verified: boolean };

type Props = {
  company: DossierCompany;
  caseStudy: CaseStudy;
  back: string;
  flash?: string | null;
  error?: string | null;
};

const LAYERS: {
  id: CaseStudyStudioTab;
  index: string;
  title: string;
  subtitle: string;
  pillarIds: string[];
}[] = [
  { id: "visual", index: "1", title: "Photography", subtitle: "Cover and on-site images", pillarIds: ["visuals"] },
  { id: "story", index: "2", title: "The record", subtitle: "Context, scope, narrative", pillarIds: ["hook", "context", "challenge", "approach"] },
  { id: "proof", index: "3", title: "Impact", subtitle: "Results, metrics, client voice", pillarIds: ["results", "voice"] },
  { id: "client", index: "4", title: "Confirmation", subtitle: "Client seal", pillarIds: ["proof"] },
];

export function CaseStudyEvidenceBoard({ company, caseStudy, back, flash, error }: Props) {
  const [open, setOpen] = useState<CaseStudyStudioTab>("visual");
  const [draft, setDraft] = useState<CaseStudyDraft>(() => draftFromCaseStudy(caseStudy));
  const previewCase = useMemo(() => mergeDraft(caseStudy, draft), [caseStudy, draft]);
  const { done, total } = blueprintScore(caseStudyBlueprint(previewCase, company.verified));
  const patch = (p: Partial<CaseStudyDraft>) => setDraft((d) => ({ ...d, ...p }));
  const layerDone = (ids: string[]) => ids.every((id) => caseStudyBlueprint(previewCase, company.verified).find((p) => p.id === id)?.done);

  return (
    <div className="case-file min-h-[calc(100dvh-2.75rem)]">
      <header className="border-b border-[var(--cf-line)] px-6 py-8">
        <Link href="/dashboard/cases" className="text-[13px] text-[var(--cf-muted)] hover:text-[var(--cf-ink)]">
          ← Case files
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.04em] text-[var(--cf-ink)]">
              {draft.title || "Untitled"}
            </h1>
            <p className="mt-1 text-[14px] text-[var(--cf-muted)]">
              {done}/{total} complete
            </p>
          </div>
          <Link
            href={`/c/${company.slug}/case-studies/${caseStudy.slug}`}
            className="text-[13px] font-semibold text-[var(--cf-ink)] underline-offset-4 hover:underline"
          >
            View public page →
          </Link>
        </div>
        {error ? <p className="mt-4 border-l-2 border-ember pl-4 text-[14px]">{error}</p> : null}
        {flash ? <p className="mt-4 border-l-2 border-[var(--cf-accent)] pl-4 text-[14px]">{flash}</p> : null}
      </header>

      <div className="grid lg:grid-cols-2">
        <div className="border-[var(--cf-line)] px-6 lg:border-r">
          {LAYERS.map((layer) => (
            <StudioLayer
              key={layer.id}
              index={layer.index}
              title={layer.title}
              subtitle={layer.subtitle}
              done={layerDone(layer.pillarIds)}
              open={open === layer.id}
              onToggle={() => setOpen(layer.id)}
            >
              {layer.id === "visual" ? (
                <CaseStudyStudioVisual draft={draft} caseSlug={caseStudy.slug} back={back} />
              ) : null}
              {layer.id === "story" ? (
                <CaseStudyStudioStory draft={draft} caseSlug={caseStudy.slug} companySlug={company.slug} back={back} onChange={patch} />
              ) : null}
              {layer.id === "proof" ? (
                <CaseStudyStudioProof draft={draft} caseSlug={caseStudy.slug} companySlug={company.slug} back={back} onChange={patch} />
              ) : null}
              {layer.id === "client" ? (
                <CaseStudyStudioClient companySlug={company.slug} caseStudy={caseStudy} back={back} />
              ) : null}
            </StudioLayer>
          ))}
        </div>
        <div className="hidden overflow-hidden bg-[#eceae4] lg:block">
          <div className="origin-top scale-[0.55] xl:scale-[0.62]">
            <CaseStudyDossier company={companyAsFull(company)} caseStudy={previewCase} index={0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function mergeDraft(cs: CaseStudy, draft: CaseStudyDraft): CaseStudy {
  return {
    ...cs,
    title: draft.title,
    summary: draft.summary,
    challenge: draft.challenge,
    outcome: draft.outcome,
    process: draft.process,
    location: draft.location,
    year: draft.year,
    duration: draft.duration,
    sector: draft.sector,
    scope: draft.scope,
    clientLabel: draft.clientLabel,
    highlightStat: draft.highlightStat,
    clientQuote: draft.clientQuote,
    metrics: draftMetrics(draft),
    services: draft.services.split(",").map((s) => s.trim()).filter(Boolean),
    coverImageUrl: draft.coverImageUrl,
    galleryUrls: draft.galleryUrls,
  };
}

function companyAsFull(c: DossierCompany) {
  return {
    id: "",
    slug: c.slug,
    name: c.name,
    verified: c.verified,
    tagline: "",
    description: "",
    category: "",
    city: "",
    country: "",
    website: "",
    services: [],
    logoInitials: c.name.slice(0, 2).toUpperCase(),
  };
}
