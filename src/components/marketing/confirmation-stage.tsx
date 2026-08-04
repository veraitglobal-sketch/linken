"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type Props = {
  /** The company that did the work and cannot vouch for itself. */
  claimant: string;
  /** The company on the other side — the only one whose click counts. */
  confirmer: string;
  /** What the record is about, in the claimant's own words. */
  subject: string;
  period: string;
  /** The component that ships once the record exists. */
  record: ReactNode;
};

/** Faint drawing texture — sits under the stage, never competes with it. */
const RULED_SHEET =
  "repeating-linear-gradient(to right,rgba(255,255,255,0.022) 0 1px,transparent 1px 88px)," +
  "repeating-linear-gradient(to bottom,rgba(255,255,255,0.022) 0 1px,transparent 1px 88px)";

/**
 * The product in one gesture: a company states the work, the ask crosses to
 * the other side, and only that side's click brings the record into being.
 * The link is the mark's own grammar — node, line, node — at section scale.
 *
 * Markup renders finished, so the record survives no JS, a dead observer or
 * reduced motion. Hydration sets `data-armed` to wind it back before the first
 * paint; entering the viewport removes it, and that is what plays the sequence.
 */
export function ConfirmationStage({
  claimant,
  confirmer,
  subject,
  period,
  record,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.armed = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          delete el.dataset.armed;
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group/stage relative overflow-hidden rounded-[28px] bg-[linear-gradient(155deg,#12241f_0%,#0b1815_58%,#081412_100%)] p-8 shadow-[0_28px_70px_rgba(10,20,18,0.22)] ring-1 ring-black/[0.05] sm:p-12 lg:p-16"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: RULED_SHEET }}
        aria-hidden
      />

      <div className="relative">
        <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(120px,1.1fr)_minmax(0,1fr)] sm:items-center sm:gap-6">
          {/* One side states the work — and that alone is worth nothing. */}
          <Party
            name={claimant}
            note="States the work"
            detail={`${subject} · ${period}`}
            delay={0}
          />

          {/* The ask crossing to the other side. */}
          <span
            className="relative hidden h-[9px] items-center sm:flex"
            aria-hidden
          >
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/12" />
            <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-[#7eb8a4] transition-[width] duration-[900ms] ease-out [transition-delay:220ms] group-data-armed/stage:w-0 motion-reduce:transition-none">
              <span className="absolute top-1/2 -right-1 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-[#7eb8a4] shadow-[0_0_0_4px_rgba(126,184,164,0.16)]" />
            </span>
            <span className="absolute top-1/2 left-0 h-[7px] w-[7px] -translate-y-1/2 scale-100 rounded-full bg-[#7eb8a4] transition-transform duration-300 ease-out group-data-armed/stage:scale-0 motion-reduce:transition-none" />
          </span>

          {/* The only click that counts. */}
          <Party
            name={confirmer}
            note="Confirms it"
            detail="Both sides on the record"
            delay={1150}
            align="right"
          />
        </div>

        {/* Same column template as the row above, so the record lands under
            the link it came from rather than floating in a corner. */}
        <div className="mt-12 grid items-start gap-8 border-t border-white/10 pt-10 sm:mt-14 sm:grid-cols-[minmax(0,1fr)_minmax(120px,1.1fr)_minmax(0,1fr)] sm:gap-6 sm:pt-12">
          <p className="max-w-xs text-[14px] leading-relaxed text-white/55">
            Only now does the record exist — and this is the component that
            carries it onto a page.
          </p>

          <div className="translate-y-0 opacity-100 transition-[opacity,transform] duration-700 ease-out [transition-delay:1500ms] group-data-armed/stage:translate-y-3 group-data-armed/stage:opacity-0 motion-reduce:transition-none sm:col-span-2">
            <div className="w-full max-w-[340px] rounded-xl shadow-[0_26px_50px_-18px_rgba(3,9,8,0.85)]">
              {record}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Party({
  name,
  note,
  detail,
  delay,
  align = "left",
}: {
  name: string;
  note: string;
  detail: string;
  delay: number;
  align?: "left" | "right";
}) {
  return (
    <div
      className={[
        "translate-y-0 opacity-100 transition-[opacity,transform] duration-500 ease-out group-data-armed/stage:translate-y-2 group-data-armed/stage:opacity-0 motion-reduce:transition-none",
        align === "right" ? "sm:text-right" : "",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-[10px] font-semibold tracking-[0.16em] text-[#7eb8a4] uppercase">
        {note}
      </p>
      <p className="mt-2.5 font-display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-tight font-medium tracking-[-0.035em] text-white">
        {name}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-white/50">{detail}</p>
    </div>
  );
}
