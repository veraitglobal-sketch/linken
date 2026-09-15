"use client";

import { useState } from "react";
import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";

type Item = { q: string; a: string };

/**
 * FAQ in two columns: questions on the left, the chosen answer on the right.
 * On a phone the answer opens under its question instead.
 */
export function PricingFaqSplit({ items }: { items: readonly Item[] }) {
  const [active, setActive] = useState(0);
  const current = items[active]!;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ul className="m-0 list-none space-y-2.5 p-0">
        {items.map((item, i) => {
          const on = i === active;
          return (
            <li key={item.q}>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setActive(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-[16px] font-semibold transition-colors",
                  on ? "bg-navy text-on-navy" : "bg-surface text-ink ring-1 ring-line/80 hover:bg-mute",
                )}
              >
                {item.q}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
                  <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {on ? (
                <p className="px-5 pt-3 pb-1 text-[15px] leading-relaxed text-ink-soft lg:hidden">
                  {item.a}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="hidden rounded-[28px] bg-lime-soft p-10 lg:sticky lg:top-28 lg:block lg:self-start">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy text-lime">
            <NetworkMark size={22} animate={false} />
          </span>
          <h3 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.025em] text-ink">
            {current.q}
          </h3>
        </div>
        <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">{current.a}</p>
      </div>
    </div>
  );
}
