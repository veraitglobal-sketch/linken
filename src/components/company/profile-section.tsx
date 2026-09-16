import type { ReactNode } from "react";

/**
 * One section of a company profile, in one shape.
 *
 * The profile used to be assembled from sections drawn in four different
 * eras — square outlined boxes, orange micro-labels, a gradient header, a
 * marketing headline at 44px. This is the single chrome they all sit in now:
 * a white card, an icon chip, a plain title, one line of what the section is,
 * and the action on the right.
 */
export function ProfileSection({
  id,
  icon,
  title,
  description,
  action,
  children,
  compact = false,
}: {
  id?: string;
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  /** Rail cards: tighter padding, smaller title. */
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-[24px] bg-surface ring-1 ring-line/70 ${compact ? "p-4 sm:p-5" : "p-5 sm:p-7"}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className={`grid shrink-0 place-items-center rounded-full bg-lime-soft text-navy ${compact ? "size-8" : "size-9"}`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2
              className={`font-display leading-tight font-semibold tracking-[-0.03em] text-ink ${compact ? "text-[16px]" : "text-[20px]"}`}
            >
              {title}
            </h2>
            {description ? (
              <p className={`mt-1 leading-relaxed text-muted ${compact ? "text-[13px]" : "text-[14px]"}`}>
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children ? <div className={compact ? "mt-4" : "mt-5"}>{children}</div> : null}
    </section>
  );
}

const ICON = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const ProfileIcons = {
  overview: (
    <svg {...ICON}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" />
      <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" />
    </svg>
  ),
  team: (
    <svg {...ICON}>
      <circle cx="6" cy="5.5" r="2.2" />
      <path d="M2.5 13c.4-2.2 1.8-3.4 3.5-3.4s3.1 1.2 3.5 3.4" />
      <circle cx="11.3" cy="6.2" r="1.7" />
      <path d="M10.6 9.8c1.6.1 2.6 1.2 2.9 3.2" />
    </svg>
  ),
  references: (
    <svg {...ICON}>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  ),
  providers: (
    <svg {...ICON}>
      <path d="M2.5 13.5v-7l5.5-4 5.5 4v7" />
      <path d="M6 13.5v-4h4v4" />
    </svg>
  ),
  highlights: (
    <svg {...ICON}>
      <path d="m8 2.5 1.7 3.5 3.8.5-2.8 2.6.7 3.8L8 11.1l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5Z" />
    </svg>
  ),
  cases: (
    <svg {...ICON}>
      <path d="M4 2.5h5l3 3v8H4z" />
      <path d="M9 2.5v3h3M6 9h4M6 11.5h4" />
    </svg>
  ),
  testimonials: (
    <svg {...ICON}>
      <path d="M3 4.5h10v6.5H7.5L4.5 13.5v-2.5H3z" />
    </svg>
  ),
  partners: (
    <svg {...ICON}>
      <circle cx="3.8" cy="8" r="2" />
      <circle cx="12.2" cy="8" r="2" />
      <path d="M5.8 8h4.4" />
    </svg>
  ),
  level: (
    <svg {...ICON}>
      <path d="M8 2.2 13 4v3.8c0 3-2.1 5.1-5 6-2.9-.9-5-3-5-6V4l5-1.8Z" />
      <path d="m5.8 8 1.6 1.6 2.9-3" />
    </svg>
  ),
} as const;
