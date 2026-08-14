"use client";

import { useEffect, useRef, useState } from "react";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import { EmbedTestimonialThemeShell } from "@/components/embed/embed-testimonial-theme-shell";
import { PRESET_TOKENS } from "@/features/testimonials/theme/presets";
import type { PublicTestimonial } from "@/features/testimonials/types";
import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";

/**
 * "The record" — the distribution story in one composition.
 *
 * Three planes, after the reference the owner picked: a dimmed back card
 * carrying the mark, a sharp window in front of it, and a rail on the right.
 * The window runs three beats — take the code, paste it, see the testimonial
 * land on a site.
 *
 * The quote is real and owner-supplied. It is reproduced verbatim: the
 * database forbids editing author text (`lock_testimonial_author_fields`) and
 * a marketing page has no more licence than the database does.
 */

/* The real widget, given the real record — not a drawing of it. What the page
   shows is byte-for-byte what a customer's site renders, so the two can never
   drift. `provenanceLine` is left empty rather than invented; the card omits
   the line when there is nothing true to put in it. */
const TESTIMONIAL: PublicTestimonial = {
  id: "vera-dienstemarkt",
  body: "vera quickly understood our vision for dienstemarkt.de and turned it into a professional, high-quality platform. The collaboration was smooth, reliable, and solution-focused from start to finish.",
  authorName: "Jovica Mihajlovic",
  authorRole: "CEO",
  authorCompany: null,
  source: "partnership",
  publishedAt: "",
  profileUrl: "/c/verait",
  provenanceLine: "",
};

const SNIPPET = [
  ["GET", " /api/v1/companies/verait/testimonials"],
  ["", ""],
  ["<iframe", ' src="hansala.com/embed/verait?variant=testimonials"'],
  ["", "  height=\"320\" style=\"border:0;width:100%\"></iframe>"],
] as const;

const BEATS = [
  { key: "code", label: "Take the code", note: "One endpoint, or one iframe." },
  { key: "paste", label: "Paste it once", note: "Anywhere on your own page." },
  { key: "live", label: "It renders", note: "Confirmed records, kept current." },
] as const;

const DURATIONS = [2600, 2000, 4200];

export function RecordStage() {
  const [beat, setBeat] = useState(0);
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
    const io = new IntersectionObserver(([e]) => setOnScreen(!!e?.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Derived, never written from an effect — reduced motion holds the payoff. */
  const active = still ? 2 : beat;

  useEffect(() => {
    if (still || !onScreen) return;
    const id = window.setTimeout(
      () => setBeat((b) => (b + 1) % 3),
      DURATIONS[beat],
    );
    return () => window.clearTimeout(id);
  }, [beat, still, onScreen]);

  return (
    <div ref={ref} className="relative grid gap-10 lg:grid-cols-[1.34fr_0.66fr] lg:gap-14">
      <div className="relative min-h-[430px]">
        {/* Back plane — dimmed, half covered, carrying the mark at its corner. */}
        <div className="stage-falloff absolute inset-y-6 left-0 hidden w-[62%] overflow-hidden rounded-chapter bg-mute sm:block">
          <span
            aria-hidden
            className="orb -top-16 -left-10 h-[240px] w-[300px] bg-signal/10"
          />
          <p className="absolute bottom-7 left-8 font-display text-[1.6rem] font-medium tracking-[-0.03em] text-ink/15">
            Your profile
          </p>
        </div>
        <span className="absolute -top-3 left-5 z-20 hidden rounded-card bg-surface p-3 shadow-card sm:block">
          <NetworkMark size={26} animate={false} />
        </span>

        {/* Front plane — the only sharp thing in the composition. */}
        <div className="relative z-10 ml-0 overflow-hidden rounded-chapter bg-surface shadow-chapter ring-1 ring-ink/[0.06] sm:ml-[16%]">
          <div className="flex items-center gap-2 border-b border-line/70 px-4 py-2.5">
            <span className="size-[6px] rounded-full bg-ink/10" />
            <span className="size-[6px] rounded-full bg-ink/10" />
            <span className="ml-1.5 text-[10px] text-muted">
              {active === 2 ? "verait.de" : "hansala.com"}
            </span>
            <span className="ml-auto text-[9.5px] font-semibold tracking-[0.14em] text-plus uppercase">
              {BEATS[active]!.label}
            </span>
          </div>

          <div className="relative min-h-[330px] p-5 sm:p-6">
            <Beat show={active === 0}>
              <pre className="overflow-hidden rounded-card bg-navy px-4 py-4 text-[11px] leading-[1.85]">
                <code>
                  {SNIPPET.map(([k, v], i) => (
                    <div key={i}>
                      <span className="text-blue-soft">{k}</span>
                      <span className="text-white/70">{v}</span>
                    </div>
                  ))}
                </code>
              </pre>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-mute px-3 py-1.5 text-[11px] font-medium text-ink-soft">
                <kbd className="font-sans text-[10px] tracking-wide">⌘C</kbd>
                Copy
              </p>
            </Beat>

            <Beat show={active === 1}>
              <div className="rounded-card border border-dashed border-line px-4 py-8 text-center">
                <p className="text-[12px] text-muted">Pasted into your page</p>
                <p className="mt-2 truncate font-mono text-[11px] text-ink-soft">
                  &lt;iframe src=&quot;hansala.com/embed/verait…&quot;&gt;
                </p>
              </div>
            </Beat>

            <Beat show={active === 2}>
              <EmbedTestimonialThemeShell theme={PRESET_TOKENS.card}>
                <EmbedTestimonialCard
                  item={TESTIMONIAL}
                  profileUrl={TESTIMONIAL.profileUrl}
                />
              </EmbedTestimonialThemeShell>
            </Beat>
          </div>
        </div>
      </div>

      {/* Right rail — the statement, then the beats as a register. */}
      <div className="flex flex-col justify-center">
        <p className="max-w-[30ch] text-lead text-on-navy-soft">
          Pending stays private. Confirmed becomes one fact on both sides —
          profile, embed, and API.
        </p>
        <ol className="mt-8 border-t border-white/12">
          {BEATS.map((b, i) => (
            <li key={b.key} className="border-b border-white/12 py-3.5">
              <div className="flex items-baseline gap-3">
                <span
                  className={cn(
                    "text-[11px] font-semibold tabular-nums transition-colors duration-500",
                    i === active ? "text-blue-soft" : "text-on-navy-muted/50",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[13px] font-semibold transition-colors duration-500",
                      i === active ? "text-on-navy" : "text-on-navy-muted",
                    )}
                  >
                    {b.label}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-snug text-on-navy-muted">
                    {b.note}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Beat({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        show
          ? "opacity-100 translate-y-0"
          : "pointer-events-none absolute inset-5 translate-y-1.5 opacity-0 sm:inset-6",
      )}
    >
      {children}
    </div>
  );
}
