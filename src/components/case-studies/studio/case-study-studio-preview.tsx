"use client";

import Image from "next/image";
import { caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudyDraft } from "@/components/case-studies/studio/case-study-draft";
import type { CaseStudy } from "@/types/case-study";
import type { DossierCompany } from "@/components/case-studies/studio/case-study-evidence-board";

type Props = {
  draft: CaseStudyDraft;
  company: DossierCompany;
  caseStudy: CaseStudy;
};

/** Compact live preview — no scaled full page (fixes layout blowout). */
export function CaseStudyStudioPreview({ draft, company, caseStudy }: Props) {
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, 0);
  const title = draft.title.trim() || "Untitled";
  const summary =
    draft.summary.trim() || "Summary appears on the public case file.";

  return (
    <div className="flex h-full flex-col p-5">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
        Live preview
      </p>

      <div className="mt-4 flex-1 overflow-y-auto rounded-sm border border-[var(--cf-line)] bg-white shadow-sm">
        <div className="relative aspect-[16/10] bg-[#0a1210]">
          <Image src={cover} alt="" fill className="object-cover" sizes="400px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a09]/90 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-[10px] tracking-[0.1em] text-white/45 uppercase">
              {draft.year || "—"}
              {draft.location ? ` · ${draft.location}` : ""}
            </p>
            <p className="mt-2 font-display text-lg font-medium leading-tight tracking-[-0.03em] text-white">
              {title}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <p className="text-[13px] leading-relaxed text-[var(--cf-muted)]">{summary}</p>

          {draft.highlightStat ? (
            <p className="font-display text-xl font-medium tracking-[-0.03em] text-[var(--cf-ink)]">
              {draft.highlightStat}
            </p>
          ) : null}

          {caseStudy.galleryUrls.length > 0 ? (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {caseStudy.galleryUrls.map((url) => (
                <div key={url} className="relative h-16 w-20 shrink-0 overflow-hidden bg-paper">
                  <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          ) : null}

          {(draft.challenge || draft.outcome) && (
            <div className="border-t border-[var(--cf-line)] pt-3">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-[var(--cf-muted)] uppercase">
                The work
              </p>
              {draft.challenge ? (
                <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[var(--cf-muted)]">
                  {draft.challenge}
                </p>
              ) : null}
            </div>
          )}

          <p className="text-[11px] text-[var(--cf-muted)]">{company.name}</p>
        </div>
      </div>
    </div>
  );
}
