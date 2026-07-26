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

/** Quiet page frame: title, description, primary action, airy content. */
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
        "mx-auto w-full px-5 py-8 sm:px-8",
        wide ? "max-w-6xl" : "max-w-3xl",
        className,
      )}
    >
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-display text-[clamp(1.35rem,2.2vw,1.65rem)] font-medium tracking-[-0.04em] text-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-soft">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
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
        "rounded-[20px] border border-line/80 bg-surface shadow-[0_10px_30px_rgba(8,20,18,0.04)]",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
