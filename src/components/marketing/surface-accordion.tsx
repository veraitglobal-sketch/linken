"use client";

import { useId, useState } from "react";
import { SurfaceArt } from "@/components/marketing/home-surfaces-art";
import type { SurfaceGlyphKind } from "@/components/marketing/surface-glyph";
import { cn } from "@/lib/cn";

export type Surface = {
  title: string;
  body: string;
  /** The route or endpoint behind it — every item names something real. */
  source: string;
  glyph: SurfaceGlyphKind;
};


/**
 * Thrivea's feature accordion: a list on the left that opens one item at a
 * time, a tinted stage on the right drawing where that surface appears.
 *
 * Only one item is ever open and the stage has a fixed ratio, so opening an
 * item moves the list by one body's height and never the stage.
 */
export function SurfaceAccordion({
  surfaces,
}: {
  surfaces: readonly Surface[];
}) {
  const [open, setOpen] = useState(0);
  const base = useId();
  const current = surfaces[open]!;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[500px_1fr] lg:gap-14">
      {/* `min-w-0` on both tracks: an unbroken route in mono is a min-content
          width, and it pushed the phone layout 103px past the viewport. */}
      <ul className="m-0 min-w-0 list-none border-t border-ink/15 px-4 sm:px-[18px] lg:py-0 lg:pr-0 lg:pl-20">
        {surfaces.map((s, i) => {
          const on = i === open;
          return (
            <li key={s.title} className="border-b border-ink/15">
              <h3 className="m-0">
                <button
                  type="button"
                  id={`${base}-h${i}`}
                  aria-expanded={on}
                  aria-controls={`${base}-p${i}`}
                  onClick={() => setOpen(i)}
                  className={cn(
                    "flex w-full items-center justify-between gap-6 py-6 text-left font-display text-[22px] leading-snug font-semibold tracking-[-0.025em] transition-colors duration-200 sm:text-[24px]",
                    on ? "text-ink" : "text-ink/40 hover:text-ink/70",
                  )}
                >
                  {s.title}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className={cn(
                      "shrink-0 transition-transform duration-300",
                      on ? "rotate-180 text-ink" : "text-ink",
                    )}
                  >
                    <path
                      d="M8 2.5v11M3.5 9 8 13.5 12.5 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </h3>
              <div
                id={`${base}-p${i}`}
                role="region"
                aria-labelledby={`${base}-h${i}`}
                hidden={!on}
                className="pb-6"
              >
                <p className="max-w-[44ch] text-[16px] leading-relaxed text-ink-soft">
                  {s.body}
                </p>
                <p className="mt-3 font-mono text-[11.5px] tracking-[-0.01em] break-all text-blue">
                  {s.source}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mx-4 grid min-h-[420px] min-w-0 place-items-center rounded-[28px] bg-lime-soft p-6 sm:mx-[18px] sm:p-10 lg:sticky lg:top-24 lg:mr-0 lg:min-h-[690px] lg:rounded-l-[32px] lg:rounded-r-none lg:p-16">
        <div key={open} className="animate-rise w-full max-w-[640px]">
          <SurfaceArt kind={current.glyph} />
        </div>
      </div>
    </div>
  );
}

