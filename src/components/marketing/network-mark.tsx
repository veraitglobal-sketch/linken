type Props = {
  size?: number;
  className?: string;
  /** Site header keeps the slow orbit; embeds stay static. */
  animate?: boolean;
};

/** Two nodes + a link — Hansala's mark, not an orbit logo. */
export function NetworkMark({ size = 54, className, animate = true }: Props) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
    >
      <g
        className={animate ? "link-pulse" : undefined}
        style={{ transformOrigin: "24px 24px" }}
      >
        <line
          x1="14"
          y1="24"
          x2="34"
          y2="24"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="24" r="5" fill="currentColor" />
        <circle cx="36" cy="24" r="5" fill="currentColor" />
      </g>
    </svg>
  );
}
