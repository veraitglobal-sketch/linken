import Image from "next/image";
import { cn } from "@/lib/cn";

export function FlowGlyph({ d }: { d: string }) {
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

export function FlowMark({
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

export function FlowCheckMark({ onDark }: { onDark?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full",
        onDark ? "bg-white/20" : "bg-blue-soft",
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

export function FlowNodeCard({
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
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative bg-surface px-3 py-2.5",
        hub ? "w-[164px] rounded-tile border border-navy/20" : "w-[150px] rounded-tile border",
        /* Same warm hue as the pill, so a reader learns the state once rather
           than twice. Dashed stays — it is what says "not settled yet"; the
           colour only tells you which kind of unsettled. */
        pending ? "border-dashed border-ember/45" : "border-line",
        active && "border-blue/40 shadow-card",
      )}
    >
      {confirmed ? (
        <span className="absolute -top-1.5 -right-1.5">
          <FlowCheckMark />
        </span>
      ) : null}
      <div className="flex items-center gap-2.5">
        <FlowMark name={name} initials={initials} logo={logo} small />
        <div className="min-w-0">
          <p className="truncate font-display text-[12px] font-medium tracking-[-0.03em] text-ink">
            {name}
          </p>
          <p
            className={cn(
              "mt-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase",
              pending ? "text-ember-deep" : "text-muted",
            )}
          >
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FlowRequestPill({
  state,
}: {
  state: "idle" | "pending" | "official";
}) {
  const label =
    state === "official"
      ? "Official"
      : state === "pending"
        ? "Pending"
        : "Request";
  return (
    <span
      className={cn(
        "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-500",
        state === "idle" && "bg-navy text-white",
        /* Warm, because it is waiting on somebody. The three states are the
           product in miniature — asked, waiting, confirmed — and this middle
           one, the one that depends on the other side, was the only one with no
           colour at all: grey text on grey paper, indistinguishable from a
           disabled control.
           `text-ember-deep` rather than `text-ember`: at 11px this needs 4.5:1
           and the lighter value gives 3.1. The fill and the border keep the
           lighter one, where the check does not apply. */
        state === "pending" &&
          "border border-ember/40 bg-ember/10 text-ember-deep",
        state === "official" &&
          "border border-blue/25 bg-accent-soft text-blue",
      )}
    >
      {label}
    </span>
  );
}

export function FlowGrid() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--line) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 45%, transparent 40%, rgba(255,255,255,0.92) 100%)",
        }}
      />
    </>
  );
}
