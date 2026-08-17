import Link from "next/link";
import { cn } from "@/lib/cn";
import { PRODUCT } from "@/lib/product-model";

type Props = {
  emptyHref?: string;
  emptyLabel?: string;
  className?: string;
};

/** Premium empty network — partners are added on Company, not here. */
export function NetworkEmptyState({
  emptyHref = "/dashboard/partners",
  emptyLabel = "Add partners on Company",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "linken-flow-stage relative flex flex-col items-center justify-center px-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(14,31,28,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 55% 50% at 50% 48%, black 20%, transparent 72%)",
        }}
      />

      <div className="relative max-w-sm text-center">
        <p className="font-display text-[22px] font-semibold tracking-[-0.04em] text-ink">
          {PRODUCT.map.label}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Confirmed partners and proof show here automatically. Add them on{" "}
          {PRODUCT.company.label}.
        </p>
      </div>

      <div className="relative mt-7">
        <Link
          href={emptyHref}
          className="inline-flex h-10 items-center rounded-full bg-navy px-4 text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          {emptyLabel}
        </Link>
      </div>
    </div>
  );
}
