import Image from "next/image";
import Link from "next/link";
import { updateCaseStudyContent } from "@/features/case-studies/actions";
import {
  addCaseStudyGalleryPhotos,
  clearCaseStudyCover,
  updateCaseStudyCover,
} from "@/features/case-studies/media-actions";
import { CaseStudyFields } from "@/components/case-studies/case-study-fields";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudy: CaseStudy;
  back: string;
};

export function CaseStudyEditForm({ companySlug, caseStudy, back }: Props) {
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, 0);
  const services = caseStudy.services.join(", ");

  return (
    <div className="space-y-6">
      <WorkspaceCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
              Cover photo
            </h2>
            <p className="mt-1 text-[12px] text-muted">
              Full-width hero on the public case study page.
            </p>
          </div>
          <Link
            href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
            className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Preview live →
          </Link>
        </div>
        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-2xl bg-paper">
          <Image src={cover} alt="" fill className="object-cover" sizes="640px" />
        </div>
        <form action={updateCaseStudyCover} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="case_slug" value={caseStudy.slug} />
          <label className="block flex-1 min-w-[200px]">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Upload cover (JPG, PNG, WEBP · max 8MB)
            </span>
            <input
              type="file"
              name="cover"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-[13px] text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
            />
          </label>
          <Button type="submit" className="h-10 px-4">
            Save cover
          </Button>
        </form>
        {caseStudy.coverImageUrl ? (
          <form action={clearCaseStudyCover} className="mt-3">
            <input type="hidden" name="back" value={back} />
            <input type="hidden" name="case_slug" value={caseStudy.slug} />
            <button
              type="submit"
              className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Remove cover
            </button>
          </form>
        ) : null}
      </WorkspaceCard>

      <WorkspaceCard>
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Project gallery
        </h2>
        <p className="mt-1 text-[12px] text-muted">
          Up to 8 photos — site shots, deliverables, before/after.
        </p>
        {caseStudy.galleryUrls.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {caseStudy.galleryUrls.map((url) => (
              <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              </div>
            ))}
          </div>
        ) : null}
        <form action={addCaseStudyGalleryPhotos} className="mt-4 space-y-3">
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="case_slug" value={caseStudy.slug} />
          <input
            type="file"
            name="gallery"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="block w-full text-[13px] text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
          />
          <Button type="submit" variant="secondary" className="h-10 px-4">
            Add to gallery
          </Button>
        </form>
      </WorkspaceCard>

      <WorkspaceCard>
        <form action={updateCaseStudyContent} className="grid gap-4">
          <input type="hidden" name="company_slug" value={companySlug} />
          <input type="hidden" name="case_slug" value={caseStudy.slug} />
          <input type="hidden" name="back" value={back} />

          <CaseStudyFields
            defaults={{
              title: caseStudy.title,
              summary: caseStudy.summary,
              challenge: caseStudy.challenge,
              outcome: caseStudy.outcome,
              process: caseStudy.process,
              location: caseStudy.location,
              year: caseStudy.year,
              services,
            }}
          />

          <Button type="submit" className="h-10 w-fit px-4">
            Save content
          </Button>
        </form>
      </WorkspaceCard>
    </div>
  );
}
