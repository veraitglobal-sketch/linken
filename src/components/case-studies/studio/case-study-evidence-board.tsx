"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaseStudyDossier } from "@/components/case-studies/dossier/case-study-dossier";
import { CaseStudyStudioClient } from "@/components/case-studies/studio/case-study-studio-client";
import { CaseStudyStudioProof } from "@/components/case-studies/studio/case-study-studio-proof";
import { CaseStudyStudioStory } from "@/components/case-studies/studio/case-study-studio-story";
import { CaseStudyStudioVisual } from "@/components/case-studies/studio/case-study-studio-visual";
import { StudioLayer } from "@/components/case-studies/studio/studio-layer";
import {
  blueprintScore,
  caseStudyBlueprint,
} from "@/lib/case-study-blueprint";
import {
  draftFromCaseStudy,
  draftMetrics,
  type CaseStudyDraft,
  type CaseStudyStudioTab,
} from "@/components/case-studies/studio/case-study-draft";
import type { CaseStudy } from "@/types/case-study";

export type DossierCompany = {
  slug: string;
  name: string;
  verified: boolean;
};

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
  {
    id: "visual",
    index: "L-01",
    title: "Visual evidence",
    subtitle: "Cover photo and field exhibit",
    pillarIds: ["visuals"],
  },
  {
    id: "story",
    index: "L-02",
    title: "The record",
    subtitle: "Context, scope, and three chapters",
    pillarIds: ["hook", "context", "challenge", "approach"],
  },
  {
    id: "proof",
    index: "L-03",
    title: "Impact data",
    subtitle: "Headline result, metrics, client voice",
    pillarIds: ["results", "voice"],
  },
  {
    id: "client",
    index: "L-04",
    title: "Client seal",
    subtitle: "Send confirmation — the Hansala difference",
    pillarIds: ["proof"],
  },
];

export function CaseStudyEvidenceBoard({
  company,
  caseStudy,
  back,
  flash,
  error,
}: Props) {
  const [open, setOpen] = useState<CaseStudyStudioTab>("visual");
  const [draft, setDraft] = useState<CaseStudyDraft>(() =>
    draftFromCaseStudy(caseStudy),
  );

  const previewCase = useMemo(
    () => mergeDraft(caseStudy, draft),
    [caseStudy, draft],
  );

  const pillars = useMemo(
    () => caseStudyBlueprint(previewCase, company.verified),
    [previewCase, company.verified],
  );
  const { done, total } = blueprintScore(pillars);

  const patch = (p: Partial<CaseStudyDraft>) =>
    setDraft((d) => ({ ...d, ...p }));

  const layerDone = (ids: string[]) =>
    ids.every((id) => pillars.find((p) => p.id === id)?.done);

  return (
    <div className="min-h-screen bg-[#081412]">
      <header className="border-b border-white/8 px-4 py-6 sm:px-8">
        <Link
          href="/dashboard/cases"
          className="text-[12px] font-medium text-white/40 hover:text-white/65"
        >
          ← Portfolio
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-blue-soft uppercase">
              Evidence board
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-medium tracking-[-0.04em] text-white">
              {draft.title || "Untitled dossier"}
            </h1>
            <p className="mt-1 text-[13px] text-white/45">
              {done}/{total} layers filed · build the dossier layer by layer
            </p>
          </div>
          <Link
            href={`/c/${company.slug}/case-studies/${caseStudy.slug}`}
            className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-[12px] font-semibold text-white hover:bg-white/5"
          >
            Open live dossier →
          </Link>
        </div>
        {error ? (
          <p className="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-white">
            {error}
          </p>
        ) : null}
        {flash ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/80">
            {flash}
          </p>
        ) : null}
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-0 lg:grid-cols-2">
        <div className="space-y-1 border-b border-white/8 p-4 sm:p-6 lg:border-b-0 lg:border-r">
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
                <CaseStudyStudioVisual
                  draft={draft}
                  caseSlug={caseStudy.slug}
                  back={back}
                />
              ) : null}
              {layer.id === "story" ? (
                <CaseStudyStudioStory
                  draft={draft}
                  caseSlug={caseStudy.slug}
                  companySlug={company.slug}
                  back={back}
                  onChange={patch}
                />
              ) : null}
              {layer.id === "proof" ? (
                <CaseStudyStudioProof
                  draft={draft}
                  caseSlug={caseStudy.slug}
                  companySlug={company.slug}
                  back={back}
                  onChange={patch}
                />
              ) : null}
              {layer.id === "client" ? (
                <CaseStudyStudioClient
                  companySlug={company.slug}
                  caseStudy={caseStudy}
                  back={back}
                />
              ) : null}
            </StudioLayer>
          ))}
        </div>

        <div className="bg-[#eef0ee] p-4 sm:p-6">
          <p className="mb-4 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
            Live dossier preview
          </p>
          <div className="origin-top scale-[0.72] sm:scale-[0.82] lg:scale-[0.68] xl:scale-[0.78]">
            <CaseStudyDossier
              company={companyAsFull(company)}
              caseStudy={previewCase}
              index={0}
            />
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
