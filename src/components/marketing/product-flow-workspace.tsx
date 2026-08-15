"use client";

import {
  FLOW_HUB,
  FLOW_TARGET,
} from "@/components/marketing/product-flow-data";
import { FlowInspector } from "@/components/marketing/product-flow-inspector";
import {
  FlowGrid,
  FlowNodeCard,
} from "@/components/marketing/product-flow-parts";
import {
  FlowMapControls,
  FlowSidebar,
} from "@/components/marketing/product-flow-sidebar";
import { cn } from "@/lib/cn";

export function FlowWorkspaceScene({
  step,
  confirmed,
}: {
  step: number;
  confirmed: boolean;
}) {
  const selected = step >= 1;
  const adding = step >= 2;
  const found = step >= 4;
  const requested = step >= 5;

  return (
    <div className="flex h-full w-full bg-surface">
      <FlowSidebar />
      <section className="relative min-w-0 flex-1 bg-[#fcfdfc]">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-4 px-5 py-4">
          <div className="flex items-center gap-1 rounded-full border border-line/70 bg-surface p-1 shadow-[0_1px_2px_rgba(8,20,18,0.05)]">
            {["Company", "Map", "Inbox"].map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium",
                  t === "Map" ? "bg-navy text-white" : "text-ink-soft",
                )}
              >
                {t}
              </span>
            ))}
          </div>
          <div>
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-ink">
              Your map
            </p>
            <p className="text-[11.5px] text-muted">
              1 company · {confirmed ? "1 partner" : "0 partners"}
            </p>
          </div>
        </div>
        <div className="relative h-full w-full overflow-hidden">
          <FlowGrid />
          {/* The connection is the whole point of this screen, and it was 1%
              of it: a 147×49 card in a 648×740 canvas. Scaling the map layer
              keeps the path attached to its nodes — the anchors are design
              units, so moving the cards by hand would break the curve.

              Origin sits at the right-hand node, not between the two: the
              further right it is, the less the right edge travels. At 370 the
              cards measured 149→664 and overflowed a 648-wide canvas by 16px;
              at 432 the same 1.3 lands 130→645.

              The grid stays outside this group so the dot pitch does not
              coarsen with it, and so do the zoom controls, which are chrome. */}
          <div
            className="absolute inset-0"
            style={{ transform: "scale(1.3)", transformOrigin: "432px 286px" }}
          >
          <svg
            className="absolute inset-0 h-full w-full"
            aria-hidden
            fill="none"
          >
            <path
              d="M 364 360 C 396 360, 400 300, 430 300"
              stroke={confirmed ? "#1a5c51" : "#a7b1ac"}
              strokeWidth={confirmed ? 2 : 1.5}
              strokeDasharray={confirmed ? "0" : "5 5"}
              strokeLinecap="round"
              className={cn(
                "transition-[opacity,stroke] duration-700 ease-out",
                requested ? "opacity-100" : "opacity-0",
              )}
            />
          </svg>
          <div className="absolute" style={{ left: 200, top: 330 }}>
            <FlowNodeCard
              initials={FLOW_HUB.initials}
              logo={FLOW_HUB.logo}
              name={FLOW_HUB.name}
              role="Company"
              hub
              active={selected}
            />
          </div>
          <div
            className={cn(
              "absolute transition-[opacity,transform] duration-700 ease-out",
              requested
                ? "translate-x-0 translate-y-0 opacity-100"
                : "translate-x-4 -translate-y-1 opacity-0",
            )}
            style={{ left: 430, top: 270 }}
          >
            <FlowNodeCard
              initials={FLOW_TARGET.initials}
              logo={FLOW_TARGET.logo}
              name={FLOW_TARGET.name}
              role={confirmed ? "Partner" : "Pending"}
              pending={!confirmed}
              confirmed={confirmed}
            />
          </div>
          </div>
          <FlowMapControls />
        </div>
      </section>
      <FlowInspector
        selected={selected}
        adding={adding}
        found={found}
        requested={requested}
        confirmed={confirmed}
        step={step}
      />
    </div>
  );
}
