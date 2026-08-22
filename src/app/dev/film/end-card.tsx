"use client";

import { useState } from "react";
import { NetworkMark } from "@/components/marketing/network-mark";

/**
 * Shot 03 — the end card.
 *
 * Built, not generated. Video models mangle lettering, and this is the one
 * frame where every character has to be exact — it carries the line the whole
 * film is for.
 *
 * Two beats, slow: the line lands, then the mark. Nothing else moves.
 */

const T = { line: 400, mark: 1400, url: 2000, end: 5000 } as const;

export function EndCard() {
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
        className="relative overflow-hidden bg-[#081412]"
        style={{ width: 1280, height: 720 }}
      >
        <EndCardFrame />
      </div>
    </div>
  );
}

/** The card itself, so the reel can mount it without the take controls. */
export function EndCardFrame() {
  return (
    <div className="absolute inset-0 bg-[#081412]">
        <style>{CSS}</style>
        <div className="absolute inset-0 grid place-items-center px-24 text-center">
          <div>
            <p className="end-line font-display text-[46px] leading-[1.15] font-medium tracking-[-0.035em] text-[#f2f5f3]">
              Anyone can write it.
              <br />
              <span className="text-[#7eb8a4]">Only they can confirm it.</span>
            </p>
            <div className="end-mark mt-12 flex items-center justify-center gap-3 text-[#7eb8a4]">
              <NetworkMark size={26} animate={false} />
              <span className="font-display text-[20px] font-medium tracking-[-0.03em] text-[#f2f5f3]">
                Hansala
              </span>
            </div>
            <p className="end-url mt-3 text-[13px] font-semibold tracking-[0.16em] text-[#a8b2ad] uppercase">
              hansala.com
            </p>
          </div>
        </div>
    </div>
  );
}

const CSS = `
.end-line { animation: end-rise 900ms cubic-bezier(.22,.61,.36,1) ${T.line}ms both; }
.end-mark { animation: end-rise 800ms cubic-bezier(.22,.61,.36,1) ${T.mark}ms both; }
.end-url  { animation: end-rise 800ms cubic-bezier(.22,.61,.36,1) ${T.url}ms both; }
@keyframes end-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;
