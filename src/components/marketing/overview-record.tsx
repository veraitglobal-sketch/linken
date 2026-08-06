"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { EmbedProofRow } from "@/components/embed/embed-brand";
import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { cn } from "@/lib/cn";

/**
 * The widgets are the product's own components, given data directly — not an
 * iframe to /embed/[slug]. The route needs a live company record; on a
 * marketing page that would mean the section renders a "not found" document
 * whenever the database is unreachable. Same code, no runtime dependency.
 */
const PARTNERS: EmbedProofCompany[] = [
  {
    name: "Dienstemarkt",
    initials: "DM",
    logoUrl: "/logos/showcase/dienstemarkt-mark.png",
  },
];

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
            body="Paste the line once, or read the same records from the API. Every partner who confirms on Hansala appears here — nobody edits the page again."
          >
            <ReleasedSite on={open} />
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
  body: ReactNode;
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
      {/* Both panes reserve the same block so the captions stay on one line. */}
      <div className="mt-8 min-h-[13rem]">{children}</div>
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

/**
 * Not an illustration of the result — the result itself. `EmbedProofRow` and
 * `EmbedVerifiedLockup` are the components a host site actually renders, so
 * what a visitor sees here cannot drift from what a customer gets.
 *
 * Data is passed in rather than fetched: a marketing page must never be able
 * to answer 404 because a record or a database is missing.
 */
function ReleasedSite({ on }: { on: boolean }) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out",
        on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
      )}
    >
      <div className="overflow-hidden rounded-xl bg-navy px-3.5 py-3">
        <code className="block truncate font-mono text-[10.5px] leading-5 text-white/75">
          <span className="text-[#8fc9b3]">&lt;iframe</span> src=
          &quot;hansala.com/embed/verait&quot;&gt;
        </code>
        <code className="block truncate font-mono text-[10.5px] leading-5 text-white/45">
          <span className="text-[#8fc9b3]">GET</span>{" "}
          /api/v1/companies/verait/partners
        </code>
      </div>

      <Arrow />

      {zoomed ? (
        <button
          type="button"
          aria-label="Close enlarged widget"
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-40 cursor-zoom-out bg-navy/45 backdrop-blur-[2px]"
        />
      ) : null}

      {/* One surface, two real widgets. Rendered from the product's own
          components with data passed in, so the frame is never empty and can
          never answer 404 — no route, no database, no network. */}
      <div
        className={cn(
          zoomed
            ? "fixed top-1/2 left-1/2 z-50 w-[min(760px,92vw)] -translate-x-1/2 -translate-y-1/2"
            : "relative",
        )}
      >
        <button
          type="button"
          aria-expanded={zoomed}
          aria-label={zoomed ? "Close enlarged widget" : "Enlarge the widget"}
          onClick={() => setZoomed((v) => !v)}
          className={cn(
            "block w-full overflow-hidden rounded-xl border border-ink/[0.08] bg-white text-left",
            zoomed
              ? "cursor-zoom-out shadow-[0_40px_90px_-20px_rgba(8,20,18,0.45)]"
              : "cursor-zoom-in shadow-[0_10px_28px_rgba(8,20,18,0.08)]",
          )}
        >
          <span className="flex items-center gap-2 border-b border-ink/[0.06] px-3.5 py-2">
            <span className="size-[6px] rounded-full bg-ink/10" />
            <span className="size-[6px] rounded-full bg-ink/10" />
            <span className="ml-1.5 text-[10px] text-muted">verait.de</span>
            <span className="ml-auto text-[9.5px] font-semibold tracking-[0.14em] text-plus uppercase">
              {zoomed ? "Close" : "Enlarge"}
            </span>
          </span>

          <span className="block px-4 pt-3.5 pb-4">
            <span className="block text-[9px] font-semibold tracking-[0.18em] text-plus uppercase">
              Partners
            </span>
            <span className="mt-2.5 block">
              <EmbedProofRow
                companies={PARTNERS}
                total={PARTNERS.length}
                theme="light"
              />
            </span>
            <span className="mt-3.5 block border-t border-ink/[0.07] pt-3">
              <EmbedVerifiedLockup size="sm" />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="my-2.5 flex justify-center" aria-hidden>
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
        <path
          d="M7 1v17m0 0 5-5m-5 5-5-5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink/25"
        />
      </svg>
    </div>
  );
}
