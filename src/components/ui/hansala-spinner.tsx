import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  className?: string;
  /** Accessible name; also used when `label` is shown. */
  label?: string;
  /** Show the label under the mark. */
  showLabel?: boolean;
};

/**
 * Hansala loading mark — two nodes confirm a link.
 * Not a spinning ring; the product’s own confirmation motion.
 */
export function HansalaSpinner({
  size = 44,
  className,
  label = "Loading",
  showLabel = false,
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("inline-flex flex-col items-center gap-3", className)}
    >
      <span
        className="hs-spinner-plate grid place-items-center rounded-[18px] bg-lime text-navy"
        style={{ width: size, height: size, borderRadius: Math.max(14, size * 0.36) }}
      >
        <svg
          width={Math.round(size * 0.55)}
          height={Math.round(size * 0.55)}
          viewBox="0 0 48 48"
          aria-hidden
          focusable="false"
        >
          <line
            className="hs-spinner-link"
            x1="14"
            y1="34"
            x2="34"
            y2="14"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            className="hs-spinner-node"
            cx="14"
            cy="34"
            r="5"
            fill="currentColor"
          />
          <circle
            className="hs-spinner-node hs-spinner-node-b"
            cx="34"
            cy="14"
            r="5"
            fill="currentColor"
          />
        </svg>
      </span>
      {showLabel ? (
        <p className="font-display text-[15px] font-medium tracking-[-0.02em] text-ink-soft">
          {label}
        </p>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
