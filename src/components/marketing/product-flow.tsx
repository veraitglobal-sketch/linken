import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import { ProductFlowLive } from "@/components/marketing/product-flow-live";

/**
 * How a record is made — one screen, full measure.
 *
 * This was a two-up split, live map beside a static confirm screen. The
 * static one was showing a beat the live one already plays: `ProductFlowLive`
 * switches `scene` to "confirm" mid-loop, so the pair repeated itself and each
 * half rendered at 564px — too small to hold anyone.
 *
 * One screen at full width doubles the stage and loses nothing.
 */
export function HomeProductFlow() {
  return (
    <HomeSection id="how-it-works">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>How a record is made</HomeEyebrow>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
          <h2 className="max-w-[16ch] font-display text-chapter text-ink text-balance">
            Nobody writes their own record.
          </h2>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
            One adds, the other decides. Nothing reaches a visitor in between.
          </p>
        </div>

        <div className="mt-12">
          <ProductFlowLive />
        </div>
      </div>
    </HomeSection>
  );
}
