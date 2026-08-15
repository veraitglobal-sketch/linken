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
}) {
  return (
    <article
      className={`flex flex-col rounded-card p-7 sm:p-9 ${
        dark
          ? "bg-navy text-on-navy shadow-chapter"
          : "border border-line bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
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

      <div className="mt-auto pt-8">
        <Button
          href={href}
          variant={dark ? "light" : "secondary"}
          className="h-11 w-full sm:w-auto sm:min-w-[220px]"
        >
          {cta}
        </Button>
      </div>
    </article>
  );
}
