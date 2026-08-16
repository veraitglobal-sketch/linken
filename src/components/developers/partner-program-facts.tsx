const FACTS = [
  {
    title: "Invoice only",
    body: "Commission is 10% of the paid Stripe invoice amount. Never from confirmations, cases, or free plans.",
  },
  {
    title: "Accrued, not projected",
    body: "Earnings show what already paid. Nothing estimated from pipelines or free referrals.",
  },
  {
    title: "Same product law",
    body: "Referred companies still confirm work mutually. You do not invent clients or publish pending claims.",
  },
] as const;

export function PartnerProgramFacts() {
  return (
    <section className="mt-16 rounded-chapter bg-navy px-7 py-10 text-on-navy sm:px-10 sm:py-12">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
        Terms in plain words
      </p>
      <h2 className="mt-3 max-w-lg font-display text-[clamp(1.5rem,2.8vw,2rem)] font-medium tracking-[-0.035em] text-balance">
        Clear rules. No bounty theatre.
      </h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {FACTS.map((fact) => (
          <li key={fact.title}>
            <h3 className="text-[14px] font-semibold text-on-navy">
              {fact.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-on-navy-soft">
              {fact.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
