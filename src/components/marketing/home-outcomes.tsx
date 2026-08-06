import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

const OUTCOMES = [
  {
    title: "Proposals",
    body: "Attach your confirmed reference list or one-pager. The client checks every record before the first meeting — no follow-up calls to verify.",
  },
  {
    title: "Tenders",
    body: "Answer reference requirements with records the other side confirmed, not a list you wrote yourself.",
  },
  {
    title: "Sales",
    body: "Prospects see who you have actually delivered for on your public profile — before the first call.",
  },
  {
    title: "Procurement",
    body: "A vendor check resolves to a plain answer: a confirmed record, or no file. Never a guess, never a paid badge.",
  },
];

/** Concrete moments where confirmed records win work. */
export function HomeOutcomes() {
  return (
    <HomeSection tone="mute">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>Where it pays off</HomeEyebrow>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
          <h2 className="max-w-[18ch] font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink text-balance">
            Made for the moments project work is won.
          </h2>
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-ink-soft lg:justify-self-end lg:pb-1">
            Built for project-based B2B: architecture, engineering,
            construction, specialist contractors, agencies, consulting and
            implementation partners.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col rounded-[20px] border border-line bg-surface p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[17px] font-medium tracking-[-0.02em] text-ink">
                  {item.title}
                </h3>
                <span className="text-[11px] tabular-nums text-muted">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
