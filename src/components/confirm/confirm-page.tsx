import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Tighter type + spacing for long decision forms. */
  compact?: boolean;
};

/** Shared title block for confirm / invite pages. */
export function ConfirmPage({
  eyebrow,
  title,
  subtitle,
  children,
  compact = false,
}: Props) {
  return (
    <section className={`mx-auto w-full ${compact ? "max-w-lg" : "max-w-xl"}`}>
      <p className="text-[10px] font-semibold tracking-[0.14em] text-ember uppercase">
        {eyebrow}
      </p>
      <h1
        className={
          compact
            ? "mt-2 font-display text-[clamp(1.35rem,3vw,1.65rem)] font-medium tracking-[-0.035em] text-ink"
            : "mt-3 font-display text-[clamp(1.55rem,3.5vw,2rem)] font-medium tracking-[-0.04em] text-ink"
        }
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={
            compact
              ? "mt-1.5 text-[13px] leading-relaxed text-ink-soft"
              : "mt-2 text-[14px] leading-relaxed text-ink-soft"
          }
        >
          {subtitle}
        </p>
      ) : null}
      <div className={compact ? "mt-5" : "mt-8"}>{children}</div>
    </section>
  );
}
