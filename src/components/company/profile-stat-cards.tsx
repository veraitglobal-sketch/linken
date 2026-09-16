import type { ReactNode } from "react";
import type { CompanyPosition } from "@/features/ranking/queries-position";
import type { TrustProfile } from "@/features/trust/queries";

type Stat = {
  key: string;
  icon: ReactNode;
  title: string;
  meta: string;
  value: string;
  href?: string;
};

/**
 * What this company can prove, as a row of small record cards.
 *
 * A card exists only for a fact that exists — no zero, no "N/A". Each one names
 * the fact, says where the number comes from, and gives the number; a visitor
 * can follow the card to the records behind it.
 */
export function ProfileStatCards({
  partners,
  clients,
  caseStudies,
  trust,
  position,
}: {
  partners: number;
  clients: number;
  caseStudies: number;
  trust: TrustProfile;
  position: CompanyPosition | null;
}) {
  const stats = [
    partners > 0
      ? {
          key: "partners",
          icon: <LinkIcon />,
          title: "Confirmed partners",
          meta: "Both sides said yes",
          value: String(partners),
          href: "#partners",
        }
      : null,
    clients > 0
      ? {
          key: "clients",
          icon: <CheckIcon />,
          title: "Confirmed clients",
          meta: "Each verified by the client",
          value: String(clients),
          href: "#references",
        }
      : null,
    position
      ? {
          key: "position",
          icon: <RankIcon />,
          title: "Sector position",
          meta: `${position.categoryName} · ${position.countryRank && position.countryName ? position.countryName : "worldwide"}`,
          value:
            position.countryRank && position.countryName
              ? `#${position.countryRank}`
              : position.worldRank
                ? `#${position.worldRank}`
                : "Ranked",
        }
      : null,
    trust.points > 0
      ? {
          key: "level",
          icon: <ShieldIcon />,
          title: "Hansala level",
          meta: `${trust.points} ${trust.points === 1 ? "point" : "points"} from confirmed evidence`,
          value: trust.level,
        }
      : null,
    caseStudies > 0
      ? {
          key: "cases",
          icon: <DocIcon />,
          title: "Case studies",
          meta: "Published with attribution",
          value: String(caseStudies),
          href: "#case-studies",
        }
      : null,
  ].filter(Boolean) as Stat[];

  if (stats.length === 0) return null;
  const shown = stats.slice(0, 4);
  /* Columns follow the facts: three cards fill the row in thirds rather than
     leaving a fourth, empty slot at the end. */
  const cols = shown.length >= 4 ? "lg:grid-cols-4" : shown.length === 3 ? "lg:grid-cols-3" : "";

  return (
    <ul className={`mt-3 grid list-none grid-cols-2 gap-3 p-0 ${cols}`}>
      {shown.map((stat) => {
        const body = (
          <>
            <span className="flex items-center gap-2.5">
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-lime-soft text-navy">
                {stat.icon}
              </span>
              <span className="text-[13.5px] leading-tight font-semibold text-ink sm:text-[14px]">{stat.title}</span>
            </span>
            <span className="mt-4 flex flex-col-reverse gap-1 sm:mt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
              <span className="text-[12px] leading-snug text-muted sm:text-[12.5px]">{stat.meta}</span>
              <span className="shrink-0 font-display text-[22px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums sm:text-[26px]">
                {stat.value}
              </span>
            </span>
          </>
        );
        const card =
          "flex h-full flex-col justify-between rounded-[20px] bg-surface p-3.5 ring-1 ring-line/70 sm:p-5";
        return (
          <li key={stat.key}>
            {stat.href ? (
              <a href={stat.href} className={`${card} transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(14,31,28,0.4)] hover:ring-ink/15`}>
                {body}
              </a>
            ) : (
              <div className={card}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const ICON = { width: 15, height: 15, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function LinkIcon() {
  return (
    <svg {...ICON}>
      <circle cx="3.8" cy="8" r="2" />
      <circle cx="12.2" cy="8" r="2" />
      <path d="M5.8 8h4.4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...ICON}>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg {...ICON}>
      <path d="M3 13V9M8 13V4M13 13V7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...ICON}>
      <path d="M8 2.2 13 4v3.8c0 3-2.1 5.1-5 6-2.9-.9-5-3-5-6V4l5-1.8Z" />
      <path d="m5.8 8 1.6 1.6 2.9-3" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg {...ICON}>
      <path d="M4 2.5h5l3 3v8H4z" />
      <path d="M9 2.5v3h3M6 9h4M6 11.5h4" />
    </svg>
  );
}
