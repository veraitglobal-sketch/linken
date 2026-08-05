"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { HomeEyebrow, HomeSection } from "@/components/marketing/home-section";
import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";

/**
 * The product, acted out rather than explained: add a company, the other side
 * confirms by email, the partner appears. Mirrors the real surfaces —
 * `partner-search-section`, `network-map`, `confirm-decision`.
 *
 * Both companies here are the operator's own, so the screen states nothing
 * about a third party. Secondary lines carry the domain, never an invented
 * category or city.
 */

/** A real laptop canvas. The whole app fits at true size and the window is
 *  shrunk as one piece, rather than the UI being redrawn smaller. */
const DESIGN_W = 1180;
const DESIGN_H = 740;

const HUB = {
  name: "Vera IT",
  domain: "verait.de",
  initials: "VI",
  logo: "/logos/showcase/vera.png",
};

const TARGET = {
  name: "Dienstemarkt",
  domain: "dienstemarkt.de",
  initials: "DM",
  logo: "/logos/showcase/dienstemarkt-mark.png" as string | null,
};

const DOMAIN = TARGET.domain;

/** 0 idle · 1 node selected · 2 add pressed · 3 typing · 4 found · 5 requested
 *  6 confirm email · 7 confirmed · 8 back on the map */
const DURATIONS = [1200, 1500, 1300, 1800, 1300, 1600, 1700, 1200, 2600];
const LAST_STEP = DURATIONS.length - 1;
const DONE_STEP = 8;

const STEPS = [
  {
    label: "You add them",
    body: "Open the company, press add, type a domain. They land on your map as pending — visible to you, to nobody else.",
    from: 0,
    to: 5,
  },
  {
    label: "They confirm",
    body: "The other side gets one email and presses one button. There is no other way to create the record.",
    from: 6,
    to: 7,
  },
  {
    label: "It becomes public",
    body: "Only now does the partnership appear on your profile, your map, and every widget on your site.",
    from: 8,
    to: 8,
  },
];

export function HomeProductFlow() {
  const [rawStep, setStep] = useState(0);
  const [still, setStill] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  /* Motion is a courtesy, not the message — it holds the end state instead. */
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
  /* Reduced motion is derived, not written — writing it from an effect would
     cascade a second render on every pass. */
  const step = still ? DONE_STEP : rawStep;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(
      () => setStep((s) => (s >= LAST_STEP ? 0 : s + 1)),
      DURATIONS[step],
    );
    return () => window.clearTimeout(id);
  }, [running, step]);

  const scene = step >= 6 && step <= 7 ? "confirm" : "workspace";
  const confirmed = step >= DONE_STEP;
  const activeStep = STEPS.findIndex((s) => step >= s.from && step <= s.to);

  return (
    <div ref={sectionRef}>
      <HomeSection className="!py-10 sm:!py-12">
        {/* A rounded dark card on paper — the same shape the hero and the
            closing block use. A full-bleed band breaks that rhythm. */}
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-navy shadow-[0_28px_80px_rgba(8,20,18,0.22)] lg:rounded-[32px]">
          {/* Two people over one drawing — the section's argument, not decor.
              Pushed far back so it reads as texture behind the product. */}
          <Image
            src="/images/hero-network.jpg"
            alt=""
            aria-hidden
            fill
            quality={72}
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="scale-105 object-cover object-[62%_34%] opacity-[0.5] blur-[1px]"
          />
          {/* Light falls from the upper right, so the text side stays solid and
              the window has somewhere to catch a highlight. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(108deg, rgba(8,20,18,0.97) 0%, rgba(9,22,20,0.92) 34%, rgba(13,29,26,0.74) 68%, rgba(18,40,35,0.6) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-24 h-[620px] w-[760px] rounded-full opacity-[0.18] blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, #b9dccd 0%, #7eb8a4 35%, transparent 72%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/12"
          />

          <div className="relative px-8 py-8 sm:px-12 sm:py-9">
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
              <div className="min-w-0">
                <HomeEyebrow onDark>How a record is made</HomeEyebrow>
                <h2 className="mt-2.5 font-display text-[clamp(1.75rem,3vw,2.3rem)] leading-[1.06] font-medium tracking-[-0.035em] text-white">
                  Nobody writes their own record.
                </h2>
              </div>
              <p className="max-w-sm text-[14px] leading-relaxed text-white/55">
                One company adds the other. The other one decides whether it is
                true. Nothing reaches a visitor in between.
              </p>
            </div>

            {/* Held back from the card edges so the ground it sits on stays
                visible — the window is an object in the section, not its wall. */}
            <div className="relative mx-auto mt-8 hidden w-full max-w-[860px] md:block">
              <Stage cropBottom={185}>
                <AppWindow scene={scene} step={step} confirmed={confirmed} />
              </Stage>

              {/* The one sentence the whole section exists for, said out loud
                  the moment the record becomes real. */}
              <div
                className={cn(
                  "absolute -bottom-5 -left-14 flex items-center gap-2.5 rounded-2xl border border-white/12 bg-[#0b1a18]/85 py-2.5 pr-4 pl-3 backdrop-blur transition-[opacity,transform] duration-700 ease-out",
                  confirmed
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0",
                )}
              >
                <CheckMark />
                <span className="text-[12.5px] font-medium text-white/85">
                  Confirmed by both companies
                </span>
              </div>
            </div>

            <div className="mt-8 md:hidden">
              <MobileFlow step={step} confirmed={confirmed} />
            </div>

            <ol className="mt-7 grid gap-x-10 gap-y-5 border-t border-white/10 pt-5 sm:grid-cols-3">
              {STEPS.map((s, i) => {
                const active = i === activeStep;
                return (
                  <li
                    key={s.label}
                    className="transition-opacity duration-500"
                    style={{ opacity: active ? 1 : 0.4 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500",
                          active ? "bg-[#7eb8a4]" : "bg-white/30",
                        )}
                      />
                      <p className="text-[13px] font-semibold text-white">
                        {s.label}
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                      {s.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </HomeSection>
    </div>
  );
}

/* ---------------------------------------------------------------- stage --- */

/**
 * The screen is written at its real size and shrunk whole, so every label
 * stays live text. `100cqw / <design>px` divides a length by a length —
 * Chromium computes it; the observer below covers browsers that do not.
 */
function Stage({
  children,
  bleedRight = 0,
  cropBottom = 0,
}: {
  children: ReactNode;
  /** Extra width past the slot, clipped by the card — keeps the scale up. */
  bleedRight?: number;
  /** Design px trimmed off the bottom, so the window runs out of frame
   *  instead of forcing the section past one screen. */
  cropBottom?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (CSS.supports("transform", `scale(calc(100cqw / ${DESIGN_W}px))`)) return;
    const ro = new ResizeObserver(([entry]) => {
      el.style.setProperty(
        "--stage-s",
        String(entry.contentRect.width / DESIGN_W),
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="[container-type:inline-size]"
      style={{ width: bleedRight ? `calc(100% + ${bleedRight}px)` : "100%" }}
    >
      <div
        className="relative w-full overflow-hidden rounded-[18px] ring-1 ring-white/10 shadow-[0_1px_0_rgba(255,255,255,0.16)_inset,0_10px_24px_-6px_rgba(0,0,0,0.45),0_40px_70px_-20px_rgba(0,0,0,0.6),0_90px_140px_-50px_rgba(0,0,0,0.75)]"
        style={{ aspectRatio: `${DESIGN_W} / ${DESIGN_H - cropBottom}` }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left bg-surface"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(var(--stage-s, calc(100cqw / ${DESIGN_W}px)))`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- window --- */

function AppWindow({
  scene,
  step,
  confirmed,
}: {
  scene: "workspace" | "confirm";
  step: number;
  confirmed: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* The workspace is the floor of the section; the confirmation is the
          other party's screen sliding over it and away again. */}
      <WorkspaceScene step={step} confirmed={confirmed} />
      <Pane show={scene === "confirm"}>
        <ConfirmScene step={step} />
      </Pane>
    </div>
  );
}

/**
 * Both scenes are opaque full screens, so they must never cross-fade — at 50%
 * you see one through the other. The incoming one slides over instead.
 */
function Pane({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        show ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------- workspace --- */

/** Owns its own counter and is unmounted between cycles, so each pass starts
 *  at zero without an effect writing state during render. */
function SearchField({ typing }: { typing: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!typing) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= DOMAIN.length) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [typing]);

  return (
    <span className="text-[14px] text-ink">
      {DOMAIN.slice(0, typing ? n : DOMAIN.length)}
    </span>
  );
}

function WorkspaceScene({
  step,
  confirmed,
}: {
  step: number;
  confirmed: boolean;
}) {
  const selected = step >= 1;
  const adding = step >= 2;
  const found = step >= 4;
  const requested = step >= 5;

  return (
    <div className="flex h-full w-full bg-surface">
      <Sidebar />

      <section className="relative min-w-0 flex-1 bg-[#fcfdfc]">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-4 px-5 py-4">
          <div className="flex items-center gap-1 rounded-full border border-line/70 bg-surface p-1 shadow-[0_1px_2px_rgba(8,20,18,0.05)]">
            {["Company", "Map", "Inbox"].map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12.5px] font-medium",
                  t === "Map" ? "bg-navy text-white" : "text-ink-soft",
                )}
              >
                {t}
              </span>
            ))}
          </div>
          <div>
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-ink">
              Your map
            </p>
            <p className="text-[11.5px] text-muted">
              1 company · {confirmed ? "1 partner" : "0 partners"}
            </p>
          </div>
        </div>

        <div className="relative h-full w-full overflow-hidden">
          <Grid />

          <div
            aria-hidden
            className="pointer-events-none absolute h-[340px] w-[460px] rounded-full blur-[80px] transition-opacity duration-1000"
            style={{
              left: 150,
              top: 200,
              background:
                "radial-gradient(circle, #7eb8a4 0%, transparent 70%)",
              opacity: confirmed ? 0.24 : 0,
            }}
          />

          {/* The cluster outline the real canvas draws around a company. */}
          <div
            className="absolute rounded-[22px] border border-dashed border-line transition-colors duration-500"
            style={{ left: 140, top: 250, width: 460, height: 220 }}
          />

          <svg
            className="absolute inset-0 h-full w-full"
            aria-hidden
            fill="none"
          >
            <path
              d="M 364 360 C 396 360, 400 300, 430 300"
              stroke={confirmed ? "#1a5c51" : "#a7b1ac"}
              strokeWidth={confirmed ? 2 : 1.5}
              strokeDasharray={confirmed ? "0" : "5 5"}
              strokeLinecap="round"
              className={cn(
                "transition-[opacity,stroke] duration-700 ease-out",
                requested ? "opacity-100" : "opacity-0",
              )}
            />
          </svg>

          <div className="absolute" style={{ left: 200, top: 330 }}>
            <NodeCard
              initials={HUB.initials}
              logo={HUB.logo}
              name={HUB.name}
              role="Company"
              hub
              active={selected}
            />
          </div>

          <div
            className={cn(
              "absolute transition-[opacity,transform] duration-700 ease-out",
              requested
                ? "translate-x-0 translate-y-0 opacity-100"
                : "translate-x-4 -translate-y-1 opacity-0",
            )}
            style={{ left: 430, top: 270 }}
          >
            <NodeCard
              initials={TARGET.initials}
              logo={TARGET.logo}
              name={TARGET.name}
              role={confirmed ? "Partner" : "Pending"}
              pending={!confirmed}
              confirmed={confirmed}
            />
          </div>

          <MapControls />
        </div>
      </section>

      <Inspector
        selected={selected}
        adding={adding}
        found={found}
        requested={requested}
        confirmed={confirmed}
        step={step}
      />
    </div>
  );
}

/* ----------------------------------------------------------- inspector --- */

function Inspector({
  selected,
  adding,
  found,
  requested,
  confirmed,
  step,
}: {
  selected: boolean;
  adding: boolean;
  found: boolean;
  requested: boolean;
  confirmed: boolean;
  step: number;
}) {
  return (
    <aside
      className={cn(
        "w-[300px] shrink-0 border-l border-line/70 bg-surface transition-[opacity,transform] duration-500 ease-out",
        selected ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
      )}
    >
      <div className="flex items-center gap-2 border-b border-line/70 px-4 py-3.5">
        <span className="text-[14px] font-semibold tracking-[-0.02em] text-ink">
          {HUB.name}
        </span>
        <span className="ml-auto rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-blue">
          Company
        </span>
      </div>

      <div className="border-b border-line/70 px-4 py-4">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
          Company
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <Mark name={HUB.name} initials={HUB.initials} logo={HUB.logo} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">
              {HUB.name}
            </p>
            <p className="truncate text-[11.5px] text-muted">{HUB.domain}</p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-muted">
          {confirmed ? "1 partner" : "0 partners"} · Domain verified
        </p>
      </div>

      {/* Clicking the row is what opens the search — same as the real panel. */}
      <div className="px-4 py-3.5">
        <span
          className={cn(
            "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-300",
            adding ? "bg-[#eafaf3]" : "bg-transparent",
          )}
        >
          <span className={adding ? "text-blue" : "text-[#96a09a]"}>
            <Glyph d="M12 5v14M5 12h14" />
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block text-[13px] font-semibold",
                adding ? "text-blue" : "text-ink",
              )}
            >
              Add partners on Company
            </span>
            <span className="block text-[11px] leading-snug text-muted">
              Confirmed partners appear on the map automatically
            </span>
          </span>
        </span>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
            adding ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-2 flex h-10 items-center rounded-xl border border-line bg-[#f7f9f8] px-3">
              {step >= 3 && step < 6 ? (
                <SearchField typing={step === 3} />
              ) : (
                <span className="text-[13px] text-muted">
                  Search registered companies
                </span>
              )}
              <span
                className={cn(
                  "ml-px h-[16px] w-px bg-ink transition-opacity",
                  step === 3 ? "animate-pulse opacity-100" : "opacity-0",
                )}
              />
            </div>

            <div
              className={cn(
                "mt-2 transition-[opacity,transform] duration-500 ease-out",
                found
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1.5 opacity-0",
              )}
            >
              <div className="flex items-center gap-2.5 rounded-xl border border-line/80 bg-surface px-3 py-2.5">
                <Mark
                  name={TARGET.name}
                  initials={TARGET.initials}
                  logo={TARGET.logo}
                  small
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-ink">
                    {TARGET.name}
                  </p>
                  <p className="truncate text-[10.5px] text-muted">
                    {TARGET.domain} ·{" "}
                    <span className="font-semibold text-success">Verified</span>
                  </p>
                </div>
                <RequestPill
                  state={confirmed ? "official" : requested ? "pending" : "idle"}
                />
              </div>
            </div>
          </div>
        </div>

        <span className="mt-1 flex items-center gap-3 rounded-xl px-2.5 py-2.5">
          <span className="text-[#96a09a]">
            <Glyph d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 8v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-ink">
              Add team member
            </span>
            <span className="block text-[11px] text-muted">
              Invite by email — they join after accepting
            </span>
          </span>
        </span>

        <span className="flex items-center gap-3 rounded-xl px-2.5 py-2.5">
          <span className="text-[#96a09a]">
            <Glyph d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-ink">
              Open profile
            </span>
            <span className="block text-[11px] text-muted">
              View the public company page
            </span>
          </span>
        </span>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------- sidebar --- */

/** The workspace nav as it actually ships — same grouping, same labels. */
const NAV_MAIN: { label: string; d: string }[] = [
  {
    label: "Company",
    d: "M4 20V6l8-3 8 3v14M9 20v-5h6v5M8 9h.01M12 9h.01M16 9h.01",
  },
  { label: "Map", d: "M9 6 3 4v14l6 2 6-2 6 2V6l-6-2-6 2Zm0 0v14" },
  { label: "Inbox", d: "M3 12h5l2 3h4l2-3h5M4 6h16v12H4z" },
];

const NAV_MORE: { label: string; d: string; locked?: boolean }[] = [
  { label: "Case studies", d: "M5 4h14v16H5zM5 9h14M10 9v11" },
  { label: "Testimonials", d: "M5 7h14M5 12h14M5 17h8" },
  {
    label: "Verification",
    d: "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Zm-2 9 1.5 1.5L15 10",
  },
  {
    label: "Team access",
    d: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 8v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1",
  },
  { label: "Branches", d: "M12 4v6m0 0H7v4m5-4h5v4M5 14h4v4H5zm10 0h4v4h-4z" },
  { label: "Group", d: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" },
  { label: "Insights", d: "M4 20V10m5 10V4m5 16v-7m5 7V8" },
  {
    label: "Radar",
    d: "M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12h.01",
    locked: true,
  },
];

const NAV_FOOT: { label: string; d: string }[] = [
  { label: "Edit company", d: "M12 8v8M8 12h8M12 3v2M12 19v2M3 12h2M19 12h2" },
  { label: "Home", d: "M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" },
];

function NavRow({
  label,
  d,
  active,
  locked,
}: {
  label: string;
  d: string;
  active?: boolean;
  locked?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px]",
        active
          ? "bg-[#f0f3f1] font-semibold text-blue"
          : locked
            ? "text-[#aab3ae]"
            : "text-ink-soft",
      )}
    >
      {active ? (
        <span className="absolute top-1.5 bottom-1.5 -left-3.5 w-[3px] rounded-full bg-blue" />
      ) : null}
      <span className={active ? "text-blue" : "text-[#96a09a]"}>
        <Glyph d={d} />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {locked ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function Sidebar() {
  return (
    <nav className="flex w-[232px] shrink-0 flex-col border-r border-line/70 bg-surface px-3.5 py-4">
      <span className="flex items-center gap-2 px-1.5">
        <NetworkMark size={16} animate={false} />
        <span className="font-display text-[15px] font-semibold tracking-[-0.03em] text-blue">
          Hansala
        </span>
      </span>

      <span className="mt-4 flex items-center gap-2.5 rounded-xl border border-line/70 bg-[#f9faf9] px-2.5 py-2">
        <Mark name={HUB.name} initials={HUB.initials} logo={HUB.logo} small />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {HUB.name}
          </span>
          <span className="block truncate text-[11px] text-muted">
            Verified workspace
          </span>
        </span>
        <Chevron />
      </span>

      <p className="mt-5 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        Main
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {NAV_MAIN.map((i) => (
          <li key={i.label}>
            <NavRow {...i} active={i.label === "Map"} />
          </li>
        ))}
      </ul>

      <p className="mt-5 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
        More
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {NAV_MORE.map((i) => (
          <li key={i.label}>
            <NavRow {...i} />
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-0.5 border-t border-line/70 pt-4">
        {NAV_FOOT.map((i) => (
          <li key={i.label}>
            <NavRow {...i} />
          </li>
        ))}
      </ul>

      <span className="mt-auto flex items-center gap-2.5 rounded-xl border border-line/70 bg-[#f9faf9] px-2.5 py-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper text-[11px] font-semibold text-muted">
          V
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-semibold text-ink">
            vera
          </span>
          <span className="block text-[11px] text-muted">Owner</span>
        </span>
        <Chevron />
      </span>
    </nav>
  );
}

function MapControls() {
  return (
    <div className="absolute bottom-5 left-5 flex flex-col overflow-hidden rounded-xl border border-line/80 bg-surface/95 backdrop-blur">
      {["M12 5v14M5 12h14", "M5 12h14", "M4 9V4h5M20 15v5h-5"].map((d, i) => (
        <span
          key={d}
          className={cn(
            "grid h-8 w-8 place-items-center text-muted",
            i > 0 && "border-t border-line/70",
          )}
        >
          <Glyph d={d} />
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- confirm --- */

function ConfirmScene({ step }: { step: number }) {
  const pressed = step >= 7;

  return (
    <div className="flex h-full w-full flex-col bg-[#f7f8fa]">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <div className="ml-3 flex h-7 flex-1 items-center rounded-lg bg-paper px-3 text-[12px] text-muted">
          hansala.com/confirm/…
        </div>
      </header>

      <div className="flex items-center gap-2 border-b border-line/70 bg-surface px-8 py-3">
        <NetworkMark size={15} animate={false} />
        <span className="font-display text-[14px] font-semibold tracking-[-0.03em] text-blue">
          Hansala
        </span>
        <span className="ml-auto text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Confirmation request
        </span>
      </div>

      {/* Top-aligned: the frame is cropped at the bottom, so centring would
          push the decision below the fold. */}
      <div className="flex min-h-0 flex-1 justify-center px-8 pt-5">
        <div className="w-[620px]">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Partner confirmation
          </p>
          <h2 className="mt-2 font-display text-[26px] leading-[1.1] font-medium tracking-[-0.035em] text-ink">
            {HUB.name} says they worked with you.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Confirm as{" "}
            <span className="font-semibold text-ink">{TARGET.name}</span> that
            this partnership is real.
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line/80 bg-surface px-4 py-3">
            <Mark name={HUB.name} initials={HUB.initials} logo={HUB.logo} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">
                {HUB.name}
              </p>
              <p className="truncate text-[12px] text-muted">
                {HUB.domain} ·{" "}
                <span className="font-semibold text-success">
                  Domain verified
                </span>
              </p>
            </div>
          </div>

          <ul className="mt-4 border-t border-line/70">
            {[
              "Nothing about this partnership is public until you press confirm.",
              "Once confirmed, it appears on both company profiles at the same time.",
              "You can withdraw it at any time, and it disappears from both.",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 border-b border-line/70 py-2.5"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#7eb8a4]" />
                <span className="text-[12.5px] leading-relaxed text-ink-soft">
                  {line}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2.5">
            <div
              className={cn(
                "flex h-11 flex-1 items-center justify-center rounded-xl text-[14px] font-semibold transition-all duration-300",
                pressed
                  ? "scale-[0.99] bg-[#1a5c51] text-white"
                  : "bg-navy text-white",
              )}
            >
              {pressed ? (
                <span className="flex items-center gap-2">
                  <CheckMark onDark />
                  Confirmed
                </span>
              ) : (
                "Confirm partnership"
              )}
            </div>
            <div className="flex h-11 w-[140px] items-center justify-center rounded-xl border border-line bg-surface text-[14px] font-semibold text-ink-soft">
              Decline
            </div>
          </div>

          <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
            You received this because {HUB.name} added {TARGET.name} on Hansala.
            Only your company can create this record.
          </p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- parts --- */

function Grid() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e3e8e5 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* Keeps the grid from reading as wallpaper at the edges. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 45%, transparent 40%, rgba(252,253,252,0.9) 100%)",
        }}
      />
    </>
  );
}

function Glyph({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-muted"
    >
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NodeCard({
  initials,
  logo,
  name,
  role,
  hub,
  pending,
  confirmed,
  active,
}: {
  initials: string;
  logo?: string | null;
  name: string;
  role: string;
  hub?: boolean;
  pending?: boolean;
  confirmed?: boolean;
  /** Selected on the canvas — what opens the inspector. */
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative bg-surface px-3 py-2.5 transition-shadow duration-300",
        hub
          ? "w-[164px] rounded-2xl border border-navy/20"
          : "w-[150px] rounded-xl border",
        pending ? "border-dashed border-line" : "border-line/90",
        active
          ? "shadow-[0_0_0_2px_rgba(26,92,81,0.12),0_10px_24px_rgba(8,20,18,0.08)]"
          : "shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_4px_14px_rgba(8,20,18,0.04)]",
      )}
    >
      {confirmed ? (
        <span className="absolute -top-1.5 -right-1.5">
          <CheckMark />
        </span>
      ) : null}
      <div className="flex items-center gap-2.5">
        <Mark name={name} initials={initials} logo={logo} small />
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold tracking-[-0.01em] text-ink">
            {name}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold tracking-[0.14em] text-muted uppercase">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Real logo when there is one, initials when there is not — same as `LogoTile`. */
function Mark({
  name,
  initials,
  logo,
  small,
}: {
  name: string;
  initials: string;
  logo?: string | null;
  small?: boolean;
}) {
  const box = small ? "h-8 w-8" : "h-9 w-9";
  if (logo) {
    return (
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl border border-line bg-surface p-1",
          box,
        )}
      >
        <Image
          src={logo}
          alt={name}
          fill
          sizes="36px"
          className="object-contain p-1"
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl border border-line bg-paper text-[10px] font-semibold text-ink-soft",
        box,
      )}
    >
      {initials}
    </span>
  );
}

function RequestPill({ state }: { state: "idle" | "pending" | "official" }) {
  const label =
    state === "official" ? "Official" : state === "pending" ? "Pending" : "Request";
  return (
    <span
      className={cn(
        "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-500",
        state === "idle" && "bg-navy text-white",
        state === "pending" && "border border-line bg-paper text-muted",
        state === "official" && "border border-[#1a5c51]/25 bg-[#eafaf3] text-blue",
      )}
    >
      {label}
    </span>
  );
}

function CheckMark({ onDark }: { onDark?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full",
        onDark ? "bg-white/20" : "bg-[#7eb8a4]",
      )}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 13l4 4L19 7"
          stroke={onDark ? "#fff" : "#0e1f1c"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* -------------------------------------------------------------- mobile --- */

/** No map at 390px — scaling would put 13px type at 4px. Same story, stacked. */
function MobileFlow({ step, confirmed }: { step: number; confirmed: boolean }) {
  const cards = [
    {
      active: step <= 3,
      label: "You add them",
      body: TARGET.name,
      meta: TARGET.domain,
      pill: confirmed ? "Official" : step >= 3 ? "Pending" : "Request",
    },
    {
      active: step >= 4 && step <= 5,
      label: "They get an email",
      body: "Confirm partnership",
      meta: "Nothing is public until they press it.",
      pill: step >= 5 ? "Confirmed" : "Waiting",
    },
    {
      active: step >= 6,
      label: "It becomes a record",
      body: TARGET.name,
      meta: "Confirmed by both companies",
      pill: "Official",
    },
  ];

  return (
    <div className="space-y-2.5">
      {cards.map((c) => (
        <div
          key={c.label}
          className={cn(
            "rounded-2xl border px-4 py-3.5 transition-colors duration-500",
            c.active
              ? "border-white/25 bg-white/[0.07]"
              : "border-white/10 bg-white/[0.02]",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/45 uppercase">
              {c.label}
            </p>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
              {c.pill}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-semibold text-white">{c.body}</p>
          <p className="mt-0.5 text-[12px] text-white/50">{c.meta}</p>
        </div>
      ))}
    </div>
  );
}
