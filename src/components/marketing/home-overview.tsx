import { ConfirmFlipBadge } from "@/components/marketing/confirm-flip-badge";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

export function HomeOverview() {
  return (
    <HomeSection>
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end md:gap-16">
        <div>
          <HomeEyebrow>Overview</HomeEyebrow>
          <h2 className="mt-5 font-display text-[clamp(2.1rem,4.5vw,3.15rem)] font-medium leading-[1.12] tracking-[-0.042em] text-ink">
            Every partnership starts
            <ConfirmFlipBadge />
          </h2>
        </div>
        <p className="max-w-md text-[16px] leading-relaxed text-ink-soft md:justify-self-end md:pb-1 md:text-right md:text-[17px]">
          A public company page where partnerships become visible only after
          both sides confirm — with shared case studies attached.
        </p>
      </div>
    </HomeSection>
  );
}
