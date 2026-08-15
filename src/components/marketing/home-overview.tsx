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
        {/* No eyebrow, no stacked heading. The composition already makes the
            claim, and its own statement carries the <h2> inside the stage —
            every section opening with the same eyebrow/heading/copy block is
            what made the page read as one long template. */}
        <div className="reveal-late">
          <SectionPlate plate="a">
            <RecordStage />
          </SectionPlate>
        </div>
      </div>
    </section>
  );
}
