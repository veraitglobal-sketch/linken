import { HomeBand, HomeTitle } from "@/components/marketing/home-section";
import { UseCaseArt } from "@/components/seo/use-case-art";
import { UseCaseIndexCard } from "@/components/seo/use-cases-index-card";
import type { UseCasePage } from "@/features/seo/use-cases/types";

const TONES = ["lime-soft", "lime", "lime", "lime-soft"] as const;

/** Jobs the record is for — four bento cards, each with a line scene. */
export function UseCasesIndexJobs({ pages }: { pages: UseCasePage[] }) {
  return (
    <HomeBand>
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <HomeTitle>The jobs the record is built for</HomeTitle>
          <p className="mx-auto mt-6 max-w-[52ch] text-[18px] leading-relaxed text-ink-soft">
            A reference list, a portfolio, a tender pack, a supplier check —
            each one public only after both sides confirm.
          </p>
        </div>
        <div className="mt-14 grid gap-7 md:grid-cols-2">
          {pages.map((page, i) => (
            <UseCaseIndexCard
              key={page.slug}
              page={page}
              tone={TONES[i] ?? "lime-soft"}
            >
              <UseCaseArt slug={page.slug} />
            </UseCaseIndexCard>
          ))}
        </div>
      </div>
    </HomeBand>
  );
}
