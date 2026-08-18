import { DashboardCtaLink } from "@/components/dashboard/home/dashboard-cta-link";
import type { HomePrimaryAction } from "@/features/dashboard/home-state";

type Props = {
  action: HomePrimaryAction;
  companyId: string;
};

export function HomePrimaryCard({ action, companyId }: Props) {
  return (
    <section className="rounded-[24px] bg-navy px-6 py-7 text-white shadow-[0_20px_50px_rgba(8,20,18,0.18)] sm:px-8">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
        Next
      </p>
      <h2 className="mt-3 font-display text-[clamp(1.4rem,2.5vw,1.85rem)] font-medium leading-[1.15] tracking-[-0.03em]">
        {action.title}
      </h2>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/60">
        {action.body}
      </p>
      <div className="mt-6">
        <DashboardCtaLink
          companyId={companyId}
          ctaId={action.id}
          href={action.href}
          className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-xl bg-white px-5 text-[13px] font-semibold text-ink no-underline transition-colors hover:bg-[#f2f4f2]"
        >
          {action.cta}
        </DashboardCtaLink>
      </div>
    </section>
  );
}
