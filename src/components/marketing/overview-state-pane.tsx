import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function OverviewStatePane({
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
            "text-[11px] font-semibold tracking-[0.14em] uppercase",
            active ? "text-blue" : "text-plus",
          )}
        >
          {mono}
        </p>
      </div>
      <div className="mt-8 min-h-[13rem]">{children}</div>
      <p className="mt-6 max-w-[34ch] text-[14px] leading-relaxed text-muted">
        {body}
      </p>
    </div>
  );
}

export function OverviewRedactionBars() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-3.5 w-[72%] rounded-sm bg-ink/15" />
      <div className="h-3.5 w-[48%] rounded-sm bg-ink/10" />
      <div className="h-3.5 w-[60%] rounded-sm bg-ink/[0.07]" />
      <div className="mt-6 flex items-center gap-2">
        <span className="size-2 rounded-full bg-ink/20" />
        <span className="h-2.5 w-24 rounded-sm bg-ink/10" />
      </div>
    </div>
  );
}
