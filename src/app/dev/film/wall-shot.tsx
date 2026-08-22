"use client";

import { useState } from "react";
import { EmbedTestimonials } from "@/components/embed/embed-testimonials";
import { EXAMPLE_TESTIMONIALS } from "@/features/testimonials/example-records";
import { PRESET_TOKENS } from "@/features/testimonials/theme/presets";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";

/**
 * Shot 02 — the payoff.
 *
 * What the confirmations turn into: the wall, drifting, every card carrying its
 * own evidence line. Real component, real layout, the same one a customer's
 * site renders — not a picture of it.
 *
 * The ground is the light band rather than the checkerboard: this shot is about
 * how it looks on a page, not about proving the embed paints nothing.
 */

const THEME: TestimonialThemeTokens = {
  ...PRESET_TOKENS.card,
  fontFamily: "var(--font-ui)",
  fontSize: 16,
  radius: 14,
  spacing: 22,
  borderWidth: 0,
  maxColumns: 3,
};

export function WallShot() {
  const [take, setTake] = useState(0);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setTake((t) => t + 1)}
        className="h-9 rounded-full bg-navy px-4 text-[12px] font-semibold text-on-navy"
      >
        Replay take
      </button>

      <div
        key={take}
        className="relative overflow-hidden bg-[#f4f6f4]"
        style={{ width: 1280, height: 720 }}
      >
        <div className="absolute inset-0 grid place-items-center px-16">
          <div className="w-full">
            <EmbedTestimonials
              items={EXAMPLE_TESTIMONIALS}
              layout="wall"
              theme={THEME}
              themeParam="light"
              profileUrl="/c/verait"
              companyName="Vera IT"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
