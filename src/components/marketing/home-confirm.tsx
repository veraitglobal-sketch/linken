import { ConfirmDecision } from "@/components/confirm/confirm-decision";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import {
  DEMO_CONFIRMATION,
  DEMO_CONFIRMER_NAME,
} from "@/data/mock/home-screens";

/**
 * Homepage — the confirmation moment, shown with the real product component.
 *
 * Replaces the nine hand-drawn `product-flow-*` files: a lookalike drifts from
 * the product and reads as an illustration. `ConfirmDecision` is the same
 * component `/confirm/[token]` renders, fed props instead of a database row.
 *
 * `inert` + `aria-hidden` keep the two server-action forms inside it from
 * being operable or reaching the accessibility tree — it is a screen, not a
 * control.
 */
export function HomeConfirm() {
  return (
    <HomeSection>
      <div className="product-screen-stage mx-auto max-w-6xl overflow-hidden rounded-[32px] px-6 py-14 sm:px-12 sm:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <HomeEyebrow onDark>The confirmation</HomeEyebrow>
            <h2 className="mt-4 font-display text-chapter text-on-navy text-balance">
              Nobody writes their own record.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-on-navy-soft">
              A company states the work. The other side receives this screen and
              decides. Until they confirm, nothing is public — and the words
              stay theirs, not editable by the company being vouched for.
            </p>
          </div>

          <div className="relative">
            {/* Radius matches ConfirmDecision's own 24px so the drop shadow
                follows the card edge, not a square behind it. The component's
                built-in shadow is tuned for paper and vanishes on the stage. */}
            <div
              inert
              aria-hidden
              className="rounded-[24px] shadow-[0_28px_70px_-18px_rgba(6,14,12,0.7)] select-none"
            >
              <ConfirmDecision
                view={DEMO_CONFIRMATION}
                companyName={DEMO_CONFIRMER_NAME}
              />
            </div>
            <p className="mt-3 text-right text-[11px] tracking-[0.02em] text-on-navy-muted">
              Illustrative example
            </p>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
