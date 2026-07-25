export const FAQ_ITEMS = [
  {
    question: "How does mutual confirmation work?",
    answer:
      "Both companies have to click confirm. A partnership, reference, or case study only goes public once the other side agrees — nobody can confirm their own record.",
  },
  {
    question: "Who can see my partnerships?",
    answer:
      "Only confirmed partnerships appear on your public page. Anything pending stays private until the other company confirms it.",
  },
  {
    question: "What does “Verified” mean?",
    answer:
      "Verified means your company's domain is confirmed as yours — via email domain, DNS, or a meta tag. It's proof of identity, not a paid tier, and it's never for sale.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. Your profile, confirmations, and case studies stay free. Pro unlocks premium embeds, full analytics, Agent API, branded one-pagers, and team seats.",
  },
];

export function HomeFaq() {
  return (
    <section className="px-6 pb-28 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-[12px] font-semibold tracking-[0.14em] text-blue uppercase">
          FAQ
        </p>
        <h2 className="mt-5 font-display text-4xl font-medium tracking-[-0.04em] text-ink sm:text-5xl">
          Questions, answered.
        </h2>
        <div className="mt-10 divide-y divide-line border-t border-b border-line">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[17px] font-medium text-ink marker:content-none">
                {item.question}
                <span className="shrink-0 text-xl leading-none text-muted transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
