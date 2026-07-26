import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Shared title block for confirm / invite pages. */
export function ConfirmPage({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="mx-auto w-full max-w-xl">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-[-0.04em] text-ink">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{subtitle}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
