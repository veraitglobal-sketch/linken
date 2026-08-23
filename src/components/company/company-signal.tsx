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
    <section className="mx-auto mt-8 max-w-6xl px-4">
      <ul className="grid gap-y-8 sm:grid-cols-3 sm:gap-y-0">
        {items.map((item, i) => (
          <li
            key={item.label}
            /* A hairline between, never around. The rule belongs to the gap
               the figures already leave, so the row stays open at both ends
               instead of closing into a box. */
            className={
              i === 0
                ? "sm:pr-8"
                : "border-line sm:border-l sm:pr-8 sm:pl-8 sm:last:pr-0"
            }
          >
            <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-plus uppercase">
              {item.label}
            </p>
            {/* Display scale, tabular figures. This is the number the whole
                page exists to state. */}
            <p className="mt-3 font-display text-[clamp(3rem,5.5vw,4.25rem)] leading-[0.92] font-medium tracking-[-0.045em] text-ink tabular-nums">
              {item.value}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              {item.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
