import { DashboardCtaLink } from "@/components/dashboard/home/dashboard-cta-link";
import type { HomePrimaryAction } from "@/features/dashboard/home-state";

type Props = {
  action: HomePrimaryAction;
  companyId: string;
};

export function HomePrimaryCard({ action, companyId }: Props) {
  return (
    <section className="rounded-card bg-navy px-6 py-7 text-on-navy shadow-card sm:px-8">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
        Next
      </p>
      <h2 className="mt-3 font-display text-[clamp(1.4rem,2.5vw,1.85rem)] font-medium leading-[1.15] tracking-[-0.03em]">
        {action.title}
      </h2>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-on-navy-muted">
        {action.body}
      </p>
      <div className="mt-6">
        <DashboardCtaLink
          companyId={companyId}
          ctaId={action.id}
          href={action.href}
          className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl bg-surface px-5 text-[13px] font-semibold text-ink no-underline transition-colors hover:bg-paper"
        >
          {action.cta}
        </DashboardCtaLink>
      </div>
    </section>
  );
}
