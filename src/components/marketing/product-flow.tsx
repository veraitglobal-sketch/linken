import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import { ProductFlowLive } from "@/components/marketing/product-flow-live";
import { ProductFlowScreen } from "@/components/marketing/product-flow-screen";
import { FlowStage } from "@/components/marketing/product-flow-stage";
import { FlowAppWindow } from "@/components/marketing/product-flow-window";

/**
 * Retell platform split — live map on the left, second product screen on the
 * right (confirm for now; a third screen comes later).
 */
export function HomeProductFlow() {
  return (
    <HomeSection>
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

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-6">
          <ProductFlowLive />

          <ProductFlowScreen caption="They confirm — the only way the record goes live.">
            <FlowStage>
              <FlowAppWindow scene="confirm" step={6} confirmed={false} />
            </FlowStage>
          </ProductFlowScreen>
        </div>
      </div>
    </HomeSection>
  );
}
