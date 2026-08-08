import { FAQ_ITEMS } from "@/components/marketing/home-faq-data";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

export { FAQ_ITEMS };

/** Homepage §8b — short FAQ; answers stay product truth. */
export function HomeFaq() {
  return (
    <HomeSection tone="tight" className="!pb-14 sm:!pb-16">
      <div className="mx-auto max-w-3xl">
        <HomeEyebrow>FAQ</HomeEyebrow>
        <h2 className="reveal mt-5 font-display text-chapter text-ink text-balance">
          The rules, in plain language.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
          Confirmation, visibility, the badge, and what stays free.
        </p>
        <div className="reveal-late mt-10 divide-y divide-line">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[17px] font-medium tracking-[-0.02em] text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mute text-[15px] leading-none text-muted transition-[transform,color,background-color] duration-200 group-open:rotate-45 group-open:bg-signal/12 group-open:text-ink"
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
