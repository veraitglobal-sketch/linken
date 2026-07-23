"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaseStudyLivePreview } from "@/components/case-studies/studio/case-study-live-preview";
import { CaseStudyStudioClient } from "@/components/case-studies/studio/case-study-studio-client";
import { CaseStudyStudioStory } from "@/components/case-studies/studio/case-study-studio-story";
import { CaseStudyStudioVisual } from "@/components/case-studies/studio/case-study-studio-visual";
import {
  draftFromCaseStudy,
  type CaseStudyDraft,
  type CaseStudyStudioTab,
} from "@/components/case-studies/studio/case-study-draft";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  companyName: string;
  caseStudy: CaseStudy;
  back: string;
  flash?: string | null;
  error?: string | null;
};

const TABS: { id: CaseStudyStudioTab; label: string }[] = [
  { id: "visual", label: "Visuals" },
  { id: "story", label: "Story" },
  { id: "client", label: "Client proof" },
];

export function CaseStudyStudio({
  companySlug,
  companyName,
  caseStudy,
  back,
  flash,
  error,
}: Props) {
  const [tab, setTab] = useState<CaseStudyStudioTab>("visual");
  const [draft, setDraft] = useState<CaseStudyDraft>(() =>
    draftFromCaseStudy(caseStudy),
  );

  const readiness = useMemo(() => {
    let n = 0;
    if (draft.coverImageUrl) n += 1;
    if (draft.summary.trim()) n += 1;
    if (draft.challenge.trim() && draft.outcome.trim()) n += 1;
    if (draft.galleryUrls.length > 0) n += 1;
    return n;
  }, [draft]);

  const patch = (p: Partial<CaseStudyDraft>) =>
    setDraft((d) => ({ ...d, ...p }));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/dashboard/cases"
            className="text-[12px] font-semibold text-muted hover:text-ink"
          >
            ← Portfolio
          </Link>
          <p className="mt-2 text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
            Case study studio
          </p>
          <h1 className="mt-1 font-display text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.04em] text-ink">
            {draft.title || "Untitled project"}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {readiness}/4 portfolio essentials ready · preview updates as you work
          </p>
        </div>
        <Link
          href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
          className="inline-flex h-10 items-center rounded-xl border border-line bg-surface px-4 text-[12px] font-semibold text-ink hover:bg-paper"
        >
          Open live page →
        </Link>
      </header>

      {error ? (
        <p className="mb-4 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-[13px] text-ink">
          {error}
        </p>
      ) : null}
      {flash ? (
        <p className="mb-4 rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] text-ink">
          {flash}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-start">
        <div className="min-w-0 rounded-[28px] border border-line bg-[#f7f8f7] p-4 sm:p-5">
          <nav className="mb-5 flex gap-1 rounded-2xl bg-paper p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-colors ${
                  tab === t.id
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "visual" ? (
            <CaseStudyStudioVisual
              draft={draft}
              caseSlug={caseStudy.slug}
              back={back}
            />
          ) : null}
          {tab === "story" ? (
            <CaseStudyStudioStory
              draft={draft}
              caseSlug={caseStudy.slug}
              companySlug={companySlug}
              back={back}
              onChange={patch}
            />
          ) : null}
          {tab === "client" ? (
            <CaseStudyStudioClient
              companySlug={companySlug}
              caseStudy={caseStudy}
              back={back}
            />
          ) : null}
        </div>

        <aside className="xl:sticky xl:top-20">
          <CaseStudyLivePreview draft={draft} companyName={companyName} />
        </aside>
      </div>
    </div>
  );
}
