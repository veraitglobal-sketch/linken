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
