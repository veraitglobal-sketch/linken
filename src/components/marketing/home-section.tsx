import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared marketing section chrome — paper / mute band rhythm. */
export function HomeSection({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "mute" | "tight";
}) {
  return (
    <section
      className={cn(
        "px-6 sm:px-8 lg:px-10",
        tone === "default" && "py-20 sm:py-28",
        tone === "mute" && "border-y border-line/60 bg-mute py-20 sm:py-28",
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
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold tracking-[0.16em] uppercase",
        onDark ? "text-blue-soft" : "text-blue",
        className,
      )}
    >
      {children}
    </p>
  );
}
