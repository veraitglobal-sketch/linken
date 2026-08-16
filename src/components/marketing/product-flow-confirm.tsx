"use client";

import { ConfirmDecision } from "@/components/confirm/confirm-decision";
import { NetworkMark } from "@/components/marketing/network-mark";
import {
  FLOW_HUB,
  FLOW_TARGET,
} from "@/components/marketing/product-flow-data";
import type { ClientConfirmationView } from "@/types/client-confirmation";

/**
 * The real confirm screen, not a drawing of one.
 *
 * This pane used to redraw the decision by hand, and the copy had already
 * drifted: it said "{name} says they worked with you", where the product says
 * "says they delivered this project for you". A lookalike moves away from the
 * product with every commit, and it was missing the optional-depth fields and
 * the decline reason entirely.
 *
 * `ConfirmDecision` is the component `/confirm/[token]` renders. Fed props
 * instead of a database row, so the homepage touches no network — a marketing
 * page must never depend on a record existing.
 *
 * `inert` + `aria-hidden`: the component carries two server-action forms, and
 * this is a picture of the product, not a control.
 *
 * The chrome around it stays ours — browser bar and Hansala header are the
 * stage, and the product does not ship them.
 */

/** The relationship the repo documents as real: Vera IT ↔ Dienstemarkt. */
const FLOW_VIEW: ClientConfirmationView = {
  id: "flow-confirmation",
  caseStudyId: "flow-case",
  requestedByCompanyId: "vera-it",
  email: `hello@${FLOW_TARGET.domain}`,
  token: "flow",
  status: "pending",
  confirmedByCompanyId: null,
  createdAt: "2026-03-02",
  confirmedAt: null,
  caseTitle: "Platform delivery and ongoing support",
  caseSlug: "platform-delivery",
  caseSummary:
    "Built and shipped the platform, then stayed on for delivery — confirmed by both sides on Hansala.",
  caseYear: "2026",
  caseLocation: "Germany",
  requesterName: FLOW_HUB.name,
  requesterSlug: "verait",
  confirmerName: FLOW_TARGET.name,
  confirmerSlug: "dienstemarkt",
  confirmerLogoUrl: FLOW_TARGET.logo,
};

export function FlowConfirmScene() {
  return (
    <div className="flex h-full w-full flex-col bg-[#f7f8fa]">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <div className="ml-3 flex h-7 flex-1 items-center rounded-lg bg-paper px-3 text-[12px] text-muted">
          hansala.com/confirm/…
        </div>
      </header>

      <div className="flex items-center gap-2 border-b border-line/70 bg-surface px-8 py-3">
        <NetworkMark size={15} animate={false} />
        <span className="font-display text-[14px] font-semibold tracking-[-0.03em] text-blue">
          Hansala
        </span>
        <span className="ml-auto text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Confirmation request
        </span>
      </div>

      <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-8 pt-6">
        <div inert aria-hidden className="w-[620px] select-none">
          <ConfirmDecision view={FLOW_VIEW} companyName={FLOW_TARGET.name} />
        </div>
      </div>
    </div>
  );
}
