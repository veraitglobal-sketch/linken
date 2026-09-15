"use client";

import type { ReactNode } from "react";
import { NetworkMark } from "@/components/marketing/network-mark";
import {
  FLOW_DOMAIN,
  FLOW_HUB,
  FLOW_TARGET,
} from "@/components/marketing/product-flow-data";
import { FlowMark } from "@/components/marketing/product-flow-parts";
import { cn } from "@/lib/cn";

/**
 * Hero dashboard — a faithful drawing of the real workspace Map screen
 * (`/dashboard/map`) in its builder layout: top bar, icon rail, navy header,
 * Palette panel, canvas toolbar, flow cards, labelled zoom, minimap and status
 * line. Driven by the add → confirm → public loop.
 *
 * Only the flow's two real companies appear (Vera IT and Fade). No people,
 * no invented figures beyond the loop's own 0 and 1.
 *
 * Drawn at DASH_W × DASH_H and scaled by `FlowStage`.
 */
export const DASH_W = 1180;
export const DASH_H = 720;

const RAIL: { d: string; active?: boolean }[] = [
  { d: "M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" },
  { d: "M3 12h5l2 3h4l2-3h5M4 6h16v12H4z" },
  { d: "M6 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm12-7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.2 14.5l7.6-4.5M8.4 16.3l7.2 1.4", active: true },
  { d: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" },
];
const RAIL_MORE: string[] = [
  "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Zm-2 9 1.5 1.5L15 10",
  "M5 7h14M5 12h14M5 17h8",
  "M5 4h14v16H5zM5 9h14M10 9v11",
  "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  "M4 20V10m5 10V4m5 16v-7m5 7V8",
  "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 8v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1",
];

function Glyph({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroDashboard({
  step,
  confirmed,
}: {
  step: number;
  confirmed: boolean;
}) {
  const adding = step >= 2;
  const searching = step >= 3 && step < 6;
  const requested = step >= 5;
  const pending = requested && !confirmed;
  const partners = confirmed ? 1 : 0;

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      {/* top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line/60 px-5">
        <span className="grid size-10 place-items-center rounded-xl bg-navy text-lime">
          <NetworkMark size={16} animate={false} />
        </span>
        <span className="font-display text-[18px] font-semibold tracking-[-0.035em] text-ink">
          Hansala
        </span>
        <span className="grid size-10 place-items-center text-ink/55">
          <Glyph d="M7 4.5h10a3.5 3.5 0 0 1 3.5 3.5v8a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 16V8A3.5 3.5 0 0 1 7 4.5ZM9.5 4.5v15" size={20} />
        </span>
        <span className="mx-1 h-6 w-px bg-line" />
        <span className="flex w-[230px] items-center gap-2 rounded-xl px-2 py-1.5">
          <FlowMark name={FLOW_HUB.name} initials={FLOW_HUB.initials} logo={FLOW_HUB.logo} small />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-ink">{FLOW_HUB.name}</span>
            <span className="block truncate text-[11px] text-muted">Verified workspace</span>
          </span>
          <Glyph d="M6 9l6 6 6-6" size={14} />
        </span>
        <span className="text-[14px] text-muted">/</span>
        <span className="text-[14px] font-semibold text-ink">Map</span>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              "flex h-11 w-[300px] items-center gap-2.5 rounded-full border px-4 text-[14px] transition-colors duration-300",
              searching ? "border-navy/40 bg-surface text-ink" : "border-line bg-[#f7f8f5] text-muted",
            )}
          >
            <Glyph d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4" size={16} />
            {searching ? FLOW_DOMAIN : "Search companies"}
          </span>
          <span className="relative grid size-11 place-items-center rounded-full text-ink ring-1 ring-line">
            <Glyph d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4h4" />
            <span
              className={cn(
                "absolute top-2.5 right-3 size-2 rounded-full transition-colors duration-300",
                pending ? "bg-lime ring-2 ring-surface" : "bg-transparent",
              )}
            />
          </span>
          <span className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-[13px] font-semibold text-navy">
            Public page
            <Glyph d="M7 17 17 7M9 7h8v8" size={14} />
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* icon rail */}
        <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 border-r border-line/55 py-4">
          {RAIL.map((r) => (
            <span
              key={r.d}
              className={cn(
                "grid size-11 place-items-center rounded-xl",
                r.active ? "bg-lime text-navy shadow-[0_6px_14px_-8px_rgba(14,31,28,0.5)]" : "text-ink/55",
              )}
            >
              <Glyph d={r.d} />
            </span>
          ))}
          <span className="my-1.5 h-px w-8 bg-line" />
          {RAIL_MORE.map((d) => (
            <span key={d} className="grid size-11 place-items-center rounded-xl text-ink/55">
              <Glyph d={d} />
            </span>
          ))}
          <span className="mt-auto grid size-11 place-items-center rounded-full bg-navy text-[13px] font-semibold text-lime">
            V
          </span>
        </nav>

        {/* map screen — the builder layout of /dashboard/map */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 bg-[#f4f6f1] p-4">
          {/* header */}
          <section className="flex shrink-0 items-center gap-4 rounded-[20px] bg-navy px-5 py-4 text-on-navy">
            <HeadBtn><Glyph d="M19 12H5m6-6-6 6 6 6" size={16} /></HeadBtn>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-[23px] leading-tight font-semibold tracking-[-0.02em]">
                {FLOW_HUB.name}
                <span className="text-on-navy-soft">
                  <Glyph d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" size={16} />
                </span>
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                <span className="inline-flex h-7 items-center rounded-md bg-lime/15 px-2.5 text-[12px] font-bold tracking-[0.04em] text-lime uppercase">
                  Partner network
                </span>
                <span className="font-mono text-[12.5px] text-on-navy-soft">hansala.com/c/vera</span>
                <span className="grid size-8 place-items-center rounded-lg bg-white/[0.06] ring-1 ring-white/20">
                  <Glyph d="M10 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2ZM16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" size={14} />
                </span>
                <span className="inline-flex items-center gap-1.5 text-[13px] text-on-navy-soft">
                  <span className="text-lime"><Glyph d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm-3.5 8.8 2.3 2.3 4.7-5" size={15} /></span>
                  {pending ? "1 pending · shows once confirmed" : "Confirmed links appear automatically"}
                </span>
              </div>
            </div>
            <HeadBtn><Glyph d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-2.4 6.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4M12 16.8h.01" size={18} /></HeadBtn>
            <HeadBtn><Glyph d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" size={16} /></HeadBtn>
            <HeadBtn>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                {[5, 9.7, 14.3, 19].flatMap((y) =>
                  [5, 9.7, 14.3, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" fill="currentColor" />),
                )}
              </svg>
            </HeadBtn>
            <HeadBtn>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
                <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                <circle cx="12" cy="18.5" r="1.6" fill="currentColor" />
              </svg>
            </HeadBtn>
            <span
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl bg-lime px-4 text-[14px] font-semibold text-navy transition-shadow duration-300",
                adding && !requested && "ring-4 ring-lime/40",
              )}
            >
              <Glyph d="M6.5 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm11 0a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4ZM9.7 12h4.6" size={16} />
              Add partners
            </span>
          </section>

          <div className="flex min-h-0 flex-1 overflow-hidden rounded-[20px] bg-surface ring-1 ring-line/70">
            {/* palette */}
            <aside className="flex w-[262px] shrink-0 flex-col border-r border-line/70 bg-[#fafbf9] p-3">
              <div className="grid grid-cols-2 rounded-xl bg-mute p-1">
                <span className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-surface text-[13px] font-semibold text-ink shadow-[0_2px_6px_-3px_rgba(14,31,28,0.3)]">
                  <Glyph d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3ZM4 10h16M10 10v10" size={14} />
                  Palette
                </span>
                <span className="inline-flex h-9 items-center justify-center gap-2 text-[13px] font-semibold text-ink-soft">
                  <Glyph d="M4.2 4h3.6A1.2 1.2 0 0 1 9 5.2v2.6A1.2 1.2 0 0 1 7.8 9H4.2A1.2 1.2 0 0 1 3 7.8V5.2A1.2 1.2 0 0 1 4.2 4ZM16.2 15h3.6a1.2 1.2 0 0 1 1.2 1.2v2.6a1.2 1.2 0 0 1-1.2 1.2h-3.6a1.2 1.2 0 0 1-1.2-1.2v-2.6a1.2 1.2 0 0 1 1.2-1.2ZM6 9v8.5h9" size={14} />
                  Outline
                </span>
              </div>
              <span className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-mute px-3 text-[13px] text-muted">
                <Glyph d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4" size={14} />
                Search actions…
              </span>
              <ul className="mt-3 space-y-2">
                {PALETTE.map((item) => (
                  <li
                    key={item.title}
                    className={cn(
                      "flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 ring-1 transition-[box-shadow] duration-300",
                      item.title === "Partner" && adding && !requested
                        ? "ring-navy/40 shadow-[0_8px_18px_-12px_rgba(14,31,28,0.45)]"
                        : "ring-line/80",
                    )}
                  >
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", item.tile)}>
                      <Glyph d={item.icon} size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-ink">{item.title}</span>
                      <span className="block truncate text-[12px] text-muted">{item.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* canvas */}
            <div className="relative flex min-w-0 flex-1 flex-col">
              <div className="relative min-h-0 flex-1">
                {/* toolbar */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="flex items-center rounded-xl bg-surface p-1 shadow-[0_2px_8px_-4px_rgba(14,31,28,0.25)] ring-1 ring-line/80">
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-lime-soft px-3 text-[13px] font-semibold text-navy">
                      <Glyph d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-5.5V4.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V13m0-3.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-4.6-2.2L5 15.5a1.6 1.6 0 0 1 2.4-2.1L8 14" size={14} />
                      Pan
                    </span>
                    <span className="inline-flex h-8 items-center gap-1.5 px-3 text-[13px] font-semibold text-ink-soft">
                      <Glyph d="m5 4 14 6.5-6 1.8-2.2 6.2z" size={14} />
                      Select
                    </span>
                  </span>
                  <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-surface px-3 text-[13px] font-semibold text-ink shadow-[0_2px_8px_-4px_rgba(14,31,28,0.25)] ring-1 ring-line/80">
                    <Glyph d="M4.2 4h3.6A1.2 1.2 0 0 1 9 5.2v2.6A1.2 1.2 0 0 1 7.8 9H4.2A1.2 1.2 0 0 1 3 7.8V5.2A1.2 1.2 0 0 1 4.2 4ZM16.2 4h3.6A1.2 1.2 0 0 1 21 5.2v2.6A1.2 1.2 0 0 1 19.8 9h-3.6A1.2 1.2 0 0 1 15 7.8V5.2A1.2 1.2 0 0 1 16.2 4ZM10.2 15h3.6a1.2 1.2 0 0 1 1.2 1.2v2.6a1.2 1.2 0 0 1-1.2 1.2h-3.6A1.2 1.2 0 0 1 9 18.8v-2.6a1.2 1.2 0 0 1 1.2-1.2ZM6 9v2.5h12V9M12 11.5V15" size={14} />
                    Auto-arrange
                  </span>
                </div>
                <span className="absolute top-3 right-3 flex items-center rounded-xl bg-surface p-1 shadow-[0_2px_8px_-4px_rgba(14,31,28,0.25)] ring-1 ring-line/80">
                  <span className="inline-flex h-8 items-center gap-1.5 px-3 text-[13px] font-semibold text-ink-soft">
                    <Glyph d="M4 12h15m-5-5 5 5-5 5" size={14} />
                    Horizontal
                  </span>
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-lime-soft px-3 text-[13px] font-semibold text-navy">
                    <Glyph d="M12 4v15m-5-5 5 5 5-5" size={14} />
                    Vertical
                  </span>
                </span>

                {/* the link */}
                <svg className="absolute inset-0 h-full w-full" aria-hidden fill="none">
                  <path
                    d="M 405 148 C 405 200, 405 208, 405 262"
                    stroke={confirmed ? "#9aa59f" : "#b9c1bc"}
                    strokeWidth={1.5}
                    strokeDasharray={confirmed ? "0" : "5 5"}
                    strokeLinecap="round"
                    className={cn("transition-[opacity,stroke] duration-700", requested ? "opacity-100" : "opacity-0")}
                  />
                </svg>

                {/* start pill */}
                <div className="absolute" style={{ left: 300, top: 104 }}>
                  <span className="relative flex h-11 w-[210px] items-center gap-2.5 rounded-full bg-surface pr-4 pl-1.5 shadow-[0_6px_16px_-10px_rgba(14,31,28,0.45)] ring-[1.5px] ring-navy/70">
                    <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-lime">
                      <FlowMark name={FLOW_HUB.name} initials={FLOW_HUB.initials} logo={FLOW_HUB.logo} small />
                    </span>
                    <span>
                      <span className="block text-[8.5px] leading-none font-semibold tracking-[0.14em] text-muted uppercase">Company</span>
                      <span className="mt-1 block text-[12.5px] leading-none font-semibold text-ink">{FLOW_HUB.name}</span>
                    </span>
                    <Dot bottom />
                  </span>
                </div>

                {/* partner card */}
                <div
                  className={cn(
                    "absolute transition-[opacity,transform] duration-700 ease-out",
                    requested ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                  style={{ left: 307, top: 262 }}
                >
                  <div
                    className={cn(
                      "relative w-[196px] rounded-[10px] bg-surface shadow-[0_1px_2px_rgba(14,31,28,0.06),0_8px_18px_-12px_rgba(14,31,28,0.35)] ring-1",
                      confirmed ? "ring-line" : "ring-ink/25",
                    )}
                  >
                    <div className={cn("flex h-[34px] items-center gap-2 rounded-t-[10px] px-2 transition-colors duration-500", confirmed ? "bg-navy" : "bg-[#5d6863]")}>
                      <span className={cn("grid size-[18px] place-items-center rounded-full transition-colors duration-500", confirmed ? "bg-lime text-navy" : "bg-white/15 text-white")}>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                          <circle cx="4.5" cy="8" r="2.5" />
                          <circle cx="11.5" cy="8" r="2.5" />
                          <path d="M7 8h2" />
                        </svg>
                      </span>
                      <span className="text-[8.5px] font-semibold tracking-[0.1em] text-white uppercase">
                        {confirmed ? "Partner" : "Pending"}
                      </span>
                      <span className="ml-auto font-mono text-[8px] text-on-navy-muted">fade</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-2">
                      <FlowMark name={FLOW_TARGET.name} initials={FLOW_TARGET.initials} logo={FLOW_TARGET.logo} small />
                      <span className="flex-1 text-[13px] font-semibold text-ink">{FLOW_TARGET.name}</span>
                    </div>
                    <Dot top />
                  </div>
                </div>

                {/* zoom */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                  {[
                    ["M12 5v14M5 12h14", "Zoom in"],
                    ["M5 12h14", "Zoom out"],
                    ["M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5", "Fit view"],
                    ["M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4", "Go to start"],
                  ].map(([d, label]) => (
                    <span
                      key={label}
                      className="inline-flex h-9 w-fit items-center gap-2 rounded-full bg-surface pr-4 pl-3 text-[13px] font-semibold text-ink ring-1 ring-line shadow-[0_4px_12px_-8px_rgba(14,31,28,0.4)]"
                    >
                      <Glyph d={d!} size={13} />
                      {label}
                    </span>
                  ))}
                </div>

                {/* minimap */}
                <div className="absolute right-4 bottom-4 h-[108px] w-[168px] rounded-md border-[6px] border-navy bg-surface">
                  <span className="absolute top-[30%] left-1/2 h-2 w-12 -translate-x-1/2 rounded-sm bg-navy" />
                  <span
                    className={cn(
                      "absolute top-[62%] left-1/2 h-2 w-11 -translate-x-1/2 rounded-sm transition-[opacity,background-color] duration-500",
                      requested ? "opacity-100" : "opacity-0",
                      confirmed ? "bg-[#9fd24a]" : "bg-[#b9c1bc]",
                    )}
                  />
                </div>
              </div>

              {/* status bar */}
              <div className="flex shrink-0 items-center gap-3 border-t border-line/70 bg-surface px-5 py-3">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="12" r="9" fill="var(--lime-soft)" stroke="var(--navy)" strokeWidth="1.5" />
                  <path d="m8.3 12.3 2.4 2.4 5-5.3" stroke="var(--navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="text-[14px] font-semibold text-ink">Public shows confirmed only</span>
                <span className="text-[13px] text-muted">
                  1 company · {partners} {partners === 1 ? "partner" : "partners"}
                  {pending ? " · 1 pending, private to you" : ""}
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                  <svg width="18" height="6" viewBox="0 0 18 6" aria-hidden>
                    <line x1="0" y1="3" x2="18" y2="3" stroke="var(--muted)" strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                  Partner
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PALETTE: { title: string; body: string; tile: string; icon: string }[] = [
  {
    title: "Partner",
    body: "A company you worked with.",
    tile: "bg-lime text-navy",
    icon: "M4.5 7h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2ZM16.5 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2ZM11.5 12h3",
  },
  {
    title: "Invite by email",
    body: "A company not on Hansala yet.",
    tile: "bg-lime-soft text-navy",
    icon: "M5 6h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm-1.5 1 6.5 5 6.5-5M19.5 9v6M16.5 12h6",
  },
  {
    title: "Subsidiary",
    body: "A company in your structure.",
    tile: "bg-navy text-lime",
    icon: "M10 3h4a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 14 8h-4a1.5 1.5 0 0 1-1.5-1.5v-2A1.5 1.5 0 0 1 10 3ZM4.5 16h4A1.5 1.5 0 0 1 10 17.5v2A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-2A1.5 1.5 0 0 1 4.5 16ZM15.5 16h4a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-2a1.5 1.5 0 0 1 1.5-1.5ZM12 8v4M6.5 16v-4h11v4",
  },
  {
    title: "Case study",
    body: "A project, confirmed by the client.",
    tile: "bg-mute text-ink",
    icon: "M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2zM9 13.2l2 2 4-4.2",
  },
  {
    title: "Testimonial",
    body: "Words from a client.",
    tile: "bg-mute text-ink",
    icon: "M4 19V9.5A4.5 4.5 0 0 1 8.5 5M4 13h5v6H4M13.5 19V9.5A4.5 4.5 0 0 1 18 5M13.5 13h5v6h-5",
  },
];

function HeadBtn({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-on-navy ring-1 ring-white/20">
      {children}
    </span>
  );
}

function Dot({ top, bottom }: { top?: boolean; bottom?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute left-1/2 size-[6px] -translate-x-1/2 rounded-full border border-surface bg-[#b9c1bc]",
        top && "-top-[3px]",
        bottom && "-bottom-[3px]",
      )}
    />
  );
}
