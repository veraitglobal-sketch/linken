"use client";

import { NetworkMark } from "@/components/marketing/network-mark";
import {
  FLOW_HUB,
  FLOW_TARGET,
} from "@/components/marketing/product-flow-data";
import {
  FlowCheckMark,
  FlowMark,
} from "@/components/marketing/product-flow-parts";
import { cn } from "@/lib/cn";

export function FlowConfirmScene({ step }: { step: number }) {
  const pressed = step >= 7;

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

      <div className="flex min-h-0 flex-1 justify-center px-8 pt-5">
        <div className="w-[620px]">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Partner confirmation
          </p>
          <h2 className="mt-2 font-display text-[26px] leading-[1.1] font-medium tracking-[-0.035em] text-ink">
            {FLOW_HUB.name} says they worked with you.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Confirm as{" "}
            <span className="font-semibold text-ink">{FLOW_TARGET.name}</span>{" "}
            that this partnership is real.
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line/80 bg-surface px-4 py-3">
            <FlowMark
              name={FLOW_HUB.name}
              initials={FLOW_HUB.initials}
              logo={FLOW_HUB.logo}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">
                {FLOW_HUB.name}
              </p>
              <p className="truncate text-[12px] text-muted">
                {FLOW_HUB.domain} ·{" "}
                <span className="font-semibold text-success">
                  Domain verified
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            <div
              className={cn(
                "flex h-11 flex-1 items-center justify-center rounded-xl text-[14px] font-semibold transition-all duration-300",
                pressed
                  ? "scale-[0.99] bg-blue text-white"
                  : "bg-navy text-white",
              )}
            >
              {pressed ? (
                <span className="flex items-center gap-2">
                  <FlowCheckMark onDark />
                  Confirmed
                </span>
              ) : (
                "Confirm partnership"
              )}
            </div>
            <div className="flex h-11 w-[140px] items-center justify-center rounded-xl border border-line bg-surface text-[14px] font-semibold text-ink-soft">
              Decline
            </div>
          </div>

          <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
            You received this because {FLOW_HUB.name} added {FLOW_TARGET.name}{" "}
            on Hansala. Only your company can create this record.
          </p>
        </div>
      </div>
    </div>
  );
}
