import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared marketing section chrome — paper / mute band rhythm. */
export function HomeSection({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "mute" | "tight";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-6 sm:px-8 lg:px-10",
        id && "scroll-mt-20",
        tone === "default" && "py-20 sm:py-28",
        tone === "mute" && "bg-mute py-20 sm:py-28",
        tone === "tight" && "pb-20 sm:pb-28",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function HomeEyebrow({
  children,
  className,
  onDark,
  mark = true,
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
  /** The lead-in mark. Off where a section already carries the full one. */
  mark?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-label inline-flex items-center text-[11px] font-semibold tracking-[0.16em] uppercase",
        onDark ? "text-blue-soft" : "text-blue",
        className,
      )}
    >
      {/* The mark in miniature: a node, then the link leaving it.
          Hansala's mark is two nodes joined by a line, and the hero prints it
          whole. Thirteen other sections opened on bare uppercase text with no
          anchor of any kind — AGENTS.md asks every section for one visual
          anchor that carries meaning, and this is the smallest one that means
          something rather than decorating.
          Two values of the one green, which is also the only place mint appears
          in most of these sections: the node is mint, the link is the deep
          value, exactly as the palette says — deep on paper, mint on navy.
          `aria-hidden` and drawn with elements rather than a glyph: it is a
          rule, not a character, and a screen reader should read the label. */}
      {mark ? (
        <span aria-hidden className="mr-2.5 flex shrink-0 items-center gap-1">
          <span
            className={cn(
              "block h-[5px] w-[5px] rounded-full",
              onDark ? "bg-blue-soft" : "bg-blue-soft",
            )}
          />
          <span
            className={cn(
              "block h-px w-3.5",
              onDark ? "bg-blue-soft/45" : "bg-blue/45",
            )}
          />
        </span>
      ) : null}
      {children}
    </p>
  );
}

/** The one coloured phrase in a headline — deep green on light, mint on dark. */
export function Accent({
  children,
  onDark,
}: {
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <span className={onDark ? "text-blue-soft" : "text-blue"}>{children}</span>
  );
}

/**
 * Centred section opening — eyebrow, headline, one line beneath.
 * The homepage's sections open this way now, the way Thrivea's do; the
 * split headline-left / paragraph-right block is kept for pages that use it.
 */
export function HomeHeading({
  eyebrow,
  title,
  lead,
  onDark,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-col items-center text-center",
        className,
      )}
    >
      {eyebrow ? <HomeEyebrow onDark={onDark}>{eyebrow}</HomeEyebrow> : null}
      <h2
        className={cn(
          "reveal font-display text-chapter text-balance",
          Boolean(eyebrow) && "mt-5",
          onDark ? "text-on-navy" : "text-ink",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-4 max-w-[52ch] text-[15.5px] leading-relaxed",
            onDark ? "text-on-navy" : "text-ink-soft",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Homepage band — the reference layout's section shell: 18px side inset (so
 * dark chapters sit almost edge to edge) and 75px of vertical rhythm.
 */
export function HomeBand({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 px-4 py-14 sm:px-[18px] sm:py-[75px]", className)}
    >
      {children}
    </section>
  );
}

/** Homepage section headline — 48px, semibold, centred. */
export function HomeTitle({
  children,
  className,
  onDark,
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <h2
      className={cn(
        "font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance",
        onDark ? "text-on-navy" : "text-ink",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Arrow-led pill button used across the homepage. */
export function HomePill({
  href,
  children,
  tone = "navy",
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "navy" | "mint" | "outline" | "white";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-5 text-[16px] font-semibold no-underline transition-colors duration-200",
        tone === "navy" && "bg-navy text-on-navy hover:bg-navy-deep",
        tone === "mint" && "bg-lime text-navy hover:bg-[#bfe56c]",
        tone === "outline" && "border border-ink text-ink hover:bg-white/50",
        tone === "white" && "bg-white text-ink hover:bg-mute",
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </a>
  );
}

/**
 * WORK IN PROGRESS — an empty, labelled slot where a visual is still to be
 * made. Marks the size and position only. Must be replaced before this page
 * ships: AGENTS.md forbids a placeholder reaching a visitor.
 */
export function VisualSlot({
  label,
  className,
  onDark,
}: {
  label: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid w-full place-items-center rounded-2xl border-2 border-dashed",
        onDark ? "border-white/25 text-on-navy-muted" : "border-ink/20 text-ink/45",
        className,
      )}
    >
      <span className="flex flex-col items-center gap-1.5 px-4 text-center">
        <span className="text-[11px] font-semibold tracking-[0.16em] uppercase">
          Visual
        </span>
        <span className="text-[13px]">{label}</span>
      </span>
    </div>
  );
}
