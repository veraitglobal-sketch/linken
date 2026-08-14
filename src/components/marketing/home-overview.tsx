import { HomeEyebrow } from "@/components/marketing/home-section";
import { RecordStage } from "@/components/marketing/record-stage";
import { SectionPlate } from "@/components/marketing/section-plate";

/**
 * Homepage §2 — The record: private until the second yes, then distributed.
 *
 * The composition sits on a plate rather than bare paper, the way Retell
 * stages every product moment. Its own cards are light, so the plate is dark
 * and they read as objects lifted off it.
 *
 * Rhythm follows HomeSection's default (py-20 sm:py-28). This section wrote
 * its own 96px and sat shallower than every neighbour.
 */
export function HomeOverview() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 px-6 py-20 sm:px-8 sm:py-28 lg:px-10"
    >
      <div className="mx-auto max-w-6xl">
        <div className="reveal grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <div>
            <HomeEyebrow>The record</HomeEyebrow>
            <h2 className="mt-4 max-w-[16ch] font-display text-chapter text-ink text-balance">
              Public only after the second yes.
            </h2>
          </div>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            One record, written once and confirmed by the other side — then it
            renders anywhere you need it.
          </p>
        </div>

        <div className="reveal-late mt-12">
          <SectionPlate plate="a">
            <RecordStage />
          </SectionPlate>
        </div>
      </div>
    </section>
  );
}
