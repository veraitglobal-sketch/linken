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
      label: "Pending invites",
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
      empty: "Add a case study",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-[20px] border border-line bg-surface px-4 py-4 transition-colors hover:border-blue/30"
        >
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            {item.label}
          </p>
          <p className="mt-2 font-display text-[28px] font-medium tracking-[-0.03em] text-ink tabular-nums">
            {item.value}
          </p>
          {item.value === 0 ? (
            <p className="mt-1 text-[12px] text-muted">{item.empty}</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
