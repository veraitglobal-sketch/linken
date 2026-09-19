import { HomeEyebrow, HomePill } from "@/components/marketing/home-section";
import { UseCasePhotoFrame } from "@/components/seo/use-case-photo";
import { USE_CASES_INDEX_PHOTO } from "@/features/seo/use-cases/photos";

/** Lime hero — same cut as Home and /best. Photograph crosses onto paper. */
export function UseCasesIndexHero() {
  return (
    <section className="relative -mt-[4.25rem] px-4 pt-[8.5rem] pb-10 sm:px-6 sm:pt-[9.5rem] lg:px-8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-[28%] rounded-b-[48px] bg-lime sm:bottom-[32%] sm:rounded-b-[120px]"
      >
        <div className="lime-halftone" />
      </div>
      <div className="relative mx-auto max-w-[1100px] text-center">
        <HomeEyebrow>Use cases</HomeEyebrow>
        <h1 className="mt-5 font-display text-[clamp(2.4rem,4.3vw,3.875rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
          Confirmed proof for the work you already did.
        </h1>
        <p className="mx-auto mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">
          References, portfolios, tenders, diligence — the same mutual record,
          public only after both sides confirm.
        </p>
        <div className="mt-8 flex justify-center">
          <HomePill href="/onboarding">Create your free profile</HomePill>
        </div>
        <UseCasePhotoFrame
          photo={USE_CASES_INDEX_PHOTO}
          priority
          className="mx-auto mt-14 aspect-[16/9] max-w-[1100px]"
        />
      </div>
    </section>
  );
}
