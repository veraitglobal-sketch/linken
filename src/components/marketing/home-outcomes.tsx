import {
  Accent,
  HomeHeading,
  HomeSection,
} from "@/components/marketing/home-section";
import {
  SurfaceGlyph,
  type SurfaceGlyphKind,
} from "@/components/marketing/surface-glyph";

type Outcome = {
  title: string;
  body: string;
  checker: string;
  glyph: SurfaceGlyphKind;
};

const OUTCOMES: readonly Outcome[] = [
  {
    title: "Proposals",
    body: "Attach a confirmed reference list or one-pager. The client checks every record before the first meeting.",
    checker: "The client",
    glyph: "onepager",
  },
  {
    title: "Tenders",
    body: "Answer reference requirements with records the other side confirmed — not a list you wrote yourself.",
    checker: "The awarding body",
    glyph: "testimonial",
  },
  {
    title: "Sales",
    body: "Prospects see who you have actually delivered for on your public profile — before the first call.",
    checker: "The prospect",
    glyph: "logos",
  },
  {
    title: "Procurement",
    body: "A vendor check resolves to a plain answer: a confirmed record, or no file. Never a paid badge.",
    checker: "Vendor management",
    glyph: "mark",
  },
];

/** Card heads alternate the two light washes, so the row has colour without
 *  a fifth hue — Thrivea's tinted card heads, in mint. */
const HEADS = ["grad-mint", "grad-teal"] as const;

const SECTORS = [
  "Architecture & engineering",
  "Construction & contracting",
  "Specialist contractors",
  "Agencies & consultancies",
] as const;

/**
 * Homepage §3 — where confirmed records win work.
 *
 * Thrivea's "Made to fit" pills, then its four-up capability cards. The pills
 * are the sectors the hero already names; the cards are the four moments,
 * each footed by who does the checking — the other side, always.
 * Parallel items, so no numbers.
 */
export function HomeOutcomes() {
  return (
    <HomeSection className="!py-14 sm:!py-16">
      <div className="mx-auto max-w-6xl">
        <HomeHeading
          eyebrow="Where it pays off"
          title={
            <>
              Made for the moments <Accent>project work is won.</Accent>
            </>
          }
        />

        <ul className="mx-auto mt-9 flex max-w-4xl list-none flex-wrap justify-center gap-2.5 p-0 sm:gap-3">
          {SECTORS.map((sector) => (
            <li
              key={sector}
              className="inline-flex h-11 items-center gap-2.5 rounded-full bg-surface pr-5 pl-4 text-[13.5px] font-medium text-ink shadow-[0_6px_16px_-10px_rgba(26,92,81,0.5)] ring-1 ring-blue-soft/40"
            >
              <span aria-hidden className="size-2 rounded-full bg-blue-soft" />
              {sector}
            </li>
          ))}
        </ul>

        <ul className="mt-12 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((o, i) => (
            <li
              key={o.title}
              className="lift flex flex-col rounded-card bg-surface p-3 ring-1 ring-line/70"
            >
              {/* The disc-and-glyph badge from the surfaces stage, on a tinted
                  head. Fixed disc size so it stays round at any card width. */}
              <div
                aria-hidden
                className={`relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-tile ${HEADS[i % HEADS.length]}`}
              >
                <span className="absolute size-[150px] rounded-full border border-white/60" />
                <span className="absolute size-[220px] rounded-full border border-white/35" />
                <span className="relative grid size-[76px] place-items-center rounded-full bg-white shadow-[0_14px_30px_-12px_rgba(8,20,18,0.35)]">
                  <SurfaceGlyph kind={o.glyph} className="size-[42px]" />
                </span>
              </div>
              <div className="flex flex-1 flex-col px-3 pt-5 pb-3">
                <h3 className="font-display text-[20px] leading-tight font-medium tracking-[-0.03em] text-ink">
                  {o.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
                  {o.body}
                </p>
                <div className="mt-auto pt-6">
                  <p className="flex items-center gap-2 border-t border-line pt-4 text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
                    <span
                      aria-hidden
                      className="size-1.5 shrink-0 rounded-full bg-blue-soft"
                    />
                    Checked by {o.checker}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </HomeSection>
  );
}
