import Link from "next/link";

type Props = {
  pendingOutgoing: number;
  pendingIncoming: number;
  confirmedRefs: number;
  confirmedPartners: number;
  caseCount: number;
  companySlug: string;
};

export function HomeStatsRow({
  pendingOutgoing,
  pendingIncoming,
  confirmedRefs,
  confirmedPartners,
  caseCount,
  companySlug,
}: Props) {
  const pending = pendingOutgoing + pendingIncoming;
  const confirmed = confirmedRefs + confirmedPartners;

  const items = [
    {
      label: "Pending",
      value: pending,
      href: "/dashboard/inbox",
      empty: "None waiting",
    },
    {
      label: "Confirmed",
      value: confirmed,
      href: `/c/${companySlug}`,
      empty: "None yet",
    },
    {
      label: "Projects",
      value: caseCount,
      href: "/dashboard/cases",
      empty: "None yet",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex min-h-[6.75rem] flex-col rounded-tile border border-line bg-surface px-4 py-4 transition-colors hover:border-navy/20"
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            {item.label}
          </p>
          <p className="mt-2 font-display text-[28px] font-medium tracking-[-0.03em] text-ink tabular-nums">
            {item.value}
          </p>
          {item.value === 0 ? (
            <p className="mt-auto pt-1 text-[12px] text-muted">{item.empty}</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
