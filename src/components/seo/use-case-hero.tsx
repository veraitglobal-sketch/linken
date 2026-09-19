import { HomeEyebrow } from "@/components/marketing/home-section";
import { UseCasePhotoFrame } from "@/components/seo/use-case-photo";
import { getUseCasePhoto } from "@/features/seo/use-cases/photos";
import type { UseCasePage } from "@/features/seo/use-cases/types";

export function UseCaseHero({ page }: { page: UseCasePage }) {
  return (
    <section className="relative -mt-[4.25rem] px-4 pt-[8.5rem] pb-10 sm:px-6 sm:pt-[9.5rem] lg:px-8">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 bottom-[22%] rounded-b-[48px] bg-lime sm:rounded-b-[120px]"
      />
      <div className="relative mx-auto max-w-[820px] text-center">
        <HomeEyebrow>{page.eyebrow}</HomeEyebrow>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
          {page.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-ink-soft">
          {page.lede}
        </p>
        <p className="mx-auto mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-soft">
          <span className="font-medium text-ink">Who this is for. </span>
          {page.audience}
        </p>
        <UseCasePhotoFrame
          photo={getUseCasePhoto(page.slug)}
          priority
          className="mx-auto mt-12 aspect-[2/1]"
        />
      </div>
    </section>
  );
}
