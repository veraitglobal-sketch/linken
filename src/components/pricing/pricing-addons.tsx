"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Addon = {
  title: string;
  body: string;
  features: readonly string[];
  href: string;
  cta: string;
  icon: ReactNode;
};

/** What Pro adds, one row each — "See what's included" opens the details. */
export function PricingAddons({ items }: { items: readonly Addon[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="m-0 list-none space-y-4 p-0">
      {items.map((a) => {
        const on = open === a.title;
        return (
          <li key={a.title} className="rounded-[24px] bg-surface ring-1 ring-line/80">
            <div className="flex flex-wrap items-center gap-4 px-6 py-5 sm:px-8 sm:py-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lime-soft text-navy">
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px]">
                  {a.title}
                </h3>
                <p className="mt-1 text-[14px] text-muted">{a.body}</p>
              </div>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : a.title)}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-mute"
              >
                See what&rsquo;s included
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                  className={cn("transition-transform duration-200", on && "rotate-180")}
                >
                  <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <Link
                href={a.href}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-navy px-5 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
              >
                {a.cta}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
            {on ? (
              <ul className="m-0 grid list-none gap-2 border-t border-line px-6 py-5 sm:grid-cols-2 sm:px-8">
                {a.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[14px] text-ink-soft">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-navy" />
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
