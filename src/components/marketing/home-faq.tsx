import { FAQ_ITEMS } from "@/components/marketing/home-faq-data";
import {
  Accent,
  HomeHeading,
  HomeSection,
} from "@/components/marketing/home-section";

export { FAQ_ITEMS };

/** Homepage FAQ — centred, one white card per question on the wash. */
export function HomeFaq() {
  return (
    <HomeSection className="!py-14 sm:!py-16">
      <div className="mx-auto max-w-3xl">
        <HomeHeading
          eyebrow="FAQ"
          title={
            <>
              The rules, <Accent>in plain language.</Accent>
            </>
          }
          lead="Confirmation, visibility, the badge, and what stays free."
        />

        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-card bg-surface px-6 ring-1 ring-line/70 transition-shadow duration-200 open:shadow-[0_18px_40px_-24px_rgba(8,20,18,0.25)] sm:px-7"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-[17px] leading-snug font-medium tracking-[-0.025em] text-ink marker:content-none sm:py-6 sm:text-[18px] [&::-webkit-details-marker]:hidden">
                <span className="text-balance">{item.question}</span>
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-soft shadow-[0_1px_0_rgba(13,18,16,0.04)] transition-[transform,border-color,color,background-color] duration-200 group-open:rotate-45 group-open:border-signal/35 group-open:bg-signal/8 group-open:text-signal"
                  aria-hidden
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 2v8M2 6h8"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-ink-soft sm:pb-7">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
