"use client";

import {
  blueprintScore,
  caseStudyBlueprint,
  type BlueprintPillar,
} from "@/lib/case-study-blueprint";
import type { CaseStudyDraft } from "@/components/case-studies/studio/case-study-draft";
import { draftMetrics } from "@/components/case-studies/studio/case-study-draft";
import type { CaseStudy } from "@/types/case-study";
import type { CaseStudyStudioTab } from "@/components/case-studies/studio/case-study-draft";

type Props = {
  draft: CaseStudyDraft;
  caseStudy: CaseStudy;
  companyVerified: boolean;
  onJump: (tab: CaseStudyStudioTab) => void;
};

function draftAsCaseStudy(draft: CaseStudyDraft, cs: CaseStudy): CaseStudy {
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

export function CaseStudyBlueprintPanel({
  draft,
  caseStudy,
  companyVerified,
  onJump,
}: Props) {
  const pillars = caseStudyBlueprint(
    draftAsCaseStudy(draft, caseStudy),
    companyVerified,
  );
  const { done, total } = blueprintScore(pillars);

  return (
    <div className="rounded-[24px] border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          Case study blueprint
        </p>
        <p className="font-display text-xl font-medium tabular-nums text-ink">
          {done}/{total}
        </p>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        Eight pillars of a premium B2B case study — plus Hansala proof on top.
      </p>
      <ul className="mt-4 space-y-2">
        {pillars.map((p) => (
          <BlueprintRow key={p.id} pillar={p} onJump={onJump} />
        ))}
      </ul>
    </div>
  );
}

function BlueprintRow({
  pillar,
  onJump,
}: {
  pillar: BlueprintPillar;
  onJump: (tab: CaseStudyStudioTab) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onJump(pillar.tab)}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-paper"
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
            pillar.done ? "bg-[#1a5c51]/12 text-blue" : "bg-paper text-muted"
          }`}
        >
          {pillar.done ? "✓" : "·"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-ink">
            {pillar.label}
          </span>
          <span className="block truncate text-[11px] text-muted">
            {pillar.hint}
          </span>
        </span>
      </button>
    </li>
  );
}
