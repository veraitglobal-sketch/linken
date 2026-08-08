import { Button } from "@/components/ui/button";

/** Homepage plan tile — Free (surface) or Pro (navy). */
export function HomePlanCard({
  name,
  price,
  features,
  note,
  cta,
  href,
  dark,
}: {
  name: string;
  price: string;
  features: readonly string[];
  note?: string;
  cta: string;
  href: string;
  dark?: boolean;
}) {
  return (
    <article
      className={`flex flex-col rounded-card p-7 sm:p-9 ${
        dark
          ? "bg-navy text-on-navy shadow-chapter"
          : "border border-line bg-surface"
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3
          className={`font-display text-[22px] font-medium tracking-[-0.025em] ${dark ? "text-on-navy" : "text-ink"}`}
        >
          {name}
        </h3>
        <p
          className={`font-display text-[17px] font-medium tracking-[-0.02em] ${dark ? "text-on-navy/85" : "text-ink-soft"}`}
        >
          {price}
        </p>
      </div>
      {note ? (
        <p
          className={`mt-5 text-[13px] leading-relaxed ${dark ? "text-on-navy-muted" : "text-muted"}`}
        >
          {note}
        </p>
      ) : null}
      <ul className={`${note ? "mt-3" : "mt-6"} flex-1 list-none space-y-3 p-0`}>
        {features.map((feature) => (
          <li
            key={feature}
            className={`flex gap-3 text-[13.5px] leading-relaxed ${dark ? "text-on-navy-soft" : "text-ink-soft"}`}
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-8">
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
