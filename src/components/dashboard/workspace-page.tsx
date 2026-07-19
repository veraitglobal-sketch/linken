import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Wider content for data-heavy pages */
  wide?: boolean;
};

/** Retell-like page frame: title, quiet description, primary action, airy content. */
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
        "mx-auto w-full px-5 py-7 sm:px-8",
        wide ? "max-w-6xl" : "max-w-4xl",
        className,
      )}
    >
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748b]">
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
        "rounded-xl border border-[#e8eaee] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
