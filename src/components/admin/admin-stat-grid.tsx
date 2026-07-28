import type { AdminStats } from "@/features/admin/types";

type Props = { stats: AdminStats };

export function AdminStatGrid({ stats }: Props) {
  const items = [
    { label: "Companies", value: stats.companiesTotal, note: `${stats.companiesNewWeek} new this week` },
    { label: "Claimed", value: stats.companiesClaimed, note: "Active workspaces" },
    { label: "Verified", value: stats.companiesVerified, note: "Domain verified" },
    { label: "Testimonials published", value: stats.testimonialsPublished, note: `${stats.testimonialsPending} pending` },
    { label: "Partnerships pending", value: stats.partnershipsPending, note: "Awaiting accept" },
    { label: "Confirmations pending", value: stats.confirmationsPending, note: "Case study invites" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-line bg-surface px-4 py-4"
        >
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            {item.label}
          </p>
          <p className="mt-2 font-display text-3xl font-medium tracking-[-0.04em]">
            {item.value}
          </p>
          <p className="mt-1 text-[12px] text-ink-soft">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
