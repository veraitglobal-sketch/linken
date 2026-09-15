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

/**
 * The add → confirm → public loop, shared by the film screen and the hero.
 * Pauses off-screen, holds the end state under reduced motion, and `jump`
 * lets a tab restart the loop from a chosen step.
 */
/** `doneMs` lets a caller hold the finished, connected state longer than the
 *  film timeline does — the hero opens on it. */
export function useFlowLoop(startAt = 0, doneMs?: number) {
  const [rawStep, setStep] = useState(startAt);
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
      step === FLOW_DONE_STEP && doneMs ? doneMs : FLOW_DURATIONS[step],
    );
    return () => window.clearTimeout(id);
  }, [running, step, doneMs]);

  return {
    ref,
    step,
    still,
    jump: setStep,
    scene: (step >= 6 && step <= 7 ? "confirm" : "workspace") as
      | "confirm"
      | "workspace",
    confirmed: step >= FLOW_DONE_STEP,
  };
}

/** Film frame — live add → confirm → public loop. */
export function ProductFlowLive() {
  const { ref, step, scene, confirmed } = useFlowLoop();

  return (
    <div ref={ref}>
      <ProductFlowScreen caption="You add them. They confirm. Only then does the record go live.">
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
