"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

/**
 * The brand mark at section scale — two nodes, one link.
 * Scroll closes the circuit. That is the product.
 */
export function ConfirmLink() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      setT(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.35;
      setT(clamp((start - rect.top) / (start - end), 0, 1));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  const left = clamp(t / 0.25, 0, 1);
  const link = clamp((t - 0.2) / 0.45, 0, 1);
  const right = clamp((t - 0.45) / 0.3, 0, 1);
  const sealed = t > 0.82;

  return (
    <div ref={ref} className="mx-auto w-full max-w-[980px]">
      <div className="flex items-center gap-3 sm:gap-5 md:gap-8">
        <Firm label="Your firm" ink={left} align="left" />

        <div className="relative flex min-h-[3px] flex-1 items-center">
          <span
            className="absolute inset-x-0 h-px bg-ink/[0.08]"
            aria-hidden
          />
          <span
            className="absolute left-0 h-[2px] origin-left rounded-full bg-navy"
            style={{ width: `${link * 100}%` }}
            aria-hidden
          />
          <span
            className={cn(
              "absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy transition-opacity duration-500",
              sealed ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          />
        </div>

        <Firm
          label="Their firm"
          ink={Math.max(right, sealed ? 1 : 0.35)}
          align="right"
          ghost={!sealed}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 sm:mt-12">
        <p
          className="max-w-[28ch] font-display text-[clamp(1.35rem,2.8vw,1.85rem)] font-medium leading-[1.25] tracking-[-0.035em] text-ink"
          style={{ opacity: 0.2 + t * 0.8 }}
        >
          {sealed
            ? "Same fact. Both profiles."
            : "Waiting on the other yes."}
        </p>
        <p
          className={cn(
            "font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-500",
            sealed ? "text-blue" : "text-plus",
          )}
        >
          {sealed ? "Confirmed" : "Pending"}
        </p>
      </div>
    </div>
  );
}

function Firm({
  label,
  ink,
  align,
  ghost,
}: {
  label: string;
  ink: number;
  align: "left" | "right";
  ghost?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-[38%] max-w-[14rem] sm:w-[34%] sm:max-w-[16rem]",
        align === "right" && "text-right",
      )}
      style={{ opacity: ink }}
    >
      <p className="text-[10px] font-medium tracking-[0.14em] text-plus uppercase">
        {label}
      </p>
      <div
        className={cn(
          "mt-3 h-9 border-b",
          ghost ? "border-ink/10" : "border-ink/25",
        )}
      />
    </div>
  );
}
