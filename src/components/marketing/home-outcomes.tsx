import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

const OUTCOMES = [
  {
    title: "Proposals",
    body: "Attach a confirmed reference list or one-pager. The client checks every record before the first meeting.",
    checker: "The client",
  },
  {
    title: "Tenders",
    body: "Answer reference requirements with records the other side confirmed — not a list you wrote yourself.",
    checker: "The awarding body",
  },
  {
    title: "Sales",
    body: "Prospects see who you have actually delivered for on your public profile — before the first call.",
    checker: "The prospect",
  },
  {
    title: "Procurement",
    body: "A vendor check resolves to a plain answer: a confirmed record, or no file. Never a paid badge.",
    checker: "Vendor management",
  },
] as const;

/** Homepage §4 — moments where confirmed records win work. */
export function HomeOutcomes() {
  // Paper, no tinted band — the ground stays the same across the page and the
  // section earns its identity from structure, not a slab of grey. Almost no
  // fills, almost no borders; the weight is carried by type and air.
  return (
    <HomeSection className="!py-20 sm:!py-28">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>Where it pays off</HomeEyebrow>
        <div className="reveal-late mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <h2 className="reveal max-w-[16ch] font-display text-chapter text-ink text-balance">
            Made for the moments project work is won.
          </h2>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-2 lg:text-right">
            For AEC, specialist contractors, agencies, and consulting — whenever
            someone on the other side has to check.
          </p>
        </div>

        <ul className="mt-16 grid list-none gap-x-10 gap-y-10 border-t border-line p-0 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((item) => (
            <li
              key={item.title}
              className="flex flex-col lg:border-l lg:border-line lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <h3 className="font-display text-[19px] font-medium tracking-[-0.025em] text-ink">
                {item.title}
              </h3>
              <p className="mt-3.5 flex-1 text-[14px] leading-relaxed text-ink-soft">
                {item.body}
              </p>
              <div className="mt-8 flex items-center gap-2">
                <span
                  className="size-1.5 shrink-0 rounded-full bg-signal"
                  aria-hidden
                />
                <span className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                  Checked by
                </span>
                <span className="ml-auto truncate text-[12px] font-medium text-ink">
                  {item.checker}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </HomeSection>
  );
}
