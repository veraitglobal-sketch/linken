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

function HiddenStoryFields({ draft }: { draft: CaseStudyDraft }) {
  return (
    <>
      <input type="hidden" name="title" value={draft.title} />
      <input type="hidden" name="summary" value={draft.summary} />
      <input type="hidden" name="challenge" value={draft.challenge} />
      <input type="hidden" name="outcome" value={draft.outcome} />
      <input type="hidden" name="process" value={draft.process} />
      <input type="hidden" name="location" value={draft.location} />
      <input type="hidden" name="year" value={draft.year} />
      <input type="hidden" name="services" value={draft.services} />
      <input type="hidden" name="sector" value={draft.sector} />
      <input type="hidden" name="scope" value={draft.scope} />
      <input type="hidden" name="client_label" value={draft.clientLabel} />
      <input type="hidden" name="duration" value={draft.duration} />
      <input type="hidden" name="highlight_stat" value={draft.highlightStat} />
      <input type="hidden" name="client_quote" value={draft.clientQuote} />
      <input type="hidden" name="metric_1_label" value={draft.metric1Label} />
      <input type="hidden" name="metric_1_value" value={draft.metric1Value} />
      <input type="hidden" name="metric_2_label" value={draft.metric2Label} />
      <input type="hidden" name="metric_2_value" value={draft.metric2Value} />
      <input type="hidden" name="metric_3_label" value={draft.metric3Label} />
      <input type="hidden" name="metric_3_value" value={draft.metric3Value} />
    </>
  );
}

export function CaseStudyStudioProof({
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
      <HiddenStoryFields draft={draft} />

      <Panel title="Headline result" hint="Big number or outcome — shows in hero and metrics.">
        <Input
          name="highlight_stat"
          value={draft.highlightStat}
          onChange={(e) => onChange({ highlightStat: e.target.value })}
          placeholder="40% faster handover"
          className="border-0 bg-paper/60 px-0 font-display text-xl focus:ring-0"
        />
      </Panel>

      <Panel title="Duration" hint="How long the project ran.">
        <Input
          name="duration"
          value={draft.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
          placeholder="8 weeks"
          className="border-0 bg-paper/60 px-0 focus:ring-0"
        />
      </Panel>

      <Panel
        title="Impact metrics"
        hint="Up to 3 — e.g. Timeline · 12 months, Team · 24 people."
      >
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="grid grid-cols-2 gap-2">
              <Input
                name={`metric_${n}_label`}
                value={draft[`metric${n}Label` as keyof CaseStudyDraft] as string}
                onChange={(e) =>
                  onChange({ [`metric${n}Label`]: e.target.value } as Partial<CaseStudyDraft>)
                }
                placeholder="Label"
                className="border-0 bg-paper/60 focus:ring-0"
              />
              <Input
                name={`metric_${n}_value`}
                value={draft[`metric${n}Value` as keyof CaseStudyDraft] as string}
                onChange={(e) =>
                  onChange({ [`metric${n}Value`]: e.target.value } as Partial<CaseStudyDraft>)
                }
                placeholder="Value"
                className="border-0 bg-paper/60 focus:ring-0"
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Client quote"
        hint="Strongest with client confirmation — shows on the public page."
      >
        <Textarea
          name="client_quote"
          value={draft.clientQuote}
          onChange={(e) => onChange({ clientQuote: e.target.value })}
          rows={4}
          placeholder="What the client said about working with you…"
          className="mt-3 border-0 bg-paper/60 px-0 focus:ring-0"
        />
      </Panel>

      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-xl bg-accent px-6 text-[13px] font-semibold text-white hover:bg-accent-hover"
      >
        Save proof layer
      </button>
    </form>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-line bg-surface p-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        {title}
      </p>
      <p className="mt-1 text-[13px] text-muted">{hint}</p>
      {children}
    </div>
  );
}
