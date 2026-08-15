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
