"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HomeEyebrow, HomeSection } from "@/components/marketing/home-section";
import { cn } from "@/lib/cn";

/**
 * The product, acted out rather than explained: add a company, the other side
 * confirms by email, the partner appears. Mirrors the real surfaces —
 * `partner-search-section`, `network-map`, `confirm-decision`.
 *
 * Data follows the `/demo` rule: initials only, example.com, never a real
 * logo or a real company.
 */

const DESIGN_W = 1280;
const DESIGN_H = 760;

const DOMAIN = "bramble.example.com";

/** 0 idle · 1 typing · 2 found · 3 requested · 4 inbox · 5 confirmed · 6 back · 7 hold */
const DURATIONS = [1100, 1900, 1500, 1600, 1700, 1200, 2000, 2400];
const LAST_STEP = DURATIONS.length - 1;
const DONE_STEP = 6;

const STEPS = [
  { label: "Add", from: 0, to: 3 },
  { label: "Confirm", from: 4, to: 5 },
  { label: "Confirmed", from: 6, to: 7 },
];

export function HomeProductFlow() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);
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

  useEffect(() => {
    if (still) {
      setStep(DONE_STEP);
      return;
    }
    if (!running) return;
    const id = window.setTimeout(
      () => setStep((s) => (s >= LAST_STEP ? 0 : s + 1)),
      DURATIONS[step],
    );
    return () => window.clearTimeout(id);
  }, [running, still, step]);

  useEffect(() => {
    if (step !== 1) {
      setTyped(step > 1 && step < 4 ? DOMAIN.length : step >= 4 ? 0 : 0);
      return;
    }
    setTyped(0);
    const id = window.setInterval(
      () => setTyped((t) => (t >= DOMAIN.length ? t : t + 1)),
      DOMAIN.length > 0 ? 70 : 0,
    );
    return () => window.clearInterval(id);
  }, [step]);

  const scene = step >= 4 && step <= 5 ? "confirm" : "workspace";
  const confirmed = step >= DONE_STEP;
  const activeStep = STEPS.findIndex((s) => step >= s.from && step <= s.to);

  return (
    <div ref={sectionRef}>
      <HomeSection className="relative overflow-hidden bg-navy">
        {/* One quiet mint bloom behind the window — the section's only glow. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[18%] left-1/2 h-[520px] w-[880px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[110px]"
          style={{ background: "radial-gradient(circle, #7eb8a4, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <HomeEyebrow onDark>How a record is made</HomeEyebrow>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.08] font-medium tracking-[-0.035em] text-white">
              Nobody writes their own record.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">
              You add the company you worked with. They get an email. Until they
              press confirm, the public page shows nothing.
            </p>
          </div>

          <div className="mt-10 hidden md:block">
            <Stage>
              <AppWindow
                scene={scene}
                step={step}
                typed={typed}
                confirmed={confirmed}
              />
            </Stage>
          </div>

          <div className="mt-8 md:hidden">
            <MobileFlow step={step} confirmed={confirmed} />
          </div>

          <ol className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                className="flex items-center gap-2 text-[12px] font-medium"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                    i === activeStep ? "bg-[#7eb8a4]" : "bg-white/25",
                  )}
                />
                <span
                  className={cn(
                    "transition-colors duration-500",
                    i === activeStep ? "text-white" : "text-white/40",
                  )}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </HomeSection>
    </div>
  );
}

/* ---------------------------------------------------------------- stage --- */

/**
 * The screen is written at its real size and shrunk whole, so every label
 * stays live text. `100cqw / 1280px` divides a length by a length — Chromium
 * computes it; the observer below covers browsers that do not.
 */
function Stage({ children }: { children: ReactNode }) {
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
    <div ref={ref} className="w-full [container-type:inline-size]">
      <div
        className="relative w-full overflow-hidden rounded-[20px] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.55)]"
        style={{ aspectRatio: `${DESIGN_W} / ${DESIGN_H}` }}
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
  typed,
  confirmed,
}: {
  scene: "workspace" | "confirm";
  step: number;
  typed: number;
  confirmed: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      <Pane show={scene === "workspace"}>
        <WorkspaceScene step={step} typed={typed} confirmed={confirmed} />
      </Pane>
      <Pane show={scene === "confirm"}>
        <ConfirmScene step={step} />
      </Pane>
    </div>
  );
}

function Pane({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "absolute inset-0 transition-[opacity,transform] duration-500 ease-out",
        show
          ? "opacity-100 translate-y-0"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------- workspace --- */

function WorkspaceScene({
  step,
  typed,
  confirmed,
}: {
  step: number;
  typed: number;
  confirmed: boolean;
}) {
  const found = step >= 2;
  const requested = step >= 3;

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy text-[10px] font-semibold text-white">
          NS
        </div>
        <span className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
          Nordform Studio
        </span>
        <span className="h-3.5 w-px bg-line" />
        <span className="text-[13px] text-muted">Partners</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[420px] shrink-0 border-r border-line bg-paper px-6 py-6">
          <h3 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Find a company
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Claimed firms only — they accept to become official.
          </p>

          <div className="mt-4 flex h-11 items-center rounded-xl border border-line bg-surface px-3.5">
            {typed > 0 ? (
              <span className="text-[14px] text-ink">
                {DOMAIN.slice(0, typed)}
              </span>
            ) : (
              <span className="text-[14px] text-muted">
                Search registered companies
              </span>
            )}
            <span
              className={cn(
                "ml-px h-[18px] w-px bg-ink transition-opacity",
                step === 1 ? "animate-pulse opacity-100" : "opacity-0",
              )}
            />
          </div>

          <div
            className={cn(
              "mt-3 transition-[opacity,transform] duration-500 ease-out",
              found ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
            )}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3.5">
              <Initials value="BE" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
                    Bramble Engineering
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.12em] text-success uppercase">
                    Verified
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted">
                  Software development · Berlin
                </p>
              </div>
              <RequestPill
                state={confirmed ? "official" : requested ? "pending" : "idle"}
              />
            </div>
          </div>

          <div
            className={cn(
              "mt-6 transition-opacity duration-700",
              confirmed ? "opacity-100" : "opacity-0",
            )}
          >
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              Partners
            </p>
            <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3">
              <Initials value="BE" small />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink">
                  Bramble Engineering
                </p>
                <p className="text-[11px] text-muted">
                  Confirmed by both companies
                </p>
              </div>
              <CheckMark />
            </div>
          </div>
        </aside>

        <section className="relative min-w-0 flex-1 bg-surface">
          <div className="flex items-center gap-2 border-b border-line/80 px-4 py-2.5">
            <p className="text-[13px] font-semibold tracking-[-0.02em] text-ink">
              Network
            </p>
            <p className="text-[11px] text-muted">
              1 company{confirmed ? " · 1 partner" : ""}
            </p>
          </div>

          <div className="relative h-[calc(100%-42px)] w-full overflow-hidden bg-[#fbfcfb]">
            <Grid />

            <svg
              className="absolute inset-0 h-full w-full"
              aria-hidden
              fill="none"
            >
              <path
                d="M 300 300 C 400 300, 420 268, 520 268"
                stroke={confirmed ? "#1a5c51" : "#9aa5a0"}
                strokeWidth={confirmed ? 2 : 1.5}
                strokeDasharray={confirmed ? "0" : "5 5"}
                className={cn(
                  "transition-opacity duration-500",
                  requested ? "opacity-100" : "opacity-0",
                )}
              />
            </svg>

            <MapNode x={148} y={262} initials="NS" name="Nordform Studio" role="Company" hub />

            <div
              className={cn(
                "absolute transition-[opacity,transform] duration-700 ease-out",
                requested
                  ? "translate-x-0 translate-y-0 opacity-100"
                  : "translate-x-4 -translate-y-1 opacity-0",
              )}
              style={{ left: 520, top: 230 }}
            >
              <NodeCard
                initials="BE"
                name="Bramble Engineering"
                role={confirmed ? "Partner" : "Pending"}
                pending={!confirmed}
                confirmed={confirmed}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- confirm --- */

function ConfirmScene({ step }: { step: number }) {
  const pressed = step >= 5;

  return (
    <div className="flex h-full w-full flex-col bg-[#f7f8fa]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <div className="ml-3 flex h-7 flex-1 items-center rounded-lg bg-paper px-3 text-[12px] text-muted">
          hansala.com/confirm/…
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center px-10">
        <div className="w-[560px] rounded-[24px] border border-line/80 bg-surface px-7 py-7 shadow-[0_12px_36px_rgba(8,20,18,0.05)]">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Partner confirmation
          </p>
          <h2 className="mt-2 font-display text-[26px] leading-[1.15] font-medium tracking-[-0.035em] text-ink">
            Nordform Studio says they worked with you.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Confirm as{" "}
            <span className="font-semibold text-ink">Bramble Engineering</span>{" "}
            that this partnership is real. Nothing is public until you do.
          </p>

          <div
            className={cn(
              "mt-6 flex h-11 items-center justify-center rounded-xl text-[14px] font-semibold transition-all duration-300",
              pressed
                ? "scale-[0.985] bg-[#1a5c51] text-white"
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
          <div className="mt-2 flex h-11 items-center justify-center rounded-xl border border-line text-[14px] font-semibold text-ink-soft">
            Decline
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- parts --- */

function Grid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.5]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #dfe4e1 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}

function MapNode({
  x,
  y,
  initials,
  name,
  role,
  hub,
}: {
  x: number;
  y: number;
  initials: string;
  name: string;
  role: string;
  hub?: boolean;
}) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <NodeCard initials={initials} name={name} role={role} hub={hub} />
    </div>
  );
}

function NodeCard({
  initials,
  name,
  role,
  hub,
  pending,
  confirmed,
}: {
  initials: string;
  name: string;
  role: string;
  hub?: boolean;
  pending?: boolean;
  confirmed?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative bg-surface px-3 py-2.5",
        hub
          ? "w-[164px] rounded-2xl border border-navy/20 ring-1 ring-navy/[0.06]"
          : "w-[150px] rounded-xl border",
        pending ? "border-dashed border-line" : "border-line/90",
        "shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_4px_14px_rgba(8,20,18,0.04)]",
      )}
    >
      {confirmed ? (
        <span className="absolute -top-1.5 -right-1.5">
          <CheckMark />
        </span>
      ) : null}
      <div className="flex items-center gap-2.5">
        <Initials value={initials} small />
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

function Initials({ value, small }: { value: string; small?: boolean }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl border border-line bg-paper font-semibold text-ink-soft",
        small ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-[10px]",
      )}
    >
      {value}
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
      body: "Bramble Engineering",
      meta: "Software development · Berlin",
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
      body: "Bramble Engineering",
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
