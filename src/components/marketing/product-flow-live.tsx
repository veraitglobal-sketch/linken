"use client";

import { useEffect, useRef, useState } from "react";
import {
  FLOW_DONE_STEP,
  FLOW_DURATIONS,
  FLOW_LAST_STEP,
} from "@/components/marketing/product-flow-data";
import { ProductFlowScreen } from "@/components/marketing/product-flow-screen";
import { FlowStage } from "@/components/marketing/product-flow-stage";
import { FlowAppWindow } from "@/components/marketing/product-flow-window";

/** Left frame — live add → confirm → public loop (same as before the split). */
export function ProductFlowLive() {
  const [rawStep, setStep] = useState(0);
  const [still, setStill] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0, rootMargin: "80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = onScreen && !still;
  const step = still ? FLOW_DONE_STEP : rawStep;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(
      () => setStep((s) => (s >= FLOW_LAST_STEP ? 0 : s + 1)),
      FLOW_DURATIONS[step],
    );
    return () => window.clearTimeout(id);
  }, [running, step]);

  const scene = step >= 6 && step <= 7 ? "confirm" : "workspace";
  const confirmed = step >= FLOW_DONE_STEP;

  return (
    <div ref={ref}>
      <ProductFlowScreen caption="You add them — the path runs live on your map.">
        <FlowStage>
          <FlowAppWindow
            scene={scene}
            step={step}
            confirmed={confirmed}
          />
        </FlowStage>
      </ProductFlowScreen>
    </div>
  );
}
