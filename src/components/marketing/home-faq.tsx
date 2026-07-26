import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

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
    <HomeSection tone="tight" className="!pb-16 sm:!pb-20">
      <div className="mx-auto max-w-3xl">
        <HomeEyebrow>FAQ</HomeEyebrow>
        <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.04em] text-ink">
          Questions, answered.
        </h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[17px] font-medium tracking-[-0.02em] text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[15px] leading-none text-muted transition-[transform,color,border-color] duration-200 group-open:rotate-45 group-open:border-[#1a5c51]/35 group-open:text-[#1a5c51]"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
