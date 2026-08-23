import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared Home surface — the board's quiet tier.
 *
 * White, on a canvas that is not.
 *
 * Every box on this board was white on a white page, so nothing led and nothing
 * receded. The first fix tinted these panels and left the page white; measured,
 * #f0f2f0 on #ffffff is a six per cent step and it did not read at all.
 *
 * The tint moved to the canvas instead — see `workspace-shell.tsx` — and these
 * went back to white. Same two values, opposite assignment, and now the panel
 * is an object sitting on a ground rather than a slightly duller rectangle.
 *
 * `muted` keeps its dashed treatment for genuinely empty panels, at 60% so an
 * empty one reads as lighter than a full one rather than merely dashed.
 */
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
        "flex h-full flex-col rounded-tile px-5 py-5",
        muted
          ? "border border-dashed border-line bg-surface/60"
          : "border border-line bg-surface",
        className,
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        {/* `--plus`, not `--muted`. On the new `--mute` ground muted measures
            4.56:1 against the 4.5 an 11px label needs — passing by six
            hundredths, which is not a margin. `--plus` gives 5.06 and is the
            token documented for exactly this. */}
        <h2 className="text-[11px] font-semibold tracking-[0.16em] text-plus uppercase">
          {label}
        </h2>
        {meta ? (
          <div className="text-[12px] font-semibold tabular-nums text-plus">
            {meta}
          </div>
        ) : null}
      </header>
      <div className="mt-3 min-w-0 flex-1">{children}</div>
    </section>
  );
}
