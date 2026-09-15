"use client";

import type { ReactNode } from "react";
import {
  FLOW_DONE_STEP,
  FLOW_STEPS,
} from "@/components/marketing/product-flow-data";
import { useFlowLoop } from "@/components/marketing/product-flow-live";
import { FlowStage } from "@/components/marketing/product-flow-stage";
import {
  DASH_H,
  DASH_W,
  HeroDashboard,
} from "@/components/marketing/home-hero-dashboard";
import { cn } from "@/lib/cn";

const TAB_ICONS: readonly ReactNode[] = [
  // Add — a node and a plus.
  <path key="add" d="M8 3.5v9M3.5 8h9" />,
  // Confirm — a check.
  <path key="confirm" d="m3.5 8.5 3 3 6-7" />,
  // Public — two nodes and the link between them: the mark.
  <g key="public">
    <circle cx="3.6" cy="8" r="2" />
    <circle cx="12.4" cy="8" r="2" />
    <path d="M5.6 8h4.8" />
  </g>,
];

/**
 * Hero stage — icon tabs over the real workspace in a thin translucent frame.
 *
 * Tabs are the loop's own three beats (Thrivea's product tabs, but the lit one
 * follows the animation, and choosing one restarts the loop there).
 *
 */
export function HomeHeroStage() {
  const { ref, step, jump, confirmed } = useFlowLoop(FLOW_DONE_STEP, 6500);
  const active = FLOW_STEPS.findIndex((s) => step >= s.from && step <= s.to);

  return (
    <div ref={ref} id="how-it-works" className="scroll-mt-24">
      <div
        role="tablist"
        aria-label="How a record is made"
        className="flex flex-wrap justify-center gap-2.5 sm:gap-4"
      >
        {FLOW_STEPS.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => jump(s.from)}
              className={cn(
                "inline-flex h-[42px] items-center gap-2 rounded-xl px-4 text-[15px] font-semibold sm:min-w-[160px] sm:justify-center transition-[background-color,color] duration-300 sm:px-5",
                on
                  ? "bg-navy text-on-navy"
                  : "bg-white/50 text-ink hover:bg-white/80",
              )}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {TAB_ICONS[i]}
              </svg>
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="relative mx-auto mt-8 max-w-[1024px]">
        <figure className="relative m-0 rounded-[20px] bg-white/25 p-2 ring-1 ring-white/70 sm:p-3">
          <div className="overflow-hidden rounded-[14px] bg-surface ring-1 ring-black/[0.06]">
            <FlowStage designW={DASH_W} designH={DASH_H}>
              <HeroDashboard step={step} confirmed={confirmed} />
            </FlowStage>
          </div>
        </figure>
      </div>
    </div>
  );
}
