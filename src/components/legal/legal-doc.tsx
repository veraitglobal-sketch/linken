import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
};

/** Lean legal / policy document shell. */
export function LegalDoc({ eyebrow, title, updated, children }: Props) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.85rem,4vw,2.6rem)] font-medium tracking-[-0.04em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[13px] text-muted">Last updated {updated}</p>
      <div className="prose-legal mt-10 space-y-6 text-[15px] leading-relaxed text-ink-soft [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-[-0.03em] [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:font-semibold [&_a]:text-ink [&_a]:underline-offset-2 hover:[&_a]:underline">
        {children}
      </div>
    </article>
  );
}
