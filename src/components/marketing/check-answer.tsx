"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EmbedNetworkCard } from "@/components/embed/embed-network-card";
import { HostWindow } from "@/components/marketing/host-window";
import { cn } from "@/lib/cn";

const REDUCED = "(prefers-reduced-motion: reduce)";
const DWELL = 4600;

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * What a check returns — shown with the real embed, not a drawing of it.
 *
 * `EmbedNetworkCard` is the component a customer's own site renders. Feeding
 * it props here means the homepage and the widget can never drift, and the
 * visitor is looking at the product rather than a picture of it.
 *
 * The record is one the repo documents as real: Fade confirmed Vera IT.
 * True, and it travels — a booking app shipped worldwide reads to a US
 * audience in a way a German local marketplace does not. Which is exactly what
 * "we don't print logos we don't have" commits us to.
 *
 * The second state is `no_file`, set in mono the way a machine returns it.
 * AGENTS.md: absence is never "not verified", never a warning, and a new
 * company must be able to start. Both states sit in one fixed box, so nothing
 * resizes as they swap.
 */
export function CheckAnswer() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [confirmed, setConfirmed] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  /* Read through the store: syncing a media query into state inside an effect
     cascades a render and the linter rejects it. */
  const still = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!onScreen || still) return;
    const id = window.setInterval(() => setConfirmed((v) => !v), DWELL);
    return () => window.clearInterval(id);
  }, [onScreen, still]);

  const isConfirmed = still || confirmed;

  return (
    <div ref={ref} className="w-full lg:max-w-[24rem]">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
          A check returns
        </p>
        <span className="flex gap-1" aria-hidden>
          <span
            className={cn(
              "size-1.5 rounded-full transition-colors duration-500",
              isConfirmed ? "bg-blue" : "bg-line",
            )}
          />
          <span
            className={cn(
              "size-1.5 rounded-full transition-colors duration-500",
              isConfirmed ? "bg-line" : "bg-blue",
            )}
          />
        </span>
      </div>

      {/* Staged, not restyled: the chrome and elevation are ours, the record
          inside is the neutral widget a customer's site renders. Fixed height
          is the taller state, measured, so the swap never resizes. */}
      <HostWindow className="mt-4">
        <div className="relative h-[182px]">
          <State show={isConfirmed}>
            <EmbedNetworkCard
              name="Vera IT"
              confirmedCount={1}
              proofCompanies={[
                {
                  name: "Fade",
                  initials: "FD",
                  logoUrl: "/logos/showcase/fade.png",
                },
              ]}
              profileUrl="/c/verait"
            />
          </State>

          <State show={!isConfirmed}>
            <div className="rounded-[12px] border border-ink/[0.09] bg-white/95 px-4 py-3.5">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
                Confirmed network
              </p>
              <p className="mt-2 font-mono text-[22px] leading-none tracking-[-0.02em] text-ink">
                no_file
              </p>
              <p className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
                No confirmed record yet. Not a finding, and never a mark
                against anyone.
              </p>
            </div>
          </State>
        </div>
      </HostWindow>
    </div>
  );
}

function State({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-out",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {children}
    </div>
  );
}
