type Props = {
  partnerCount: number;
  caseStudyCount: number;
  city: string;
  category: string;
};

const signals = (
  partnerCount: number,
  caseStudyCount: number,
  city: string,
  category: string,
) => [
  {
    label: "Confirmed partners",
    value: String(partnerCount),
    note: "Mutual yes only",
  },
  {
    label: "Case studies",
    value: String(caseStudyCount),
    note: "With attribution",
  },
  {
    label: "Registered as",
    value: category,
    note: city,
  },
];

/** Quiet enterprise proof strip — not a SaaS metric dashboard. */
export function CompanySignal({
  partnerCount,
  caseStudyCount,
  city,
  category,
}: Props) {
  const items = signals(partnerCount, caseStudyCount, city, category);

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4">
      <div className="grid overflow-hidden rounded-[28px] border border-line bg-surface sm:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={
              i === 0
                ? "px-6 py-6 sm:px-7"
                : "border-t border-line px-6 py-6 sm:border-t-0 sm:border-l sm:px-7"
            }
          >
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {item.label}
            </p>
            <p className="mt-3 font-display text-[clamp(1.5rem,2.5vw,1.9rem)] font-medium tracking-[-0.035em] text-ink">
              {item.value}
            </p>
            <p className="mt-1.5 text-[13px] text-ink-soft">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
