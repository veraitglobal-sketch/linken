const weak = [
  {
    n: "01",
    title: "Logo walls",
    body: "Anyone can drop a logo. Clients cannot tell what is real.",
  },
  {
    n: "02",
    title: "One-sided claims",
    body: "Name-dropping without confirmation. No shared proof of work.",
  },
];

export function HomeContrast() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {weak.map((item) => (
          <article
            key={item.title}
            className="flex min-h-[280px] flex-col rounded-[28px] border border-line bg-paper px-6 py-8"
          >
            <p className="text-[12px] font-semibold tracking-[0.14em] text-muted">
              {item.n}
            </p>
            <h3 className="mt-6 font-display text-3xl font-medium tracking-[-0.035em] text-ink">
              {item.title}
            </h3>
            <p className="mt-auto pt-10 text-sm leading-relaxed text-muted">
              {item.body}
            </p>
          </article>
        ))}
        <article className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] bg-navy px-6 py-8 text-white">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-ember/20 blur-2xl" />
          <p className="text-[12px] font-semibold tracking-[0.14em] text-blue-soft">
            03 · Linken
          </p>
          <h3 className="mt-6 font-display text-3xl font-medium tracking-[-0.035em]">
            Mutual confirmation
          </h3>
          <ul className="mt-auto space-y-3 pt-10 text-sm text-white/90">
            <li className="flex gap-2">
              <span className="text-blue-soft">✓</span>
              Both companies must confirm
            </li>
            <li className="flex gap-2">
              <span className="text-blue-soft">✓</span>
              Case studies credit both sides
            </li>
            <li className="flex gap-2">
              <span className="text-blue-soft">✓</span>
              Partners get relevant visibility
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
