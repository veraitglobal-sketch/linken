import { HOW_IT_WORKS, PRODUCT } from "@/lib/product-model";
import { cn } from "@/lib/cn";

type Props = {
  compact?: boolean;
  className?: string;
};

export function HowLinkenWorks({ compact = false, className }: Props) {
  if (compact) {
    return (
      <p className={cn("text-[13px] leading-relaxed text-muted", className)}>
        <span className="font-semibold text-ink">{PRODUCT.oneLiner}</span>
      </p>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-surface px-5 py-5 sm:px-6",
        className,
      )}
    >
      <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
        How it works
      </p>
      <p className="mt-1.5 max-w-xl text-[14px] font-semibold tracking-[-0.02em] text-ink">
        {PRODUCT.oneLiner}
      </p>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {HOW_IT_WORKS.map((s) => (
          <li
            key={s.n}
            className="rounded-xl border border-line bg-paper/50 px-3.5 py-3.5"
          >
            <p className="text-[13px] font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
