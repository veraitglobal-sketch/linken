"use client";

import Link from "next/link";
import { useState } from "react";
import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";

type Plan = {
  id: "free" | "pro";
  name: string;
  tagline: string;
  price: string;
  note: string;
  highlights: readonly string[];
  cta: { href: string; label: string };
};

/**
 * Plan picker: two selectable cards and a summary bar that follows the page
 * while the plans are in view. Only real plans and real prices — Hansala bills
 * per company, monthly, so there is no seat slider or annual toggle to show.
 */
export function PricingPlans({
  free,
  pro,
  billingUnit,
}: {
  free: Plan;
  pro: Plan;
  billingUnit: string;
}) {
  const [picked, setPicked] = useState<"free" | "pro">("free");
  const current = picked === "free" ? free : pro;

  return (
    <div className="relative">
      <div
        role="radiogroup"
        aria-label="Choose a plan"
        className="grid gap-5 lg:grid-cols-2"
      >
        {[free, pro].map((plan) => {
          const on = plan.id === picked;
          const dark = plan.id === "pro";
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPicked(plan.id)}
              className={cn(
                "flex flex-col rounded-[28px] p-7 text-left transition-[box-shadow,transform] duration-200 sm:p-9",
                dark ? "bg-navy text-on-navy" : "bg-surface text-ink",
                on
                  ? "ring-[3px] ring-navy shadow-[0_30px_60px_-30px_rgba(14,31,28,0.45)]"
                  : "ring-1 ring-line/80 hover:-translate-y-0.5",
                dark && on && "ring-lime",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-2xl",
                      dark ? "bg-lime text-navy" : "bg-navy text-lime",
                    )}
                  >
                    <NetworkMark size={22} animate={false} />
                  </span>
                  <span className="font-display text-[28px] font-semibold tracking-[-0.03em]">
                    {plan.name}
                  </span>
                </div>
                <span
                  aria-hidden
                  className={cn(
                    "mt-2 grid size-6 place-items-center rounded-full ring-2",
                    dark ? "ring-white/40" : "ring-ink/25",
                    on && (dark ? "ring-lime" : "ring-navy"),
                  )}
                >
                  {on ? (
                    <span className={cn("size-3 rounded-full", dark ? "bg-lime" : "bg-navy")} />
                  ) : null}
                </span>
              </div>

              <p className="mt-6 text-[18px] font-semibold tracking-[-0.01em]">
                {plan.tagline}
              </p>
              <p className="mt-3 font-display text-[56px] leading-none font-semibold tracking-[-0.045em] tabular-nums">
                {plan.price}
              </p>
              <p className={cn("mt-4 text-[15px] leading-relaxed", dark ? "text-on-navy-soft" : "text-ink-soft")}>
                {plan.note}
              </p>

              <ul className={cn("mt-7 space-y-3 border-t pt-7", dark ? "border-white/10" : "border-line")}>
                {plan.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[15px] leading-relaxed">
                    <span
                      className={cn(
                        "mt-[3px] grid size-5 shrink-0 place-items-center rounded-full",
                        dark ? "bg-lime text-navy" : "bg-lime-soft text-navy",
                      )}
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="m2.5 6.5 2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className={dark ? "text-on-navy" : "text-ink"}>{h}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Summary bar — sticks to the bottom of the viewport while the plans
          are on screen, like a checkout drawer. */}
      <div className="z-30 mt-6 sm:sticky sm:bottom-4">
        <div className="flex flex-col gap-4 rounded-[24px] bg-navy p-2 shadow-[0_30px_60px_-24px_rgba(14,31,28,0.55)] sm:flex-row sm:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 rounded-[18px] bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex rounded-full bg-mute p-1">
                {[free, pro].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPicked(p.id)}
                    className={cn(
                      "h-9 rounded-full px-4 text-[14px] font-semibold transition-colors",
                      picked === p.id ? "bg-navy text-on-navy" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <p className="hidden text-[15px] font-semibold text-ink md:block">
                {current.tagline}
              </p>
            </div>
            <p className="text-[13px] text-muted">{billingUnit}</p>
          </div>
          <div className="flex items-center justify-between gap-5 rounded-[18px] bg-lime px-5 py-3 sm:w-[340px]">
            <p className="font-display text-[34px] leading-none font-semibold tracking-[-0.04em] text-navy tabular-nums">
              {current.price}
            </p>
            <Link
              href={current.cta.href}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-navy px-5 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
            >
              {current.id === "free"
                ? "Start free"
                : current.cta.href === "/contact"
                  ? "Contact us"
                  : "Get Pro"}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
