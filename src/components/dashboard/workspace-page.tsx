import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  wide?: boolean;
};

/** Quiet page frame — display title, air, premium surface cards. */
export function WorkspacePage({
  title,
  description,
  action,
  children,
  className,
  wide,
}: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 py-9 sm:px-8 sm:py-10",
        wide ? "max-w-6xl" : "max-w-3xl",
        className,
      )}
    >
      <header className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-line/50 pb-6">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-[clamp(1.55rem,2.4vw,1.9rem)] font-medium tracking-[-0.045em] text-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-ink-soft">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 pb-0.5">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function WorkspaceCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-line/70 bg-surface shadow-[0_14px_40px_rgba(8,20,18,0.045)]",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
