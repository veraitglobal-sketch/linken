"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  FLOW_DESIGN_H,
  FLOW_DESIGN_W,
} from "@/components/marketing/product-flow-data";

export function FlowStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      CSS.supports("transform", `scale(calc(100cqw / ${FLOW_DESIGN_W}px))`)
    ) {
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      el.style.setProperty(
        "--stage-s",
        String(entry.contentRect.width / FLOW_DESIGN_W),
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="[container-type:inline-size] w-full">
      <div
        className="relative w-full overflow-hidden rounded-[18px] shadow-[0_1px_0_rgba(255,255,255,0.16)_inset,0_10px_24px_-6px_rgba(0,0,0,0.45),0_40px_70px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
        style={{ aspectRatio: `${FLOW_DESIGN_W} / ${FLOW_DESIGN_H}` }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left bg-surface"
          style={{
            width: FLOW_DESIGN_W,
            height: FLOW_DESIGN_H,
            transform: `scale(var(--stage-s, calc(100cqw / ${FLOW_DESIGN_W}px)))`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
