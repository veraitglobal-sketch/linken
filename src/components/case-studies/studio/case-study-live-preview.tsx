"use client";

import Image from "next/image";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudyDraft } from "@/components/case-studies/studio/case-study-draft";
import {
  draftMetrics,
  servicesList,
} from "@/components/case-studies/studio/case-study-draft";

type Props = {
  draft: CaseStudyDraft;
  companyName: string;
};

/** Scaled live preview — mirrors the public case study layout. */
export function CaseStudyLivePreview({ draft, companyName }: Props) {
  const cover = caseStudyCoverUrl(draft.coverImageUrl, 0);
  const services = servicesList(draft.services);
  const metrics = draftMetrics(draft);
  const title = draft.title.trim() || "Project title";
  const summary =
    draft.summary.trim() ||
    "Your summary appears here — the hook that makes clients read on.";

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-[#eef0ee] shadow-[0_22px_56px_rgba(8,20,18,0.12)]">
      <div className="border-b border-line bg-surface px-4 py-2.5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
          Live preview
        </p>
      </div>

      <div className="max-h-[min(72vh,820px)] overflow-y-auto">
        <div className="relative aspect-[16/10] overflow-hidden bg-navy">
          <Image
            src={cover}
            alt=""
            fill
            className={`object-cover ${caseStudyCoverFocus(0)}`}
            sizes="400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081412]/90 via-[#081412]/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase">
              Case study · {draft.year || "2025"}
              {draft.location ? ` · ${draft.location}` : ""}
            {draft.sector ? ` · ${draft.sector}` : ""}
            {draft.duration ? ` · ${draft.duration}` : ""}
            </p>
            <p className="mt-2 font-display text-2xl font-medium leading-tight tracking-[-0.04em] text-white">
              {title}
            </p>
            {draft.highlightStat ? (
              <p className="mt-2 font-display text-lg font-medium text-ember">
                {draft.highlightStat}
              </p>
            ) : null}
            <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/65">
              {summary}
            </p>
            <p className="mt-3 text-[11px] text-white/40">{companyName}</p>
          </div>
        </div>

        {metrics.length > 0 || draft.highlightStat ? (
          <div className="grid grid-cols-2 gap-px bg-line">
            {draft.highlightStat ? (
              <div className="col-span-2 bg-surface px-4 py-3">
                <p className="text-[9px] font-semibold tracking-[0.12em] text-ember uppercase">
                  Headline result
                </p>
                <p className="mt-1 font-display text-xl font-medium text-ink">
                  {draft.highlightStat}
                </p>
              </div>
            ) : null}
            {metrics.map((m) => (
              <div key={m.label} className="bg-surface px-3 py-2.5">
                <p className="text-[9px] font-semibold tracking-[0.12em] text-muted uppercase">
                  {m.label}
                </p>
                <p className="mt-0.5 font-display text-lg font-medium text-ink">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="border-b border-line bg-paper/80 px-4 py-3">
          <p className="text-[9px] font-semibold tracking-[0.12em] text-blue uppercase">
            Hansala proof stack
          </p>
          <p className="mt-1 text-[11px] text-muted">
            Client · Partners · Verified · Metrics
          </p>
        </div>

        {(draft.challenge || draft.outcome || draft.process) && (
          <div className="space-y-2 border-b border-line bg-surface p-4">
            {draft.challenge ? (
              <PreviewBlock label="Challenge" text={draft.challenge} />
            ) : null}
            {draft.outcome ? (
              <PreviewBlock label="Outcome" text={draft.outcome} />
            ) : null}
            {draft.process ? (
              <PreviewBlock label="How we delivered" text={draft.process} />
            ) : null}
          </div>
        )}

        {draft.clientQuote ? (
          <blockquote className="border-b border-line bg-paper px-4 py-4">
            <p className="text-[12px] leading-relaxed text-ink-soft italic">
              &ldquo;{draft.clientQuote}&rdquo;
            </p>
          </blockquote>
        ) : null}

        {draft.galleryUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 bg-paper p-1">
            {draft.galleryUrls.slice(0, 4).map((url) => (
              <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image src={url} alt="" fill className="object-cover" sizes="160px" />
              </div>
            ))}
          </div>
        ) : null}

        {services.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 bg-surface px-4 py-3">
            {services.map((s) => (
              <span
                key={s}
                className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-ink-soft"
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PreviewBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-paper px-3 py-2.5">
      <p className="text-[9px] font-semibold tracking-[0.12em] text-ember uppercase">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
        {text}
      </p>
    </div>
  );
}
