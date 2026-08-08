"use client";

import { useEffect, useRef, useState } from "react";
import { HomeEyebrow } from "@/components/marketing/home-section";
import { OverviewReleased } from "@/components/marketing/overview-released";
import {
  OverviewRedactionBars,
  OverviewStatePane,
} from "@/components/marketing/overview-state-pane";

/** §2 — privacy rule stage: Held → Released. Product widgets, no fake cast. */
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
    const id = window.setInterval(() => setOpen((v) => !v), 3800);
    return () => window.clearInterval(id);
  }, [armed, reduce]);

  return (
    <div ref={ref} className="mx-auto max-w-[1180px]">
      <HomeEyebrow>The record</HomeEyebrow>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-14">
        <h2 className="max-w-[18ch] font-display text-chapter text-ink text-balance">
          Public only after the second yes.
        </h2>
        <p className="max-w-[38ch] text-[15px] leading-relaxed text-muted lg:justify-self-end lg:pb-1 lg:text-right">
          Pending stays private. Confirmed becomes one fact on both sides —
          profile, embed, and API.
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {open
          ? "Showing released public state"
          : "Showing held private state"}
      </p>

      <div className="relative mt-11 overflow-hidden rounded-chapter bg-[linear-gradient(165deg,#eef3f1_0%,#e4ebe8_48%,#dce6e2_100%)] px-6 py-10 sm:mt-12 sm:px-10 sm:py-12 lg:px-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] pb-5">
          <p className="text-[12px] font-medium text-ink-soft">
            Same rule as the product — nothing invents a visitor-facing record.
          </p>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
            {open ? "Released" : "Held"}
          </p>
        </div>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <OverviewStatePane
            title="Held"
            mono="Private"
            active={!open}
            body="Name, credit, and partner slot stay barred. Visitors see nothing."
          >
            <OverviewRedactionBars />
          </OverviewStatePane>
          <OverviewStatePane
            title="Released"
            mono="Public"
            active={open}
            body="Paste once — embed or API. Confirmed partners appear; nobody edits the page again."
          >
            <OverviewReleased on={open} />
          </OverviewStatePane>
        </div>
      </div>
    </div>
  );
}
