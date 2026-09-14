type Item = { q: string; a: string };

type Props = { items: readonly Item[]; title?: string; className?: string };

export function PricingFaq({
  items,
  title = "Billing FAQ",
  className = "mt-16",
}: Props) {
  return (
    <section className={`max-w-3xl ${className}`}>
      <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.035em] text-ink">
        {title}
      </h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[16px] font-medium tracking-[-0.02em] text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[15px] leading-none text-muted transition-[transform] duration-200 group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-soft">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
