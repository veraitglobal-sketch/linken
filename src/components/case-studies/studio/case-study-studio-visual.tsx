"use client";

import Image from "next/image";
import {
  addCaseStudyGalleryPhotos,
  clearCaseStudyCover,
  removeCaseStudyGalleryPhoto,
  updateCaseStudyCover,
} from "@/features/case-studies/media-actions";
import { caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudyDraft } from "@/components/case-studies/studio/case-study-draft";

type Props = {
  draft: CaseStudyDraft;
  caseSlug: string;
  back: string;
};

function RemoveButton() {
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#060a09]/75 text-[14px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-[#060a09]"
      aria-hidden
    >
      ×
    </span>
  );
}

export function CaseStudyStudioVisual({ draft, caseSlug, back }: Props) {
  const cover = caseStudyCoverUrl(draft.coverImageUrl, 0);
  const atGalleryLimit = draft.galleryUrls.length >= 8;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
          Cover
        </p>
        <p className="mt-1 text-[13px] text-[var(--cf-muted)]">
          Full-width hero on the public case file.
        </p>

        <div className="group relative mt-4 overflow-hidden bg-[#0a1210]">
          <div className="relative aspect-[16/10]">
            <Image src={cover} alt="" fill className="object-cover" sizes="640px" />
            {draft.coverImageUrl ? (
              <form action={clearCaseStudyCover} className="absolute right-3 top-3 z-20">
                <input type="hidden" name="back" value={back} />
                <input type="hidden" name="case_slug" value={caseSlug} />
                <button type="submit" aria-label="Remove cover photo" className="block">
                  <RemoveButton />
                </button>
              </form>
            ) : null}
            <form action={updateCaseStudyCover} className="absolute inset-0 z-10">
              <input type="hidden" name="back" value={back} />
              <input type="hidden" name="case_slug" value={caseSlug} />
              <label className="flex h-full cursor-pointer flex-col items-center justify-center bg-[#060a09]/0 transition-colors group-hover:bg-[#060a09]/20">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                  {draft.coverImageUrl ? "Replace cover" : "Upload cover"}
                </span>
                <input
                  type="file"
                  name="cover"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const form = e.currentTarget.form;
                    if (form && e.currentTarget.files?.[0]) form.requestSubmit();
                  }}
                />
              </label>
            </form>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--cf-muted)] uppercase">
              Gallery
            </p>
            <p className="mt-1 text-[13px] text-[var(--cf-muted)]">
              On-site photos · {draft.galleryUrls.length}/8
            </p>
          </div>
        </div>

        {draft.galleryUrls.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {draft.galleryUrls.map((url) => (
              <li key={url} className="relative aspect-[4/3] overflow-hidden bg-paper">
                <Image src={url} alt="" fill className="object-cover" sizes="160px" />
                <form
                  action={removeCaseStudyGalleryPhoto}
                  className="absolute right-2 top-2 z-10"
                >
                  <input type="hidden" name="back" value={back} />
                  <input type="hidden" name="case_slug" value={caseSlug} />
                  <input type="hidden" name="url" value={url} />
                  <button type="submit" aria-label="Remove photo" className="block">
                    <RemoveButton />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}

        {!atGalleryLimit ? (
          <form action={addCaseStudyGalleryPhotos} className="mt-4">
            <input type="hidden" name="back" value={back} />
            <input type="hidden" name="case_slug" value={caseSlug} />
            <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-[var(--cf-line)] bg-[var(--cf-paper)] px-4 py-6 transition-colors hover:border-[var(--cf-accent)] hover:bg-white">
              <span className="text-lg text-[var(--cf-muted)]">+</span>
              <span className="text-[13px] font-medium text-[var(--cf-ink)]">Add photos</span>
              <input
                type="file"
                name="gallery"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const form = e.currentTarget.form;
                  if (form && e.currentTarget.files?.length) form.requestSubmit();
                }}
              />
            </label>
          </form>
        ) : (
          <p className="mt-3 text-[12px] text-[var(--cf-muted)]">Gallery full (8 max).</p>
        )}
      </section>
    </div>
  );
}
