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
        pending ? "border-dashed border-line" : "border-line",
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
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
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
        state === "pending" && "border border-line bg-paper text-muted",
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
