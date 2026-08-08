import { HomeEyebrow } from "@/components/marketing/home-section";
import { RecordStage } from "@/components/marketing/record-stage";

/** Homepage §2 — The record: private until the second yes, then distributed. */
export function HomeOverview() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="reveal max-w-2xl">
          <HomeEyebrow>The record</HomeEyebrow>
          <h2 className="mt-4 font-display text-chapter text-ink text-balance">
            Public only after the second yes.
          </h2>
        </div>

        <div className="reveal-late mt-12">
          <RecordStage />
        </div>
      </div>
    </section>
  );
}
