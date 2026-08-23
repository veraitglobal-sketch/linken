import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  pendingOutgoing: number;
  pendingIncoming: number;
  confirmedRefs: number;
  confirmedPartners: number;
  caseCount: number;
  companySlug: string;
};

/**
 * The board's counters — two sides first, and nothing at all until there is
 * something to count.
 *
 * Two changes, both about what the numbers say rather than how they look.
 *
 * The row used to open on `0 · 0 · 0`. Three large zeros side by side are the
 * first thing a new owner sees, and an empty state that leads with the void
 * reads as failure where the screen means to invite. It renders nothing now
 * while every value is zero; the primary card and the checklist above it carry
 * that phase on their own, and the checklist simply moves up into the space.
 *
 * And "Pending" was `pendingOutgoing + pendingIncoming`. Those are the two
 * sides of the whole product — who is waiting on you, and who you are waiting
 * on — summed into one number that says neither. They are not the same fact:
 * one is a task you can finish today, the other is somebody else's turn. Only
 * one of them is yours to act on, and it is the one that gets the accent.
 */
export function HomeStatsRow({
  pendingOutgoing,
  pendingIncoming,
  confirmedRefs,
  confirmedPartners,
  caseCount,
  companySlug,
}: Props) {
  const confirmed = confirmedRefs + confirmedPartners;

  const items = [
    {
      label: "Waiting on you",
      value: pendingIncoming,
      href: "/dashboard/inbox",
      empty: "Nothing to answer",
      /* The one row that is a task rather than a status. Ember is the colour
         this project already uses for "waiting", 197 times across the app and
         now on the marketing page too. */
      accent: true,
    },
    {
      label: "Waiting on them",
      value: pendingOutgoing,
      href: "/dashboard/inbox",
      empty: "Nothing sent",
      accent: false,
    },
    {
      label: "Confirmed",
      value: confirmed,
      href: `/c/${companySlug}`,
      empty: "None yet",
      accent: false,
    },
    {
      label: "Projects",
      value: caseCount,
      href: "/dashboard/cases",
      empty: "None yet",
      accent: false,
    },
  ];

  /* Nothing to count, nothing to draw. */
  if (items.every((item) => item.value === 0)) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const live = item.accent && item.value > 0;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex min-h-[6.75rem] flex-col rounded-tile border bg-surface px-4 py-4 transition-colors",
              live
                ? "border-ember/45 hover:border-ember"
                : "border-line hover:border-navy/20",
            )}
          >
            <p
              className={cn(
                "text-[11px] font-semibold tracking-[0.16em] uppercase",
                live ? "text-ember-deep" : "text-muted",
              )}
            >
              {item.label}
            </p>
            <p className="mt-2 font-display text-[28px] font-medium tracking-[-0.03em] text-ink tabular-nums">
              {item.value}
            </p>
            {item.value === 0 ? (
              <p className="mt-auto pt-1 text-[12px] text-muted">{item.empty}</p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
