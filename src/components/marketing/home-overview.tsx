import { ConfirmFlipBadge } from "@/components/marketing/confirm-flip-badge";

export function HomeOverview() {
  return (
    <section className="px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-end">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-blue uppercase">
            Overview
          </p>
          <h2 className="mt-5 font-display text-4xl font-medium tracking-[-0.04em] text-ink sm:text-5xl">
            Every partnership starts
            <ConfirmFlipBadge />
          </h2>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-ink-soft md:justify-self-end md:pb-1 md:text-right">
          A public company page where partnerships become visible only after both
          sides confirm — with shared case studies attached.
        </p>
      </div>
    </section>
  );
}
