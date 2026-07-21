import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
};

export function GroupSection({ title, description, meta, action }: Props) {
  return (
    <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {meta ? (
          <p className="text-[12px] font-medium text-plus">{meta}</p>
        ) : null}
        {action}
      </div>
    </header>
  );
}
