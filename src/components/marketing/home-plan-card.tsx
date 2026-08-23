import { Button } from "@/components/ui/button";

/**
 * Homepage plan tile — Free (surface) or Pro (navy).
 *
 * The price is the anchor, not a footnote: it used to render at 17px, smaller
 * than the plan name at 22px, so the number being asked for was the quietest
 * thing in the card. Name becomes the micro-label above it and the figure
 * carries the display size.
 *
 * `mt-auto` on the footer instead of `flex-1` on the list: stretching the list
 * pushed 64px of dead air into whichever card had fewer features, and the two
 * cards are height-matched by the grid.
 */
export function HomePlanCard({
  name,
  price,
  features,
  note,
  cta,
  href,
  dark,
  emphasis,
  bridge,
}: {
  name: string;
  price: string;
  features: readonly string[];
  note?: string;
  cta: string;
  href: string;
  dark?: boolean;
  /** Marks the plan the section is selling. Our own pricing only — a widget
   *  on a customer's site must never print a tier. */
  emphasis?: string;
  /** Fills the dead space equal heights create on the shorter card. */
  bridge?: string;
}) {
  return (
    <article
      /* Free is white, and now it reads.
         It used to be `bg-surface` on a `--paper` that was also #ffffff — white
         on white with only a hairline, which beside a solid navy block looked
         unfinished rather than smaller. The fix then was a faint ink tint. The
         section is a `--mute` band now, so white gives it the body that tint
         was standing in for, and the tint had become a second grey stacked on
         the first: it composited to `rgb(233,235,233)` and pulled `--muted`
         inside the card down to 4.28:1, under AA. */
      className={`flex flex-col rounded-card p-7 sm:p-9 ${
        dark
          /* A transparent border, to match Free's real one.
             Free carries `border border-line`; Pro carried none, so its content
             box started one pixel higher and the two prices stayed 1px out of
             line even after the header rows were pinned. Same box, same start. */
          ? "border border-transparent bg-navy text-on-navy shadow-chapter"
          : "border border-line bg-surface shadow-[0_1px_2px_rgba(8,20,18,0.03)]"
      }`}
    >
      {/* Fixed height, because only one card carries the badge.
          The row sized to its tallest child: 15.9px on Free, 24.5px on Pro
          where the pill sits. That pushed Pro's price down, and the two prices
          — same size, same section, cards side by side — sat 7.6px out of line
          with each other. Measured, not eyeballed.
          26px clears the pill on both, and `items-center` puts a short label
          and a pill on one axis instead of hanging them from the top. */}
      <div className="flex min-h-[26px] items-center justify-between gap-4">
        <p
          className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${
            dark ? "text-blue-soft" : "text-blue"
          }`}
        >
          {name}
        </p>
        {emphasis ? (
          <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-on-navy-soft uppercase">
            {emphasis}
          </span>
        ) : null}
      </div>

      <p
        className={`mt-4 font-display text-[44px] leading-none font-medium tracking-[-0.04em] ${
          dark ? "text-on-navy" : "text-ink"
        }`}
      >
        {price}
      </p>

      {note ? (
        <p
          className={`mt-4 text-[13px] leading-relaxed ${dark ? "text-on-navy-muted" : "text-muted"}`}
        >
          {note}
        </p>
      ) : null}

      <ul className={`${note ? "mt-6" : "mt-7"} list-none space-y-3 p-0`}>
        {features.map((feature) => (
          <li
            key={feature}
            className={`flex gap-3 text-[13.5px] leading-relaxed ${dark ? "text-on-navy-soft" : "text-ink-soft"}`}
          >
            {/* One hue family across both cards: `--blue` on light, its mint
                sibling on dark. The saturated `--signal` green sat beside mint
                in the same row and read as a second brand. */}
            <span
              className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${dark ? "bg-blue-soft" : "bg-blue"}`}
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>

      {/* Equal heights across unequal feature counts leave a void above the
          shorter card's button. A bridge line fills it with a path rather
          than air. */}
      {bridge ? (
        <p className="mt-6 border-t border-line/70 pt-4 text-[13px] leading-relaxed text-muted">
          {bridge}
        </p>
      ) : null}

      <div className="mt-auto pt-8">
        <Button
          href={href}
          /* The loudest button each ground can carry.
             On the navy card that is white; on the paper card it is the brand
             green. It was `secondary` there — `bg-surface` with a hairline,
             which is a white button on white paper: the pricing section's
             primary action, visible only by its border.
             `primary` is not a new style, it is the variant this component has
             always had and that the marketing pages never once used —
             `variant="primary"` appears nowhere across them. White on
             `--signal` measures 7.3:1. */
          variant={dark ? "light" : "primary"}
          className="h-11 w-full sm:w-auto sm:min-w-[220px]"
        >
          {cta}
        </Button>
      </div>
    </article>
  );
}
