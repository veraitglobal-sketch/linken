import type { AdminStats } from "@/features/admin/types";

type Props = { stats: AdminStats };

export function AdminStatGrid({ stats }: Props) {
  const items = [
    { label: "Companies", value: stats.companiesTotal, note: `${stats.companiesNewWeek} new this week` },
    { label: "Claimed", value: stats.companiesClaimed, note: "Active workspaces" },
    { label: "Verified", value: stats.companiesVerified, note: "Domain verified" },
    { label: "Testimonials", value: stats.testimonialsPublished, note: `${stats.testimonialsPending} pending` },
    { label: "Partnerships pending", value: stats.partnershipsPending, note: "Awaiting accept" },
    { label: "Confirmations pending", value: stats.confirmationsPending, note: "Case study invites" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-card border border-line bg-surface px-5 py-5 shadow-[0_1px_2px_rgba(8,20,18,0.03)]"
        >
          <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            {item.label}
          </p>
          <p className="mt-3 font-display text-[36px] leading-none font-medium tracking-[-0.04em] text-ink tabular-nums">
            {item.value}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
