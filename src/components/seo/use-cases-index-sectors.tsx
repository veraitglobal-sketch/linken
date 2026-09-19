import { HomeEyebrow, HomeTitle } from "@/components/marketing/home-section";
import { UseCaseArt } from "@/components/seo/use-case-art";
import { UseCaseIndexCard } from "@/components/seo/use-cases-index-card";
import type { UseCasePage } from "@/features/seo/use-cases/types";

const TONES = ["surface", "lime-soft", "lime-soft", "surface"] as const;

/** Navy chapter — sector pages sit as cards on the dark field. */
export function UseCasesIndexSectors({ pages }: { pages: UseCasePage[] }) {
  return (
    <section className="px-4 py-14 sm:px-[18px] sm:py-[75px]">
      <div className="mx-auto max-w-[1280px] rounded-hero bg-navy px-6 py-14 sm:px-12 sm:py-20">
        <div className="text-center">
          <HomeEyebrow onDark>Sectors</HomeEyebrow>
          <HomeTitle onDark className="mt-5">
            Built for firms whose work is delivered together
          </HomeTitle>
          <p className="mx-auto mt-4 max-w-[52ch] text-[17px] leading-relaxed text-on-navy-soft">
            Architecture, engineering, contractors, agencies — the confirmation
            rule does not change with the trade.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {pages.map((page, i) => (
            <UseCaseIndexCard
              key={page.slug}
              page={page}
              tone={TONES[i] ?? "surface"}
            >
              <UseCaseArt slug={page.slug} />
            </UseCaseIndexCard>
          ))}
        </div>
      </div>
    </section>
  );
}
