type Props = {
  title?: string;
  size?: number;
  className?: string;
};

/** Instagram/Facebook-style verified checkmark — recognizable at a glance, no label needed. */
export function VerifiedBadge({ title, size = 20, className }: Props) {
  return (
    <span title={title} className={className}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Verified">
        <path
          d="M12 2.5l2.4 1.2 2.66-.4 1.34 2.33 2.33 1.34-.4 2.66 1.2 2.4-1.2 2.4.4 2.66-2.33 1.34-1.34 2.33-2.66-.4L12 21.5l-2.4-1.2-2.66.4-1.34-2.33-2.33-1.34.4-2.66-1.2-2.4 1.2-2.4-.4-2.66 2.33-1.34L6.94 3.3l2.66.4L12 2.5z"
          fill="#7eb8a4"
        />
        <path
          d="M8.2 12.3l2.4 2.4 5.2-5.2"
          stroke="#0e1f1c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
