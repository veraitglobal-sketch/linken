import { RANKING_RULES } from "@/components/ranking/ranking-rules";

/**
 * What the order means. Stated plainly, because a ranking a reader cannot
 * audit is just an advertisement — and because the rules here are the product:
 * nothing on this page can be bought.
 */
export function RankingExplainer() {
  return (
    <section className="rounded-[28px] bg-surface p-6 ring-1 ring-line/70 sm:p-8">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
        How this order is decided
      </h2>
      <ul className="mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
        {RANKING_RULES.map(([title, body]) => (
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
