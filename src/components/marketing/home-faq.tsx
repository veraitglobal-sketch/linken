import { FAQ_ITEMS } from "@/components/marketing/home-faq-data";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

export { FAQ_ITEMS };

/** Homepage FAQ — Retell rhythm: air, hairlines, circular toggle. */
export function HomeFaq() {
  return (
    <HomeSection>
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <div>
            <HomeEyebrow>FAQ</HomeEyebrow>
            <h2 className="mt-5 max-w-[16ch] font-display text-chapter text-ink text-balance">
              The rules, in plain language.
            </h2>
          </div>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            Confirmation, visibility, the badge, and what stays free.
          </p>
        </div>

        <div className="mt-14 border-t border-line/80">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group border-b border-line/80"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-[17px] leading-snug font-medium tracking-[-0.025em] text-ink marker:content-none sm:py-7 sm:text-[18px] [&::-webkit-details-marker]:hidden">
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
              <p className="max-w-2xl pb-7 text-[15px] leading-relaxed text-ink-soft sm:pb-8">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
