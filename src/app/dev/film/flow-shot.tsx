"use client";

import { useState } from "react";
import { ProductFlowLive } from "@/components/marketing/product-flow-live";
import { FLOW_DURATIONS } from "@/components/marketing/product-flow-data";

/**
 * Shot 01 — the whole arc, in the real screen.
 *
 * The first attempt at this drew a card that stood in for the product. Wrong:
 * it read as a diagram of the idea rather than the thing itself, and "real"
 * was the brief. This is `ProductFlowLive` — the same component the homepage
 * runs, the same dashboard chrome, the same timings — put in a clean frame
 * with the rest of the page removed.
 *
 * It already tells the story end to end: a domain is typed, the other side
 * confirms, the record goes live. One take, no cuts.
 *
 * Framed at 1280×720. Recorded on a retina display that is a 2560×1440 master,
 * which is the whole reason not to build it at 2560.
 */

const LOOP_MS = FLOW_DURATIONS.reduce((a, b) => a + b, 0);

export function FlowShot() {
  const [take, setTake] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setTake((t) => t + 1)}
          className="h-9 rounded-full bg-navy px-4 text-[12px] font-semibold text-on-navy"
        >
          Replay take
        </button>
        <p className="text-[12px] text-muted">
          1280×720 CSS · record at 2× → 2560×1440 · one loop is{" "}
          {(LOOP_MS / 1000).toFixed(1)}s
        </p>
      </div>

      {/* Everything outside this rectangle is scaffolding — do not film it. */}
      <div
        key={take}
        className="relative overflow-hidden bg-[#f4f6f4]"
        style={{ width: 1280, height: 720 }}
      >
        {/* The screen is built for a 1152px measure on the homepage. Scaled to
            fill the frame rather than re-laid-out, so what is filmed is exactly
            what ships — no separate "video version" to drift from the product. */}
        <div className="absolute inset-0 grid place-items-center">
          <div style={{ width: 1152 }}>
            <ProductFlowLive />
          </div>
        </div>
      </div>

      <p className="max-w-[560px] text-[12px] leading-relaxed text-muted">
        The loop is gated by `prefers-reduced-motion`. If the recording machine
        has Reduce Motion on in System Settings, the flow holds still and the
        take is dead — turn it off before filming.
      </p>
    </div>
  );
}
