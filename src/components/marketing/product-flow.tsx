"use client";

import { useEffect, useRef, useState } from "react";
import { HomeEyebrow, HomeSection } from "@/components/marketing/home-section";
import {
  FLOW_DONE_STEP,
  FLOW_DURATIONS,
  FLOW_LAST_STEP,
  FLOW_STEPS,
} from "@/components/marketing/product-flow-data";
import { FlowMobile } from "@/components/marketing/product-flow-mobile";
import { FlowStage } from "@/components/marketing/product-flow-stage";
import { FlowAppWindow } from "@/components/marketing/product-flow-window";
import { cn } from "@/lib/cn";

/** Homepage §3 — product acted out: add → confirm → public. */
export function HomeProductFlow() {
  const [rawStep, setStep] = useState(0);
  const [still, setStill] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.25 },
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
  const activeStep = FLOW_STEPS.findIndex(
    (s) => step >= s.from && step <= s.to,
  );
  const active = FLOW_STEPS[Math.max(0, activeStep)] ?? FLOW_STEPS[0];

  return (
    <div ref={sectionRef}>
      <HomeSection className="!py-7 sm:!py-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-chapter bg-navy px-8 py-7 sm:px-11 sm:py-8 lg:rounded-hero">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 62%)",
              WebkitMaskImage:
                "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 62%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/12"
          />

          <div className="relative max-w-xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-blue-soft" />
              <HomeEyebrow onDark>How a record is made</HomeEyebrow>
            </div>
            <h2 className="mt-4 font-display text-section text-white">
              Nobody writes
              <br />
              their own record.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
              One adds, the other decides. Nothing reaches a visitor in between.
            </p>
          </div>

          <ol className="relative mt-7 grid border-y border-white/10 sm:grid-cols-3">
            {FLOW_STEPS.map((s, i) => {
              const on = i === activeStep;
              return (
                <li
                  key={s.label}
                  className="flex items-baseline gap-3 py-3 sm:border-l sm:border-white/10 sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
                >
                  <span
                    className={cn(
                      "text-[11px] font-semibold tabular-nums transition-colors duration-500",
                      on ? "text-blue-soft" : "text-white/25",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[13px] font-medium transition-colors duration-500",
                      on ? "text-white" : "text-white/40",
                    )}
                  >
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <p
            className="relative mt-4 min-h-[2.75rem] max-w-xl text-[14px] leading-relaxed text-white/50"
            aria-live="polite"
          >
            {active.body}
          </p>

          <div className="relative mx-auto mt-5 hidden w-full max-w-[760px] md:block">
            <FlowStage>
              <FlowAppWindow
                scene={scene}
                step={step}
                confirmed={confirmed}
              />
            </FlowStage>
          </div>

          <div className="mt-8 pb-10 md:hidden">
            <FlowMobile step={step} confirmed={confirmed} />
          </div>
        </div>
      </HomeSection>
    </div>
  );
}
