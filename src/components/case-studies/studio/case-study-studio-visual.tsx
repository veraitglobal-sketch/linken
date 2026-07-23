"use client";

import Image from "next/image";
import {
  addCaseStudyGalleryPhotos,
  clearCaseStudyCover,
  updateCaseStudyCover,
} from "@/features/case-studies/media-actions";
import { caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudyDraft } from "@/components/case-studies/studio/case-study-draft";

type Props = {
  draft: CaseStudyDraft;
  caseSlug: string;
  back: string;
};

export function CaseStudyStudioVisual({ draft, caseSlug, back }: Props) {
  const cover = caseStudyCoverUrl(draft.coverImageUrl, 0);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          Hero cover
        </p>
        <p className="mt-1 text-[14px] text-ink-soft">
          Full-width photo on the public page — pick your strongest project shot.
        </p>
        <form
          action={updateCaseStudyCover}
          className="group relative mt-4 overflow-hidden rounded-[24px] border border-dashed border-line bg-paper"
        >
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="case_slug" value={caseSlug} />
          <div className="relative aspect-[16/10]">
            <Image src={cover} alt="" fill className="object-cover" sizes="640px" />
            <div className="absolute inset-0 bg-[#081412]/35 transition-colors group-hover:bg-[#081412]/45" />
            <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-md">
                {draft.coverImageUrl ? "Replace cover photo" : "Upload cover photo"}
              </span>
              <span className="text-[12px] text-white/70">JPG, PNG or WEBP · max 8MB</span>
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
          </div>
        </form>
        {draft.coverImageUrl ? (
          <form action={clearCaseStudyCover} className="mt-2">
            <input type="hidden" name="back" value={back} />
            <input type="hidden" name="case_slug" value={caseSlug} />
            <button
              type="submit"
              className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Remove cover
            </button>
          </form>
        ) : null}
      </section>

      <section>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          Project gallery
        </p>
        <p className="mt-1 text-[14px] text-ink-soft">
          Site photos, deliverables, before/after — up to 8 images.
        </p>
        {draft.galleryUrls.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {draft.galleryUrls.map((url) => (
              <div
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/5"
              >
                <Image src={url} alt="" fill className="object-cover" sizes="140px" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl border border-dashed border-line bg-paper/80"
              />
            ))}
          </div>
        )}
        <form action={addCaseStudyGalleryPhotos} className="mt-4">
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="case_slug" value={caseSlug} />
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-line bg-surface px-4 py-8 transition-colors hover:border-blue/30 hover:bg-paper/50">
            <span className="text-2xl text-muted">+</span>
            <span className="mt-2 text-[13px] font-semibold text-ink">Add photos</span>
            <span className="mt-1 text-[12px] text-muted">Select one or more files</span>
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
      </section>
    </div>
  );
}
