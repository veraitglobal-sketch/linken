const STEPS = [
  {
    n: "01",
    title: "Create a partner workspace",
    body: "Register as a developer partner. You get a referral link and an Earnings book in the dashboard.",
  },
  {
    n: "02",
    title: "Share your link",
    body: "Clients open onboarding with your ref. First touch sticks for 30 days — we attribute the company to you.",
  },
  {
    n: "03",
    title: "Earn when they pay",
    body: "Free stays free. When they pay a Pro invoice, 10% of that invoice amount accrues to you. Recurring.",
  },
] as const;

export function PartnerProgramSteps() {
  return (
    <section className="mt-16 border-t border-line/70 pt-14">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        How it works
      </p>
      <h2 className="mt-3 max-w-lg font-display text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.035em] text-ink">
        Refer. They pay. You accrue.
      </h2>
      <ol className="mt-10 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n}>
            <p className="font-display text-[13px] font-semibold tabular-nums tracking-[-0.02em] text-plus">
              {step.n}
            </p>
            <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-ink">
              {step.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
