type Props = {
  partnerCount: number;
  caseStudyCount: number;
  referenceCount: number;
  city: string;
  category: string;
};

/**
 * The page's second moment: what this company can prove, at the size it
 * deserves. Only renders cells that exist — no empty "0" theatre.
 *
 * This was a white card with the figures at 28px, sitting among six other white
 * cards. Two problems, both measured on the page.
 *
 * The figures were *smaller than the word "Team"* — section headings render at
 * 33px. A confirmed count is the one fact about this company that no other site
 * on the internet can show, and it was set below the furniture.
 *
 * And it was a card. Every section here is a card, so being one more made it
 * furniture too. It is not a card now: the figures sit straight on the canvas,
 * divided by hairlines. That is what makes it read as the page speaking rather
 * than as another widget, and it costs nothing — the distinction is the absence
 * of a box, not the addition of an ornament.
 *
 * `Registered as` is gone. It carried the category and city, which the hero
 * already states one screen above as "IT - SOFTWARE · HAMBURG, GERMANY". It
 * also diluted the row: a trade name sitting in the same slot as a count stops
 * the eye reading the row as counts at all.
 */
export function CompanySignal({
  partnerCount,
  caseStudyCount,
  referenceCount,
}: Props) {
  const items = [
    partnerCount > 0
      ? {
          label: "Confirmed partners",
          value: partnerCount,
          note: "Both sides said yes",
        }
      : null,
    referenceCount > 0
      ? {
          label: "Confirmed clients",
          value: referenceCount,
          note: "Each verified by the client",
        }
      : null,
    caseStudyCount > 0
      ? {
          label: "Case studies",
          value: caseStudyCount,
          note: "Published with attribution",
        }
      : null,
  ].filter(Boolean) as { label: string; value: number; note: string }[];

  if (items.length === 0) return null;

  return (
    <section className="mx-auto mt-14 max-w-[1280px] px-4 sm:px-[18px] lg:px-10">
      <ul
        className={`grid gap-4 ${
          items.length === 3
            ? "sm:grid-cols-3"
            : items.length === 2
              ? "sm:grid-cols-2"
              : ""
        }`}
      >
        {items.map((item, i) => (
          <li
            key={item.label}
            className={`rounded-3xl p-7 sm:p-8 ${
              i === 0 ? "bg-lime" : "bg-surface ring-1 ring-line/70"
            }`}
          >
            <p className="text-[12px] font-semibold tracking-[0.14em] text-ink-soft uppercase">
              {item.label}
            </p>
            <p className="mt-4 font-display text-[clamp(3rem,5.5vw,4.5rem)] leading-[0.9] font-semibold tracking-[-0.045em] text-ink tabular-nums">
              {item.value}
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
              {item.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
