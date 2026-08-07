import type { ReactNode } from "react";

type Props = {
  title: string;
  summary?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Charts need a text alternative (WCAG 1.1.1).
 * Visual chart stays decorative to AT; summary is announced.
 */
export function AccessibleChart({ title, summary, children, className }: Props) {
  return (
    <figure className={className} role="group" aria-label={title}>
      <p className="sr-only">{summary ?? title}</p>
      <div aria-hidden="true" className="h-full w-full">
        {children}
      </div>
    </figure>
  );
}
