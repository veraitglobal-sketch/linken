"use client";

import type { ReactNode } from "react";
import { updateCaseStudyContent } from "@/features/case-studies/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CaseStudyDraft } from "@/components/case-studies/studio/case-study-draft";

type Props = {
  draft: CaseStudyDraft;
  caseSlug: string;
  companySlug: string;
  back: string;
  onChange: (patch: Partial<CaseStudyDraft>) => void;
};

export function CaseStudyStudioStory({
  draft,
  caseSlug,
  companySlug,
  back,
  onChange,
}: Props) {
  return (
    <form action={updateCaseStudyContent} className="space-y-4">
      <input type="hidden" name="company_slug" value={companySlug} />
      <input type="hidden" name="case_slug" value={caseSlug} />
      <input type="hidden" name="back" value={back} />
      <input type="hidden" name="title" value={draft.title} />
      <input type="hidden" name="summary" value={draft.summary} />
      <input type="hidden" name="challenge" value={draft.challenge} />
      <input type="hidden" name="outcome" value={draft.outcome} />
      <input type="hidden" name="process" value={draft.process} />
      <input type="hidden" name="location" value={draft.location} />
      <input type="hidden" name="year" value={draft.year} />
      <input type="hidden" name="services" value={draft.services} />

      <StoryBlock label="Headline">
        <Input
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="border-0 bg-transparent px-0 font-display text-2xl font-medium tracking-[-0.03em] focus:ring-0"
          placeholder="Vienna HQ fit-out"
        />
      </StoryBlock>

      <StoryBlock label="The hook" hint="Why someone should click and read on.">
        <Textarea
          value={draft.summary}
          rows={3}
          onChange={(e) => onChange({ summary: e.target.value })}
          className="min-h-[100px] border-0 bg-paper/60 px-0 text-[16px] leading-relaxed focus:ring-0"
        />
      </StoryBlock>

      <div className="grid gap-4 sm:grid-cols-2">
        <StoryBlock label="Year">
          <Input
            value={draft.year}
            onChange={(e) => onChange({ year: e.target.value })}
            className="border-0 bg-paper/60 px-0 focus:ring-0"
          />
        </StoryBlock>
        <StoryBlock label="Location">
          <Input
            value={draft.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="border-0 bg-paper/60 px-0 focus:ring-0"
            placeholder="Vienna, AT"
          />
        </StoryBlock>
      </div>

      <StoryBlock label="Services">
        <Input
          value={draft.services}
          onChange={(e) => onChange({ services: e.target.value })}
          className="border-0 bg-paper/60 px-0 focus:ring-0"
          placeholder="Architecture, MEP, Fit-out"
        />
      </StoryBlock>

      <StoryBlock label="The challenge" hint="Problem, constraints, timeline.">
        <Textarea
          value={draft.challenge}
          rows={4}
          onChange={(e) => onChange({ challenge: e.target.value })}
          className="border-0 bg-paper/60 px-0 focus:ring-0"
        />
      </StoryBlock>

      <StoryBlock label="The outcome" hint="Results and client impact.">
        <Textarea
          value={draft.outcome}
          rows={4}
          onChange={(e) => onChange({ outcome: e.target.value })}
          className="border-0 bg-paper/60 px-0 focus:ring-0"
        />
      </StoryBlock>

      <StoryBlock label="How you delivered" hint="Process, team, tools.">
        <Textarea
          value={draft.process}
          rows={5}
          onChange={(e) => onChange({ process: e.target.value })}
          className="border-0 bg-paper/60 px-0 focus:ring-0"
        />
      </StoryBlock>

      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-xl bg-accent px-6 text-[13px] font-semibold text-white hover:bg-accent-hover"
      >
        Save story
      </button>
    </form>
  );
}

function StoryBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-line bg-surface p-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        {label}
      </p>
      {hint ? <p className="mt-1 text-[13px] text-muted">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}
