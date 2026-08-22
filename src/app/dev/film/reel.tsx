"use client";

import { useEffect, useRef, useState } from "react";
import { EmbedTestimonials } from "@/components/embed/embed-testimonials";
import { EndCardFrame } from "@/app/dev/film/end-card";
import { NetworkMark } from "@/components/marketing/network-mark";
import { ProductFlowLive } from "@/components/marketing/product-flow-live";
import { EXAMPLE_TESTIMONIALS } from "@/features/testimonials/example-records";
import { PRESET_TOKENS } from "@/features/testimonials/theme/presets";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import { cn } from "@/lib/cn";

/**
 * The whole film, in one window.
 *
 * Recording three shots and cutting them together is three chances to drift.
 * This plays the cut: the generated opening, the product flow, the wall, the
 * end card — on the timeline the voiceover was written to. Press record once
 * and what comes out is the film, less the voice.
 *
 * Crossfades rather than hard cuts between the product shots: a hard cut needs
 * frame-exact sound to land, and there is no sound here yet.
 */

/* Written against Arthur's 30.9s read. Each mark is where that line begins. */
const CUE = {
  open: 0,       // "Every company website has a logo wall."
  flow: 5000,    // "Hansala takes that pen away."
  wall: 19200,   // "It doesn't stay here, either."
  end: 26000,    // "Anyone can write it."
  stop: 31000,
} as const;

const OPENING =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3IEaVk1mNKrk2eGPCdBcHQTqvtm/hf_20260821_184249_9e7adc26-ac0b-4199-9380-8ef987d30dbf.mp4";

const WALL_THEME: TestimonialThemeTokens = {
  ...PRESET_TOKENS.card,
  fontFamily: "var(--font-ui)",
  fontSize: 16,
  radius: 14,
  spacing: 22,
  borderWidth: 0,
  maxColumns: 3,
};

type Scene = "open" | "flow" | "wall" | "end" | "done";

export function Reel() {
  const [take, setTake] = useState(0);
  return <ReelTake key={take} onReplay={() => setTake((t) => t + 1)} />;
}

/* Remounted per take rather than reset inside an effect: a fresh mount starts
   every timer, the video and the scene from zero, with no ordering to get
   wrong — and no setState in an effect for the linter to object to. */
function ReelTake({ onReplay }: { onReplay: () => void }) {
  const [scene, setScene] = useState<Scene>("open");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    /* Belt and braces: the tag carries `autoPlay`, and a muted clip is allowed
       to start without a gesture. This covers the case where the element was
       still attaching when the browser evaluated that. */
    videoRef.current?.play().catch(() => {});
    const timers = [
      window.setTimeout(() => setScene("flow"), CUE.flow),
      window.setTimeout(() => setScene("wall"), CUE.wall),
      window.setTimeout(() => setScene("end"), CUE.end),
      window.setTimeout(() => setScene("done"), CUE.stop),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="h-9 rounded-full bg-navy px-4 text-[12px] font-semibold text-on-navy"
        >
          Play take
        </button>
        <p className="text-[12px] text-muted">
          {CUE.stop / 1000}s · 1280×720 CSS → 2560×1440 master · scene:{" "}
          <span className="font-semibold text-ink">{scene}</span>
        </p>
      </div>

      <div
        className="relative overflow-hidden bg-[#081412]"
        style={{ width: 1280, height: 720 }}
      >
        {/* 01 — generated opening */}
        <Layer on={scene === "open"}>
          <video
            ref={videoRef}
            src={OPENING}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        </Layer>

        {/* 02 — the real product */}
        <Layer on={scene === "flow"} pad>
          <div style={{ width: 1152 }}>
            <ProductFlowLive />
          </div>
        </Layer>

        {/* 03 — what it becomes */}
        <Layer on={scene === "wall"} pad>
          <div className="w-full px-16">
            <EmbedTestimonials
              items={EXAMPLE_TESTIMONIALS}
              layout="wall"
              theme={WALL_THEME}
              themeParam="light"
              profileUrl="/c/verait"
              companyName="Vera IT"
            />
          </div>
        </Layer>

        {/* The mark, held through the film and dropped for the end card, where
            it takes the centre instead. Bottom-right at 55% — a broadcast bug
            is present, not loud; at full opacity it competes with the product
            it is meant to be signing. */}
        <div
          className={cn(
            "pointer-events-none absolute right-7 bottom-6 z-10 flex items-center gap-2 transition-opacity duration-500",
            scene === "end" || scene === "done" ? "opacity-0" : "opacity-55",
          )}
        >
          <span className={scene === "open" ? "text-[#f2f5f3]" : "text-[#0d1210]"}>
            <NetworkMark size={18} animate={false} />
          </span>
          <span
            className={cn(
              "font-display text-[15px] font-medium tracking-[-0.03em]",
              scene === "open" ? "text-[#f2f5f3]" : "text-[#0d1210]",
            )}
          >
            Hansala
          </span>
        </div>

        {/* 04 — the line */}
        <Layer on={scene === "end" || scene === "done"} dark>
          <EndCardFrame />
        </Layer>
      </div>
    </div>
  );
}

function Layer({
  on,
  pad,
  dark,
  children,
}: {
  on: boolean;
  pad?: boolean;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-500",
        pad && "grid place-items-center",
        !dark && pad && "bg-[#f4f6f4]",
        on ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {children}
    </div>
  );
}
