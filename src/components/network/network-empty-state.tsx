import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  emptyHref?: string;
  emptyLabel?: string;
  className?: string;
};

/** Premium empty network — composed center, not dashed junk cards. */
export function NetworkEmptyState({
  emptyHref = "/dashboard/structure",
  emptyLabel = "Add subsidiary",
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
          Start your network
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Add a firm, then drag between nodes to connect ownership or partners.
        </p>
      </div>

      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href={emptyHref}
          className="inline-flex h-10 items-center rounded-2xl bg-navy px-4 text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(8,20,18,0.14)] transition-colors hover:bg-accent-hover"
        >
          {emptyLabel}
        </Link>
        <Link
          href="/dashboard/group"
          className="inline-flex h-10 items-center rounded-2xl border border-white/80 bg-white/80 px-4 text-[12px] font-semibold text-ink shadow-[0_8px_20px_rgba(8,20,18,0.05)] backdrop-blur-md transition-colors hover:bg-white"
        >
          Set up group
        </Link>
      </div>
    </div>
  );
}
