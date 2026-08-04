"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Retell-grade product stage — privacy state, no fake company cast.
 * Held (redacted) → Public (released). Same rule as the product.
 */
export function OverviewRecord() {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [open, setOpen] = useState(false);
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
      setArmed(true);
      setOpen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setArmed(true);
          setOpen(true);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  useEffect(() => {
    if (reduce || !armed) return;
    const id = window.setInterval(() => setOpen((v) => !v), 3600);
    return () => window.clearInterval(id);
  }, [armed, reduce]);

  return (
    <div ref={ref} className="mx-auto max-w-[1180px]">
      <p className="text-[13px] font-semibold tracking-[-0.01em] text-blue">
        The record
      </p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end lg:gap-16">
        <h2 className="max-w-[16ch] font-display text-[clamp(2rem,3.8vw,3.1rem)] font-medium leading-[1.08] tracking-[-0.04em] text-ink text-balance">
          Public only after the second yes.
        </h2>
        <p className="max-w-[36ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
          Invites and drafts stay off every public page until both companies
          confirm. Then one fact exists in two places.
        </p>
      </div>

      <div className="relative mt-12 overflow-hidden rounded-[28px] bg-[linear-gradient(165deg,#eef3f1_0%,#e4ebe8_48%,#dce6e2_100%)] px-6 py-10 sm:mt-14 sm:px-10 sm:py-12 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <StatePane
            title="Held"
            mono="Private"
            active={!open}
            body="Name, credit, and partner slot stay barred. Visitors see nothing."
          >
            <RedactionBars />
          </StatePane>
          <StatePane
            title="Released"
            mono="Public"
            active={open}
            body="Same confirmation on both profiles. Case study credit uses the same gate."
          >
            <ReleasedMarks on={open} />
          </StatePane>
        </div>
      </div>
    </div>
  );
}

function StatePane({
  title,
  mono,
  active,
  body,
  children,
}: {
  title: string;
  mono: string;
  active: boolean;
  body: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "transition-opacity duration-500",
        active ? "opacity-100" : "opacity-40",
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[1.35rem] font-medium tracking-[-0.03em] text-ink">
          {title}
        </h3>
        <p
          className={cn(
            "font-mono text-[10px] tracking-[0.14em] uppercase",
            active ? "text-blue" : "text-plus",
          )}
        >
          {mono}
        </p>
      </div>
      <div className="mt-8 min-h-[5.5rem]">{children}</div>
      <p className="mt-6 max-w-[34ch] text-[14px] leading-relaxed text-muted">
        {body}
      </p>
    </div>
  );
}

function RedactionBars() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-3.5 w-[72%] rounded-sm bg-ink/15" />
      <div className="h-3.5 w-[48%] rounded-sm bg-ink/10" />
      <div className="h-3.5 w-[60%] rounded-sm bg-ink/[0.07]" />
    </div>
  );
}

function ReleasedMarks({ on }: { on: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 transition-opacity duration-500",
        on ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      <span className="size-2.5 rounded-full bg-navy" />
      <span className="h-px w-16 bg-navy" />
      <span className="size-2.5 rounded-full bg-navy" />
      <span className="ml-2 font-mono text-[11px] tracking-[0.12em] text-blue uppercase">
        Confirmed
      </span>
    </div>
  );
}
