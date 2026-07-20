import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChevronIcon } from "@/components/network/graph-panel-icons";

type PanelRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
  chevron?: boolean;
  accent?: boolean;
};

export function PanelRow({
  icon,
  title,
  description,
  onClick,
  href,
  chevron,
  accent,
}: PanelRowProps) {
  const className = cn(
    "group relative flex w-full items-start gap-3 rounded-2xl px-3 py-3.5 text-left transition-colors hover:bg-paper",
  );

  const body = (
    <>
      {accent ? (
        <span className="pointer-events-none absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-blue opacity-0 transition-opacity group-hover:opacity-100" />
      ) : null}
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-ink">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted">
          {description}
        </span>
      </span>
      {chevron ? (
        <span className="mt-1 text-plus">
          <ChevronIcon />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <li>
        <a href={href} className={className}>
          {body}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    </li>
  );
}
