/**
 * What the order means. Stated plainly, because a ranking a reader cannot
 * audit is just an advertisement — and because the rules here are the product:
 * nothing on this page can be bought.
 */
export function RankingExplainer() {
  const rules = [
    ["Only confirmed work counts", "A record appears after both companies agreed to it. Pending requests are never shown and never scored."],
    ["Who confirmed matters", "A confirmation from a company that proved its domain carries full weight."],
    ["Recent work weighs more", "Older records stay on the profile, but they stop holding a position on their own."],
    ["One partner cannot carry a company", "Points from any single company are capped, so confirming each other in a loop goes nowhere."],
    ["Position is never for sale", "No plan, add-on or payment changes this order."],
  ];
  return (
    <section className="rounded-[28px] bg-surface p-6 ring-1 ring-line/70 sm:p-8">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
        How this order is decided
      </h2>
      <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
        {rules.map(([title, body]) => (
          <li key={title} className="flex gap-3">
            <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-lime ring-2 ring-lime-soft" />
            <span>
              <span className="block text-[15px] font-semibold text-ink">{title}</span>
              <span className="block text-[14px] leading-relaxed text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
