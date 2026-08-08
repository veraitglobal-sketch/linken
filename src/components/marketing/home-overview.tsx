import { OverviewRecord } from "@/components/marketing/overview-record";

/** Homepage §2 — The record (privacy → public). */
export function HomeOverview() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      <OverviewRecord />
    </section>
  );
}
