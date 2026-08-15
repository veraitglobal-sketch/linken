import { CheckAnswer } from "@/components/marketing/check-answer";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import {
  OutcomesRail,
  type OutcomeStop,
} from "@/components/marketing/outcomes-rail";

const OUTCOMES: readonly OutcomeStop[] = [
  {
    title: "Proposals",
    body: "Attach a confirmed reference list or one-pager. The client checks every record before the first meeting.",
    checker: "The client",
    glyph: "attach",
  },
  {
    title: "Tenders",
    body: "Answer reference requirements with records the other side confirmed — not a list you wrote yourself.",
    checker: "The awarding body",
    glyph: "answer",
  },
  {
    title: "Sales",
    body: "Prospects see who you have actually delivered for on your public profile — before the first call.",
    checker: "The prospect",
    glyph: "network",
  },
  {
    title: "Procurement",
    body: "A vendor check resolves to a plain answer: a confirmed record, or no file. Never a paid badge.",
    checker: "Vendor management",
    glyph: "resolve",
  },
] as const;

/**
 * Homepage §4 — moments where confirmed records win work.
 *
 * Four parallel text columns carried four ideas and held none. The argument is
 * single — four different people check you, all four land on the same record —
 * so it is shown on a rail instead of listed.
 *
 * Dark among the light plates above and below: no new colour, and the section
 * that carries the argument is the one that changes material.
 */
export function HomeOutcomes() {
  return (
    <HomeSection className="!py-20 sm:!py-28">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>Where it pays off</HomeEyebrow>
        {/* The right column carried a paragraph mirroring the heading — the
            block every generated page opens with. It holds the answer instead:
            four rows below describe someone checking, and none of them showed
            what the check returns. */}
        <div className="reveal-late mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <div>
            <h2 className="reveal max-w-[16ch] font-display text-chapter text-ink text-balance">
              Made for the moments project work is won.
            </h2>
            <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-muted">
              For AEC, specialist contractors, agencies, and consulting.
            </p>
          </div>
          {/* `w-full` on the wrapper: `justify-self-end` shrink-wraps it, and
              the panel's own `w-full` then resolves against 0. */}
          <div className="w-full lg:flex lg:justify-end">
            <CheckAnswer />
          </div>
        </div>

        <div className="mt-12">
          <OutcomesRail stops={OUTCOMES} />
        </div>
      </div>
    </HomeSection>
  );
}
