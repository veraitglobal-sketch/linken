export function HomeOverview() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-line bg-surface px-6 py-10 shadow-[0_14px_48px_rgba(8,20,18,0.05)] sm:px-10 sm:py-12">
        <p className="text-[12px] font-semibold tracking-[0.14em] text-blue uppercase">
          Overview
        </p>
        <div className="mt-5 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
          <h2 className="font-display text-4xl font-medium tracking-[-0.04em] text-ink sm:text-5xl">
            What is Linken?
          </h2>
          <p className="max-w-md text-[17px] leading-relaxed text-ink-soft md:justify-self-end md:pb-1 md:text-right">
            A public company page where partnerships become visible only after both
            sides confirm — with shared case studies attached.
          </p>
        </div>
      </div>
    </section>
  );
}
