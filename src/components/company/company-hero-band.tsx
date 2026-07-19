import type { Company } from "@/types/company";

type Props = {
  company: Company;
};

export function CompanyHeroBand({ company }: Props) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
        <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
          {company.category} · {company.city}, {company.country}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
          {company.name}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          {company.tagline}
        </p>
      </div>
    </div>
  );
}
