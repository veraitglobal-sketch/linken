import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared Home surface — same radius, padding, and eyebrow on every panel. */
export function HomePanel({
  label,
  meta,
  children,
  className,
  muted,
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex h-full flex-col rounded-tile border border-line px-5 py-5",
        muted ? "border-dashed bg-paper" : "bg-surface",
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          {label}
        </h2>
        {meta ? (
          <div className="text-[12px] font-semibold tabular-nums text-muted">
            {meta}
          </div>
        ) : null}
      </header>
      <div className="mt-3 min-w-0 flex-1">{children}</div>
    </section>
  );
}
